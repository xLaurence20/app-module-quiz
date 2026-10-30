import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function ModuleStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify Teacher
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') redirect('/dashboard')

  const { data: mod } = await supabase.from('modules').select('title').eq('id', id).single()
  if (!mod) notFound()

  // Fetch ALL attempts for quizzes belonging to this module
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id, score, total, created_at, profiles!student_id(id, email), quizzes(title)')
    .in('quiz_id', (await supabase.from('quizzes').select('id').eq('module_id', id)).data?.map(q => q.id) || [])
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <Link href={`/modules/${id}`} className="text-sm underline">← Back to Module</Link>
      
      <header>
        <h1 className="text-2xl font-bold">Statistics: {mod.title}</h1>
        <p className="text-gray-500">See how your students are performing.</p>
      </header>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 font-semibold">Student Email</th>
              <th className="p-3 font-semibold">Quiz Title</th>
              <th className="p-3 font-semibold">Score</th>
              <th className="p-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {attempts && attempts.length > 0 ? (
              attempts.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{a.profiles?.email || 'Unknown Student'}</td>
                  <td className="p-3">{a.quizzes.title}</td>
                  <td className="p-3 font-bold text-green-600">{a.score} / {a.total}</td>
                  <td className="p-3 text-gray-400">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">No student attempts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}