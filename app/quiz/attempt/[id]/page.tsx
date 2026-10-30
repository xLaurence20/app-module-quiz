import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function ReviewAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the attempt
  const { data: attempt } = await supabase
    .from('attempts')
    .select('*, quizzes(title)')
    .eq('id', id)
    .single()

  if (!attempt) notFound()

  // Fetch the questions
  const { data: questions } = await supabase
    .from('questions')
    .select('id, prompt, options, correct_index')
    .eq('quiz_id', attempt.quiz_id)
    .order('position')

  const studentAnswers: number[] = attempt.answers

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href="/dashboard" className="text-sm underline">← Back to Dashboard</Link>
      
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold">Review: {attempt.quizzes.title}</h1>
        <p className="text-lg">
          Score: <span className={attempt.score === attempt.total ? "text-green-600 font-bold" : "text-blue-600 font-bold"}>
            {attempt.score} / {attempt.total}
          </span>
        </p>
      </header>

      <div className="space-y-6">
                {questions?.map((q: any, i: number) => {
          const studentAnswer = studentAnswers[i]
          const isOpenEnded = q.question_type === 'open_ended'
          const isCorrect = isOpenEnded 
            ? false // We don't store which specific open-ended ones were correct, just the total score
            : studentAnswer === q.correct_index

          return (
            <div key={q.id} className="border p-4 rounded-lg bg-white shadow-sm">
              <h3 className="font-semibold mb-3">Q{i + 1}. {q.prompt}</h3>
              
              {isOpenEnded ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-800 font-bold mb-1">Your Answer:</p>
                    <p className="text-sm">{studentAnswer || '(No answer provided)'}</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-800 font-bold mb-1">Expected Answer:</p>
                    <p className="text-sm">{q.options[0]}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {q.options.map((opt: string, optIndex: number) => {
                    let bgClass = "bg-white border-gray-200"
                    let textClass = "text-gray-700"
                    if (optIndex === q.correct_index) {
                      bgClass = "bg-green-100 border-green-500"
                      textClass = "text-green-900 font-medium"
                    } else if (optIndex === studentAnswer) {
                      bgClass = "bg-red-100 border-red-500"
                      textClass = "text-red-900"
                    }
                    return (
                      <div key={optIndex} className={`p-2 border rounded ${bgClass} ${textClass}`}>
                        {opt}
                        {optIndex === q.correct_index && <span className="ml-2 text-xs text-green-700">(Correct)</span>}
                        {!isCorrect && optIndex === studentAnswer && <span className="ml-2 text-xs text-red-700">(Your Answer)</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}