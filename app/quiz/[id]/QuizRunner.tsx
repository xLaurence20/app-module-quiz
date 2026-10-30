'use client'
import { useState, useTransition } from 'react'
import { submitQuiz } from './actions'
import { useRouter } from 'next/navigation'

type Q = { id: string; prompt: string; options: string[]; question_type: string }

export default function QuizRunner({ quizId, questions }: { quizId: string, questions: Q[] }) {
  const [answers, setAnswers] = useState<(number | string)[]>(questions.map(() => -1))
  const [pending, start] = useTransition()
  const router = useRouter()

  function pick(qi: number, value: number | string) {
    setAnswers(a => a.map((v, i) => i === qi ? value : v))
  }
  
  function submit() {
    start(async () => {
      try {
        await submitQuiz(quizId, answers)
        router.push('/dashboard') 
        router.refresh()
      } catch (e) {
        alert("Error submitting quiz.")
      }
    })
  }

  const allAnswered = answers.every(a => a !== -1 && a !== '')

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={q.id} className="bg-white p-5 rounded-[10px] shadow-sm border border-[#ddd]">
          <p className="font-bold text-[#2d241f] mb-3">{qi + 1}. {q.prompt}</p>
          
          {q.question_type === 'open_ended' ? (
            <textarea
              className="w-full p-3 border border-[#ccc] rounded-[8px] bg-[#faf8f6] focus:outline-[#7a3e00]"
              rows={3}
              placeholder="Type your answer here..."
              value={answers[qi] as string}
              onChange={(e) => pick(qi, e.target.value)}
            />
          ) : (
            <div className="space-y-2">
              {q.options.map((o, oi) => (
                <label key={oi} className="flex items-center gap-3 p-3 border border-[#ddd] rounded-[8px] cursor-pointer hover:bg-[#faf8f6]">
                  <input 
                    type="radio" 
                    name={`q-${qi}`}
                    checked={answers[qi] === oi} 
                    onChange={() => pick(qi, oi)} 
                    className="w-4 h-4 accent-[#7a3e00]"
                  />
                  <span className="text-sm">{o}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      
      <button 
        disabled={!allAnswered || pending} 
        onClick={submit} 
        className="bg-[#7a3e00] text-white px-6 py-3 rounded-[8px] font-bold disabled:opacity-50 w-full transition-opacity"
      >
        {pending ? 'Grading...' : 'Submit Quiz'}
      </button>
      {!allAnswered && <p className="text-sm text-[#6d625c] text-center mt-2">Answer all questions to submit.</p>}
    </div>
  )
}