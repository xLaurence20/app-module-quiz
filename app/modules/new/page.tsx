'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createModule } from './actions'
import Link from 'next/link'

export default function NewModulePage() {
  const supabase = createClient()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!docFile) return setError('Please select a Document (PDF, DOCX, or PPTX)')
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // 1. Upload Document
      const docPath = `${user.id}/${crypto.randomUUID()}-${docFile.name}`
      const { error: docError } = await supabase.storage.from('modules').upload(docPath, docFile)
      if (docError) throw new Error(docError.message)

      // 2. Upload Video (If provided)
      let videoPath = ''
      if (videoFile) {
        videoPath = `${user.id}/${crypto.randomUUID()}-${videoFile.name}`
        const { error: vidError } = await supabase.storage.from('modules').upload(videoPath, videoFile)
        if (vidError) throw new Error(vidError.message)
      }

      // 3. Send to Server Action
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('filePath', docPath)
      formData.append('fileName', docFile.name)
      formData.append('videoPath', videoPath)

      const result = await createModule(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4 md:p-6 mt-4">
      <div className="mb-4">
        <Link href="/dashboard?tab=lessons" className="text-sm text-[#7a3e00] hover:underline font-bold">← Back to Lessons</Link>
      </div>

      <div className="bg-white rounded-[15px] p-6 shadow-sm border border-[#ddd]">
        <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">TEACHER TOOL</span>
        <h1 className="text-2xl text-[#7a3e00] font-bold mb-6">Upload New Module</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Module Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="border border-[#ccc] p-3 w-full rounded-lg focus:outline-[#7a3e00]" placeholder="e.g. Introduction to Food Safety" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="border border-[#ccc] p-3 w-full rounded-lg focus:outline-[#7a3e00]" placeholder="Brief description of this module..." />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Document File (PDF, DOCX, PPTX)</label>
            <input type="file" accept=".pdf,.docx,.pptx" onChange={e => setDocFile(e.target.files?.[0] || null)} required className="border border-[#ccc] p-3 w-full rounded-lg bg-white" />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Video File (Optional - MP4)</label>
            <input type="file" accept="video/mp4,video/webm" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="border border-[#ccc] p-3 w-full rounded-lg bg-white" />
            <p className="text-xs text-gray-500 mt-1">Upload a lecture video for this module.</p>
          </div>
          
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          
          <button type="submit" disabled={loading} className="w-full bg-[#7a3e00] text-white p-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 mt-4">
            {loading ? 'Uploading... Please wait' : 'Create Module'}
          </button>
        </form>
      </div>
    </main>
  )
}