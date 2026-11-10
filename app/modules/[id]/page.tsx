import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: mod } = await supabase.from('modules').select('*').eq('id', id).single()
  if (!mod) notFound()

  // Helper function to convert standard YouTube links to embed links
  const getEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  }

  return (
    <main className="max-w-[1100px] mx-auto p-4 md:p-6">
      
      <div className="mb-4">
        <Link href="/dashboard?tab=lessons" className="text-sm text-[#7a3e00] hover:underline font-bold">← Back to Lessons</Link>
      </div>

      <div className="bg-white rounded-[15px] p-6 shadow-sm my-4 relative">
        <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">LESSON</span>
        <h2 className="text-2xl text-[#7a3e00] font-bold mb-2">{mod.title}</h2>
        <p className="text-sm text-[#6d625c] mb-4">{mod.description}</p>
      </div>

      {/* VIDEO PLAYER (Supports both File Uploads and Pasted URLs) */}
      {(mod.video_path || mod.video_url) && (
        <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
          <h2 className="text-xl text-[#7a3e00] font-bold mb-4">Video Lesson</h2>
          
          {mod.video_url ? (
            // If it's a YouTube link, render an iframe. Otherwise, render a standard video player.
            mod.video_url.includes('youtube.com') || mod.video_url.includes('youtu.be') ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-[#ddd]">
                <iframe 
                  src={getEmbedUrl(mod.video_url)} 
                  className="w-full h-full" 
                  allowFullScreen 
                  title="Video Lesson"
                />
              </div>
            ) : (
              <video controls className="w-full rounded-lg border border-[#ddd]" src={mod.video_url}>
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            // Otherwise, it's an uploaded file from Supabase Storage
            <video 
              controls 
              className="w-full rounded-lg border border-[#ddd]"
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/modules/${mod.video_path}`}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}

      {/* DOCUMENT CONTENT */}
      <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
        <h2 className="text-xl text-[#7a3e00] font-bold mb-4">Document Content</h2>
        <div className="whitespace-pre-wrap text-[#2d241f] leading-relaxed">
          {mod.content || "No text extracted."}
        </div>
      </div>

    </main>
  )
}