'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitQuiz(quizId: string, answers: (number | string)[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: questions, error } = await supabase
    .from('questions').select('id, correct_index')
    .eq('quiz_id', quizId).order('position')
  if (error || !questions) throw new Error('Could not load questions')

  const total = questions.length
  let score = 0
  questions.forEach((q, i) => { if (answers[i] === q.correct_index) score++ })

  const { data: attempt, error: insertError } = await supabase.from('attempts').insert({
    quiz_id: quizId, student_id: user.id, score, total, answers,
  }).select('id').single()

  if (insertError) throw new Error(insertError.message)
  
  return { attemptId: attempt.id, score, total }
}