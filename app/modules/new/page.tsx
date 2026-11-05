'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createModule } from './actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewModulePage() {
  const supabase = createClient()
  const router = useRouter()
  
  // 1. All state variables are declared here
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 2. The submit function uses those state variables
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setError('Please select a file')
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // Upload file directly to Supabase Storage (bypasses Vercel 4.5MB limit)
      const filePath = `${user.id}/${crypto.randomUUID()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('modules')
        .upload(filePath, file)

      if (uploadError) throw new Error(uploadError.message)

      // Prepare data for the Server Action
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('filePath', filePath)
      formData.append('fileName', file.name)

      // Call the Server Action to extract text and save to DB
      const result = await createModule(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
      // Note: If successful, the Server Action redirects automatically.

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  // 3. The form UI
  return (
    <main className="max-w-xl mx-auto p-4 md:p-6 mt-4">
      <div className="mb-4">
        <Link href="/dashboard?tab=lessons" className="text-sm text-[#7a3e00] hover:underline font-bold">
          ← Back to Lessons
        </Link>
      </div>

      <div className="bg-white rounded-[15px] p-6 shadow-sm border border-[#ddd]">
        <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">
          TEACHER TOOL
        </span>
        <h1 className="text-2xl text-[#7a3e00] font-bold mb-6">Upload New Module</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Module Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              className="border border-[#ccc] p-3 w-full rounded-lg focus:outline-[#7a3e00]" 
              placeholder="e.g. Introduction to Food Safety"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3} 
              className="border border-[#ccc] p-3 w-full rounded-lg focus:outline-[#7a3e00]" 
              placeholder="Brief description of this module..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">File (PDF, DOCX, or PPTX)</label>
            <input 
              type="file" 
              accept=".pdf,.docx,.pptx" 
              onChange={e => setFile(e.target.files?.[0] || null)} 
              required 
              className="border border-[#ccc] p-3 w-full rounded-lg bg-white" 
            />
            <p className="text-xs text-gray-500 mt-1">
              The AI will extract the text to generate quizzes and tutor students.
            </p>
          </div>
          
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#7a3e00] text-white p-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 mt-4"
          >
            {loading ? 'Uploading & Processing... (Please wait)' : 'Create Module'}
          </button>
        </form>
      </div>
    </main>
  )
}