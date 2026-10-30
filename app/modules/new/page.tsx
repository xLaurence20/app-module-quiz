import { createModule } from './actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function NewModulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  // FIX: Allow both teachers and super_admins to access this page
  if (profile?.role !== 'teacher' && profile?.role !== 'super_admin') {
    redirect('/dashboard?tab=home')
  }

  return (
    <main className="max-w-xl mx-auto p-4 md:p-6 mt-4">
      <div className="mb-4">
        <Link href="/dashboard?tab=lessons" className="text-sm text-[#7a3e00] hover:underline font-bold">← Back to Lessons</Link>
      </div>

      <div className="bg-white rounded-[15px] p-6 shadow-sm border border-[#ddd]">
        <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">TEACHER TOOL</span>
        <h1 className="text-2xl text-[#7a3e00] font-bold mb-6">Upload New Module</h1>
        
        <form action={createModule} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Module Title</label>
            <input 
              name="title" 
              placeholder="e.g. Introduction to Food Safety" 
              required 
              className="border border-[#ccc] p-3 w-full rounded-lg focus:outline-[#7a3e00]" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Description</label>
            <textarea 
              name="description" 
              placeholder="Brief description of this module..." 
              className="border border-[#ccc] p-3 w-full rounded-lg focus:outline-[#7a3e00]" 
              rows={3} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">File (PDF or DOCX)</label>
            <input 
              name="file" 
              type="file" 
              accept=".pdf,.docx" 
              required 
              className="border border-[#ccc] p-3 w-full rounded-lg bg-white" 
            />
            <p className="text-xs text-gray-500 mt-1">The AI will automatically extract the text from this file to generate quizzes and tutor the students.</p>
          </div>
          
          <button type="submit" className="w-full bg-[#7a3e00] text-white p-3 rounded-lg font-bold hover:opacity-90 transition-opacity mt-4">
            Create Module
          </button>
        </form>
      </div>
    </main>
  )
}