import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QuizBuilder from './QuizBuilder'
import AiQuizGenerator from './AiQuizGenerator'
import Link from 'next/link'
import { deleteModule } from './actions'
import AIChat from './AIChat'
import ActivityBuilder from './ActivityBuilder'

export const instant = false

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isTeacher = profile?.role === 'teacher'

  const { data: mod } = await supabase.from('modules').select('*').eq('id', id).single()
  if (!mod) notFound()

  const { data: quizzes } = await supabase.from('quizzes').select('id, title').eq('module_id', id).order('created_at')
  const isOwner = mod.teacher_id === user.id

  return (
    <main className="max-w-[1100px] mx-auto p-4 md:p-6">
      
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm text-[#7a3e00] hover:underline font-bold">← Back to Dashboard</Link>
      </div>

      <div className="bg-white rounded-[15px] p-6 shadow-sm my-4 relative">
        <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">LESSONS</span>
        <h2 className="text-2xl text-[#7a3e00] font-bold mb-2">{mod.title}</h2>
        <p className="text-sm text-[#6d625c] mb-4">{mod.description}</p>
        
        {isOwner && (
          <div className="flex gap-4 mb-4">
            <Link href={`/modules/${id}/stats`} className="bg-[#315f8a] text-white px-4 py-2 rounded-lg text-sm font-bold">📊 Student Stats</Link>
            <Link href={`/modules/${id}/edit`} className="bg-[#d98b3a] text-white px-4 py-2 rounded-lg text-sm font-bold">Edit Module</Link>
            <ActivityBuilder moduleId={mod.id} /> right below <QuizBuilder moduleId={mod.id} />
            <form action={deleteModule}>
              <input type="hidden" name="id" value={id} />
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Delete</button>
            </form>
          </div>
        )}
      </div>

      {/* MODULE CONTENT (Lesson) */}
      <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
        <h2 className="text-xl text-[#7a3e00] font-bold mb-4">Module Content</h2>
        <div className="whitespace-pre-wrap text-[#2d241f] leading-relaxed">
          {mod.content || "No text extracted."}
        </div>
      </div>

      {/* AI SUPPORT */}
      <div className="bg-[#f0f6fc] border-l-4 border-[#315f8a] p-6 rounded-[15px] my-4 shadow-sm">
        <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-2">AI LEARNING SUPPORT</span>
        <h2 className="text-xl text-[#315f8a] font-bold mb-2">Ask for an Explanation</h2>
        <p className="text-sm mb-4">Type a Food Services concept or procedure you find difficult. This prototype provides a guided response.</p>
        <AIChat moduleId={mod.id} />
      </div>

      {/* TEACHER TOOLS */}
      {isOwner && (
        <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
          <h2 className="text-xl text-[#7a3e00] font-bold mb-4">Teacher Tools</h2>
          <AiQuizGenerator moduleId={mod.id} />
          <QuizBuilder moduleId={mod.id} />
        </div>
      )}

      {/* QUIZZES LIST */}
      <h2 className="text-xl text-[#7a3e00] font-bold mt-8 mb-4">Quizzes</h2>
      <div className="space-y-3">
        {quizzes?.length ? quizzes.map(q => (
          <Link key={q.id} href={`/quiz/${q.id}`} className="block bg-white rounded-xl p-4 shadow-sm border border-[#ddd] hover:border-[#d98b3a] transition-colors text-[#7a3e00] font-bold">
            {q.title} →
          </Link>
        )) : <p className="text-gray-500 italic">No quizzes available yet.</p>}
      </div>

    </main>
  )
}