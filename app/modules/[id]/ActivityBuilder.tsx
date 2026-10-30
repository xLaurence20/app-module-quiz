'use client'
import { useState, useTransition } from 'react'
import { createActivity } from './actions'

export default function ActivityBuilder({ moduleId }: { moduleId: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit() {
    if (!title.trim() || !description.trim()) return
    setError(null)
    start(async () => {
      try {
        await createActivity(moduleId, title, description)
        setTitle('')
        setDescription('')
      } catch (err: any) {
        // This will show the error on the screen instead of crashing the page
        setError(err.message || 'Failed to add activity.')
      }
    })
  }

  return (
    <div className="border border-[#ddd] rounded-lg p-4 space-y-3 bg-white">
      <input 
        className="border border-[#ccc] p-2 w-full rounded" 
        placeholder="Activity Title (e.g., Reflection 1)"
        value={title} onChange={e => setTitle(e.target.value)} 
      />
      <textarea 
        className="border border-[#ccc] p-2 w-full rounded" rows={3}
        placeholder="Instructions or Question for the students..."
        value={description} onChange={e => setDescription(e.target.value)} 
      />
      <button 
        onClick={submit} disabled={pending}
        className="bg-[#7a3e00] text-white px-4 py-2 rounded font-bold disabled:opacity-50"
      >
        {pending ? 'Saving...' : 'Add Activity'}
      </button>
      {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
    </div>
  )
}