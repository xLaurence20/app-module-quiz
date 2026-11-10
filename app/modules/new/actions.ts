'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { extractText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'
import JSZip from 'jszip'
import { parseStringPromise } from 'xml2js'

export async function createModule(formData: FormData) {
  let redirectUrl = ''
  try {
    const supabase = await createClient()

    const title = String(formData.get('title') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const filePath = String(formData.get('filePath') ?? '').trim()
    const fileName = String(formData.get('fileName') ?? '').trim()
    const videoPath = String(formData.get('videoPath') ?? '').trim() || null
    const videoUrl = String(formData.get('videoUrl') ?? '').trim() || null

    // NEW VALIDATION: Ensure at least one thing was uploaded
    if (!filePath && !videoPath && !videoUrl) {
      throw new Error('You must provide at least a document or a video.')
    }

    let content = ''
    
    // ONLY extract text if a document was uploaded
    if (filePath) {
      const { data: fileData } = await supabase.storage.from('modules').download(filePath)
      if (fileData) {
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        try {
          if (fileName.endsWith('.pdf')) {
            const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
            const { text } = await extractText(pdf, { mergePages: true })
            content = text
          } else if (fileName.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer })
            content = result.value
          } else if (fileName.endsWith('.pptx')) {
            const zip = await JSZip.loadAsync(buffer)
            let pptxText = ''
            const slideFiles = Object.keys(zip.files).filter(n => n.startsWith('ppt/slides/slide') && n.endsWith('.xml'))
            for (const slide of slideFiles) {
              const xml = await zip.file(slide)?.async('string')
              if (xml) {
                const result = await parseStringPromise(xml)
                const texts: string[] = []
                const findText = (o: any) => { if (o['a:t']) texts.push(...o['a:t']); for (const k in o) { if (typeof o[k] === 'object') findText(o[k]) } }
                findText(result)
                if (texts.length) pptxText += texts.join(' ') + '\n'
              }
            }
            content = pptxText
          }
        } catch (e) { content = "Could not extract text preview." }
      }
    }

    // Save to database (handles nulls properly)
    const { data: newModule, error: dbError } = await supabase
      .from('modules')
      .insert({ 
        title, 
        description, 
        file_path: filePath || null, 
        content: content || null,
        video_path: videoPath,
        video_url: videoUrl
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