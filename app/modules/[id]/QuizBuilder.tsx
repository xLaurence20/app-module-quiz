'use client'
import { useState, useTransition } from 'react'
import { createQuiz } from './actions'

type Q = { 
  prompt: string; 
  question_type: 'multiple_choice' | 'open_ended';
  options: string[]; 
  correct_index: number 
}

const blank = (): Q => ({ 
  prompt: '', 
  question_type: 'multiple_choice', 
  options: ['', '', '', ''], 
  correct_index: 0 
})

export default function QuizBuilder({ moduleId }: { moduleId: string }) {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<Q[]>([blank()])
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function update(i: number, patch: Partial<Q>) {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q))
  }

  function updateOption(i: number, oi: number, value: string) {
    update(i, { options: questions[i].options.map((o, idx) => idx === oi ? value : o) })
  }

  function submit() {
    setError(null)
    start(async () => {
      try {
        await createQuiz(moduleId, title, questions)
        setTitle(''); setQuestions([blank()])
      } catch (e) { setError((e as Error).message) }
    })
  }

  return (
    <div className="border rounded p-4 space-y-4 bg-white shadow-sm">
      <h2 className="font-semibold text-lg text-[#7a3e00]">Build a Quiz</h2>
      
      <input 
        className="border p-2 w-full rounded" 
        placeholder="Quiz title"
        value={title} 
        onChange={e => setTitle(e.target.value)} 
      />

      {questions.map((q, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3 bg-[#faf8f6]">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#7a3e00]">Question {i + 1}</span>
            <div className="flex items-center gap-3">
              <select 
                className="text-sm border p-1 rounded bg-white"
                value={q.question_type}
                onChange={(e) => {
                  const type = e.target.value as 'multiple_choice' | 'open_ended';
                  update(i, { 
                    question_type: type,
                    options: type === 'open_ended' ? [''] : ['', '', '', ''],
                    correct_index: 0
                  })
                }}
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="open_ended">Open-Ended (Paragraph)</option>
              </select>
              
              {questions.length > 1 && (
                <button 
                  type="button"
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => setQuestions(qs => qs.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          
          <input 
            className="border p-2 w-full rounded" 
            placeholder="Type your question here..."
            value={q.prompt} 
            onChange={e => update(i, { prompt: e.target.value })} 
          />

          {q.question_type === 'multiple_choice' ? (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Select the correct answer:</p>
              {q.options.map((o, oi) => (
                <div 
                  key={oi} 
                  onClick={() => update(i, { correct_index: oi })}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer ${
                    q.correct_index === oi ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input type="radio" checked={q.correct_index === oi} onChange={() => {}} className="w-5 h-5 accent-[#39733d]" />
                  <input 
                    className="border p-2 flex-1 rounded bg-white" 
                    placeholder={`Option ${oi + 1}`}
                    value={o} 
                    onChange={e => updateOption(i, oi, e.target.value)}
                    onClick={(e) => e.stopPropagation()} 
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Expected Answer (Grading Key):</p>
              <textarea 
                className="border p-2 w-full rounded bg-white" 
                rows={2}
                placeholder="Type the ideal answer here. The AI will use this to grade the student's response."
                value={q.options[0] || ''} 
                onChange={e => update(i, { options: [e.target.value] })} 
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button type="button" className="border px-4 py-2 rounded hover:bg-gray-50" onClick={() => setQuestions(qs => [...qs, blank()])}>
          + Add question
        </button>
        <button type="button" disabled={pending} className="bg-[#7a3e00] text-white px-4 py-2 rounded disabled:opacity-50" onClick={submit}>
          {pending ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}