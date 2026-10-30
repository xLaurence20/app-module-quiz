'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateQuizFromAI(moduleId: string, numQuestions: number) {
  const supabase = await createClient()
  
  // 1. Get the module text
  const { data: mod, error: modError } = await supabase
    .from('modules').select('title, content').eq('id', moduleId).single()
  if (modError || !mod?.content) throw new Error('No module content found')

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is missing from .env.local')

  // 2. Ask Groq (UPDATED PROMPT for both types)
  const prompt = `
    You are an expert teacher. Based on the following text, generate exactly ${numQuestions} questions.
    Make 70% of them multiple-choice and 30% open-ended (paragraph/sentence).
    
    You MUST return ONLY a valid JSON array matching this exact structure:
    [
      {
        "question_type": "multiple_choice",
        "prompt": "The question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_index": 0
      },
      {
        "question_type": "open_ended",
        "prompt": "Explain the concept in your own words?",
        "expected_answer": "A clear, short sentence explaining the concept."
      }
    ]
    
    Do not include markdown formatting like \`\`\`json. Just the raw JSON.
    
    Text:
    ${mod.content.substring(0, 20000)} 
  `

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })
  })

  const aiData = await response.json()
  
  if (aiData.error) {
    throw new Error(`Groq API Error: ${aiData.error.message}`)
  }

  let rawText = aiData.choices[0].message.content
  
  // Clean up any accidental markdown backticks
  rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
  
  let questions
  try {
    // Find the first '[' and last ']' just in case the AI rambled
    const startIndex = rawText.indexOf('[')
    const endIndex = rawText.lastIndexOf(']') + 1
    const jsonString = rawText.substring(startIndex, endIndex)
    questions = JSON.parse(jsonString)
  } catch (e) {
    console.error("Raw AI response:", rawText)
    throw new Error('AI did not return valid JSON. Please try again.')
  }

  // 3. Save the generated quiz
  const { data: quiz, error: qErr } = await supabase
    .from('quizzes')
    .insert({ module_id: moduleId, title: `AI Generated Quiz (${numQuestions} Qs)` })
    .select('id').single()
    
  if (qErr) throw new Error(qErr.message)

  // UPDATED: Map the data correctly for both question types
  const rows = questions.map((q: any, i: number) => ({
    quiz_id: quiz.id,
    prompt: q.prompt,
    question_type: q.question_type || 'multiple_choice',
    // If open-ended, store the expected answer in the options array.
    // Otherwise, store the multiple choice options.
    options: q.question_type === 'open_ended' ? [q.expected_answer] : q.options,
    correct_index: q.question_type === 'open_ended' ? null : q.correct_index,
    position: i,
  }))

  const { error: insertErr } = await supabase.from('questions').insert(rows)
  if (insertErr) throw new Error(insertErr.message)

  revalidatePath(`/modules/${moduleId}`)
}