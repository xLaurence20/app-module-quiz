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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const title = String(formData.get('title') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const filePath = String(formData.get('filePath') ?? '').trim()
    const fileName = String(formData.get('fileName') ?? '').trim()

    if (!filePath) throw new Error('No file uploaded')

    let content = ''

    // 1. Download file from Supabase Storage to extract text
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('modules')
      .download(filePath)

    if (downloadError) throw new Error('Failed to download file for processing')

    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 2. Extract text based on file extension
    try {
      if (fileName.endsWith('.pdf')) {
        const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
        const { text } = await extractText(pdf, { mergePages: true })
        content = text
      } else if (fileName.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer })
        content = result.value
      } else if (fileName.endsWith('.pptx')) {
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
    } catch (err) {
      console.error("Extraction Error:", err)
      content = "Failed to extract text from this document."
    }

    // 3. Save module to database
    const { data: newModule, error: dbError } = await supabase
      .from('modules')
      .insert({ teacher_id: user.id, title, description, file_path: filePath, content })
      .select('id')
      .single()
      
    if (dbError) throw new Error(dbError.message)
    if (!newModule) throw new Error('Failed to create module record')
    
    // Set the URL, but don't redirect yet!
    redirectUrl = `/modules/${newModule.id}`
    
  } catch (err: any) {
    console.error("Server Action Error:", err)
    return { error: err.message || 'Failed to process module.' }
  }

  // 4. Redirect OUTSIDE the try/catch so Next.js can handle it properly
  if (redirectUrl) {
    redirect(redirectUrl)
  }
}