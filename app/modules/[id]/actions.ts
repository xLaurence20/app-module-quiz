'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 1. This was missing!
export async function deleteModule(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  
  await supabase.from('modules').delete().eq('id', id)
  
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

type NewQuestion = { 
  prompt: string; 
  question_type: 'multiple_choice' | 'open_ended';
  options: string[]; 
  correct_index: number 
}

export async function createQuiz(moduleId: string, title: string, questions: NewQuestion[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!title.trim() || questions.length === 0) throw new Error('Missing title or questions')

  const { data: quiz, error: qErr } = await supabase
    .from('quizzes')
    .insert({ module_id: moduleId, title: title.trim() })
    .select('id')
    .single()
  if (qErr) throw new Error(qErr.message)

  const rows = questions.map((q, i) => ({
    quiz_id: quiz.id,
    prompt: q.prompt.trim(),
    question_type: q.question_type || 'multiple_choice',
    options: q.question_type === 'open_ended' ? [q.options[0].trim()] : q.options.map(o => o.trim()),
    correct_index: q.question_type === 'open_ended' ? null : q.correct_index,
    position: i,
  }))
  
  const { error } = await supabase.from('questions').insert(rows)
  if (error) throw new Error(error.message)
  revalidatePath(`/modules/${moduleId}`)
}