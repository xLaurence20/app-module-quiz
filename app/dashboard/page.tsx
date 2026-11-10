import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const instant = false

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const resolvedParams = await searchParams
  const activeTab = resolvedParams.tab || 'home'

  const supabase = await createClient()

  // Fetch all modules
  const { data: modules } = await supabase
    .from('modules').select('id, title, description, created_at').order('created_at', { ascending: false })

  return (
    <main className="max-w-[1100px] mx-auto p-4 md:p-6 min-h-[70vh]">
      
      {/* TOP BAR */}
      <div className="flex justify-between items-center bg-white border-b border-[#ddd] p-4 mb-6 rounded-[15px] shadow-sm">
        <div className="font-bold text-[#7a3e00]">
          Learning Dashboard
        </div>
        <div className="flex items-center gap-4">
          <Link href="/modules/new" className="bg-[#7a3e00] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
            + Upload New Module
          </Link>
        </div>
      </div>

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
          <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">WELCOME</span>
          <h2 className="text-2xl text-[#7a3e00] font-bold mb-2">Welcome to Food Services!</h2>
          <p className="mb-4">Browse the available lessons below or click on the Lessons tab to view all modules and videos.</p>
          <Link href="/dashboard?tab=lessons" className="inline-block bg-[#315f8a] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
            Browse Lessons
          </Link>
        </div>
      )}

      {/* LESSONS TAB */}
      {activeTab === 'lessons' && (
        <>
          <h2 className="text-xl text-[#7a3e00] font-bold mt-4 mb-4">Available Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules?.map(m => (
              <div key={m.id} className="bg-[#f6eadf] p-6 rounded-xl flex flex-col justify-between border border-[#ddd]">
                <div>
                  <h3 className="text-[#663716] font-bold text-lg mb-2">{m.title}</h3>
                  <p className="text-sm text-[#2d241f] line-clamp-2">{m.description || 'No description provided.'}</p>
                </div>
                <Link href={`/modules/${m.id}`} className="mt-4 bg-[#7a3e00] text-white text-center px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
                  Open Lesson
                </Link>
              </div>
            ))}
            {!modules?.length && <p className="text-gray-500 italic">No modules available yet.</p>}
          </div>
        </>
      )}

    </main>
  )
}