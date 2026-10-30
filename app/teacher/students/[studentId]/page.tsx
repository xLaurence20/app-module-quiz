import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify Teacher
  const { data: teacherProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (teacherProfile?.role !== 'teacher') redirect('/dashboard')

  // Fetch Student Info
  const { data: student } = await supabase.from('profiles').select('email').eq('id', studentId).single()
  if (!student) notFound()

  // Fetch all attempts by this student for this teacher's modules
  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, quizzes(title, module_id, modules(teacher_id))')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  // Filter to only show attempts on THIS teacher's modules
  const teacherAttempts = attempts?.filter((a: any) => 
    a.quizzes?.modules?.teacher_id === user.id
  ) || []

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <Link href="/dashboard" className="text-sm underline">← Back to Dashboard</Link>
      
      <header>
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <p className="text-gray-600">Email: {student.email}</p>
        <p className="text-gray-600">Total Attempts on your quizzes: {teacherAttempts.length}</p>
      </header>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Quiz Title</th>
              <th className="p-3">Score</th>
              <th className="p-3">Date Taken</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {teacherAttempts.length > 0 ? teacherAttempts.map((a: any) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{a.quizzes.title}</td>
                <td className="p-3 font-bold text-green-600">{a.score} / {a.total}</td>
                <td className="p-3 text-gray-500">{new Date(a.created_at).toLocaleString()}</td>
                <td className="p-3">
                  <Link href={`/quiz/attempt/${a.id}`} className="text-blue-600 hover:underline">
                    View Answers
                  </Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">This student hasn't taken any of your quizzes yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}