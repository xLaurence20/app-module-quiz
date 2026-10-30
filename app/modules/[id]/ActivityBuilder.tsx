'use client'
import { useState, useTransition } from 'react'
import { createActivity } from './actions'

export default function ActivityBuilder({ moduleId }: { moduleId: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pending, start] = useTransition()

  function submit() {
    if (!title.trim() || !description.trim()) return
    start(async () => {
      await createActivity(moduleId, title, description)
      setTitle(''); setDescription('')
    })
  }

  return (
    <div className="border border-[#ddd] rounded-lg p-4 space-y-3 bg-white mt-6">
      <h2 className="font-bold text-[#7a3e00]">Create an Activity</h2>
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
    </div>
  )
}