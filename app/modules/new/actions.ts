'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { extractText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'
import JSZip from 'jszip'
import { parseStringPromise } from 'xml2js'

export async function createModule(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const title = String(formData.get('title') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) throw new Error('No file uploaded')

    let file_path: string | null = null
    let content = ''

    // 1. Upload file to Supabase Storage
    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('modules').upload(path, file)
    if (uploadError) throw new Error(uploadError.message)
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
      // Custom PPTX parser (Serverless-safe)
      const zip = await JSZip.loadAsync(buffer)
      let pptxText = ''
      
      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      )
      
      for (const slide of slideFiles) {
        const xmlContent = await zip.file(slide)?.async('string')
        if (xmlContent) {
          const result = await parseStringPromise(xmlContent)
          const texts: string[] = []
          
          const findText = (obj: any) => {
            if (obj['a:t']) texts.push(...obj['a:t'])
            for (const key in obj) {
              if (typeof obj[key] === 'object') findText(obj[key])
            }
          }
          findText(result)
          
          if (texts.length > 0) {
            pptxText += texts.join(' ') + '\n'
          }
        }
      }
      content = pptxText
    } else {
      content = "Preview not available for this file type."
    }

    // 3. Save module to database
    const { data: newModule, error: dbError } = await supabase
      .from('modules')
      .insert({ teacher_id: user.id, title, description, file_path, content })
      .select('id')
      .single()
      
    if (dbError) throw new Error(dbError.message)
    if (!newModule) throw new Error('Failed to create module record')
    
    redirect(`/modules/${newModule.id}`)
    
  } catch (err: any) {
    console.error("Server Action Error:", err)
    // Return the error message to the client instead of crashing
    return { error: err.message || 'Failed to process module.' }
  }
}