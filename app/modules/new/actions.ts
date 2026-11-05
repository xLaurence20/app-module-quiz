'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { extractText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'
import officeParser from 'officeparser' // <-- ADD THIS

export async function createModule(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const file = formData.get('file') as File | null

  let file_path: string | null = null
  let content = ''

  if (file && file.size > 0) {
    // 1. Upload file to Supabase Storage
    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage.from('modules').upload(path, file)
    if (error) throw new Error(error.message)
    file_path = path

    // 2. Extract text
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (file.name.endsWith('.pdf')) {
      const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
      const { text } = await extractText(pdf, { mergePages: true })
      content = text
    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer })
      content = result.value
        } else if (file.name.endsWith('.pptx')) {
      // Use the stable v4 API
      content = await officeParser.parseOfficeAsync(buffer)
    } else {
      content = "Preview not available for this file type."
    }
  }

  // 3. Save module to database
  const { data, error } = await supabase
    .from('modules')
    .insert({ teacher_id: user.id, title, description, file_path, content })
    .select('id')
    .single()
    
  if (error) throw new Error(error.message)
  redirect(`/modules/${data.id}`)
}