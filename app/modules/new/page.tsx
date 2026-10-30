import { createModule } from './actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const instant = false

export default async function NewModulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // If not logged in, go to login
  if (!user) redirect('/login')

  // Check Role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  // If they are not a teacher, kick them back to the dashboard
  if (profile?.role !== 'teacher') {
    redirect('/dashboard')
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">New module</h1>
      <form action={createModule} className="space-y-3">
        <input name="title" placeholder="Module title" required
          className="border p-2 w-full rounded" />
        <textarea name="description" placeholder="Description (optional)"
          className="border p-2 rounded w-full" rows={3} />
        <input name="file" type="file" accept=".pdf,.docx,.txt,.pptx" required
          className="border p-2 w-full rounded" />
        <button className="bg-black text-white p-2 rounded">Create module</button>
      </form>
    </main>
  )
}