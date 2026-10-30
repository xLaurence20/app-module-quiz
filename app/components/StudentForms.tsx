'use client'
import { useState } from 'react'
import { submitActivity, submitFeedback } from '../dashboard/actions'

export function ActivityForm({ activityId }: { activityId: string }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!content) return
    setLoading(true)
    try {
      await submitActivity(activityId, content)
      setDone(true)
    } catch (e) { alert('Error saving') } finally { setLoading(false) }
  }

  if (done) return <p className="text-[#39733d] font-bold text-sm bg-[#e8f5e9] p-2 rounded">Activity submitted successfully!</p>

  return (
    <div className="mt-3">
      <textarea 
        className="w-full p-2 border border-[#ccc] rounded-lg mb-2" rows={2} 
        placeholder="Type your answer..."
        value={content} onChange={e => setContent(e.target.value)} 
      />
      <button onClick={handleSubmit} disabled={loading} className="bg-[#7a3e00] text-white px-3 py-1 rounded text-sm font-bold disabled:opacity-50">
        {loading ? 'Submitting...' : 'Submit Activity'}
      </button>
    </div>
  )
}

export function FeedbackForm() {
  const [ease, setEase] = useState('Very Easy')
  const [helpful, setHelpful] = useState('')
  const [improve, setImprove] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await submitFeedback(ease, helpful, improve)
      setDone(true)
    } catch (e) { alert('Error saving') } finally { setLoading(false) }
  }

  if (done) return <p className="text-[#39733d] font-bold">Thank you! Your feedback has been saved.</p>

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-bold mb-1">How easy was the module to use?</label>
        <select value={ease} onChange={e => setEase(e.target.value)} className="w-full p-2 border rounded-lg">
          <option>Very Easy</option><option>Easy</option><option>Moderately Easy</option><option>Difficult</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">What part helped you most?</label>
        <textarea value={helpful} onChange={e => setHelpful(e.target.value)} className="w-full p-2 border rounded-lg" rows={2} />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">What should be improved?</label>
        <textarea value={improve} onChange={e => setImprove(e.target.value)} className="w-full p-2 border rounded-lg" rows={2} />
      </div>
      <button onClick={handleSubmit} disabled={loading} className="bg-[#7a3e00] text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50">
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  )
}