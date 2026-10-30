import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function EditModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: mod } = await supabase.from('modules').select('*').eq('id', id).single()
  if (!mod || mod.teacher_id !== user.id) notFound()

  async function updateModule(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const supabaseServer = await createClient()
    
    await supabaseServer.from('modules').update({ title, description }).eq('id', id)
    redirect(`/modules/${id}`)
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <Link href={`/modules/${id}`} className="text-sm underline">← Back to Module</Link>
      <h1 className="text-2xl font-bold">Edit Module</h1>
      
      <form action={updateModule} className="space-y-3">
        <label className="block text-sm font-medium">Module Title</label>
        <input name="title" defaultValue={mod.title} required className="border p-2 w-full rounded" />
        
        <label className="block text-sm font-medium">Description</label>
        <textarea name="description" defaultValue={mod.description} className="border p-2 rounded w-full" rows={3} />
        
        <button className="bg-black text-white p-2 rounded w-full">Save Changes</button>
      </form>
    </main>
  )
}