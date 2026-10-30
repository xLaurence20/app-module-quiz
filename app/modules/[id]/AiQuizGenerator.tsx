'use client'
import { useState, useTransition } from 'react'
import { generateQuizFromAI } from './ai-actions'

export default function AiQuizGenerator({ moduleId }: { moduleId: string }) {
  const [numQuestions, setNumQuestions] = useState(5)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleGenerate() {
    setError(null)
    start(async () => {
      try {
        await generateQuizFromAI(moduleId, numQuestions)
      } catch (e: any) {
        setError(e.message || 'Failed to generate quiz.')
      }
    })
  }

  return (
    <div className="border-2 border-blue-200 bg-blue-50 rounded p-4 space-y-4">
      <div>
        <h2 className="font-semibold text-lg text-blue-900">✨ Auto-Generate Quiz</h2>
        <p className="text-sm text-blue-700">Let AI read the module and create the quiz for you.</p>
      </div>
      
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Number of questions:</label>
        <input 
          type="number" 
          min={1} max={20}
          value={numQuestions} 
          onChange={e => setNumQuestions(Number(e.target.value))}
          className="border p-2 rounded w-20"
        />
        <button 
          disabled={pending}
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 font-medium"
        >
          {pending ? 'Generating (this takes ~10s)...' : 'Generate Quiz'}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}