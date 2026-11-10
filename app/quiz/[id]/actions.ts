'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitQuiz(quizId: string, answers: (number | string)[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: questions } = await supabase
    .from('questions').select('id, correct_index, question_type')
    .eq('quiz_id', quizId).order('position')
  
  if (!questions) throw new Error('Could not load questions')

  const total = questions.length
  let score = 0

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    // Only auto-grade multiple choice. Leave open-ended for the teacher to read.
    if (q.question_type === 'multiple_choice' && answers[i] === q.correct_index) {
      score++
    }
  }

  const { data: attempt, error } = await supabase.from('attempts').insert({
    quiz_id: quizId, student_id: user.id, score, total, answers,
  }).select('id').single()

  if (error) throw new Error(error.message)
  
  return { attemptId: attempt.id, score, total }
}