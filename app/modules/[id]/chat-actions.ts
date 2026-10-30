'use server'
import { createClient } from '@/lib/supabase/server'

export async function askTutor(moduleId: string, question: string, history: { role: string, content: string }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch the module content
  const { data: mod } = await supabase.from('modules').select('title, content').eq('id', moduleId).single()
  if (!mod || !mod.content) throw new Error('Module content not found')

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is missing')

  // The system prompt strictly limits the AI to the document
  const systemPrompt = `You are a helpful AI tutor for the module titled "${mod.title}".
You must answer the student's question using ONLY the following context extracted from the module.
If the answer is not contained within the context, you must reply exactly with: "I cannot answer that based on the provided module material." Do not use outside knowledge.

CONTEXT:
${mod.content.substring(0, 20000)}` // Truncate to avoid token limits

  // Combine system prompt, chat history, and new question
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: question }
  ]

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b', // Using the model we found earlier
      messages: messages,
      temperature: 0.1, // Low temperature for factual answers
    })
  })

  const aiData = await response.json()
  if (aiData.error) throw new Error(aiData.error.message)

  return aiData.choices[0].message.content
}