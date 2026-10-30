import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import QuizRunner from './QuizRunner'

export const instant = false // <-- ADD THIS LINE HERE

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: quiz } = await supabase
    .from('quizzes').select('id, title, module_id').eq('id', id).single()
  if (!quiz) notFound()

    // Select WITHOUT correct_index so it never reaches the browser
  const { data: questions } = await supabase
    .from('questions').select('id, prompt, options, question_type')
    .eq('quiz_id', id).order('position')

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{quiz.title}</h1>
      <QuizRunner quizId={quiz.id} questions={questions ?? []} />
    </main>
  )
}