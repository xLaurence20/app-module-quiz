'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { extractText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'
import JSZip from 'jszip'
import { parseStringPromise } from 'xml2js'

// ... (keep imports the same) ...

export async function createModule(formData: FormData) {
  let redirectUrl = ''
  try {
    const supabase = await createClient()

    const title = String(formData.get('title') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const filePath = String(formData.get('filePath') ?? '').trim()
    const fileName = String(formData.get('fileName') ?? '').trim()
    const videoPath = String(formData.get('videoPath') ?? '').trim() || null
    const videoUrl = String(formData.get('videoUrl') ?? '').trim() || null // <-- ADD THIS

    if (!filePath) throw new Error('No document uploaded')

    let content = ''
    const { data: fileData } = await supabase.storage.from('modules').download(filePath)
    if (fileData) {
      // ... (keep the text extraction logic the same) ...
    }

    // Save to database with videoUrl
    const { data: newModule, error: dbError } = await supabase
      .from('modules')
      .insert({ 
        title, 
        description, 
        file_path: filePath, 
        content,
        video_path: videoPath,
        video_url: videoUrl // <-- ADD THIS
      })
      .select('id')
      .single()
      
    if (dbError) throw new Error(dbError.message)
    if (!newModule) throw new Error('Failed to create module')
    
    redirectUrl = `/modules/${newModule.id}`
  } catch (err: any) {
    return { error: err.message || 'Failed to process module.' }
  }
  if (redirectUrl) redirect(redirectUrl)
}