import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { adminDeleteUser, adminDeleteModule, adminDeleteFeedback } from './actions'

export const instant = false

export default async function AdminPage() {
  // 1. Verify the user is a Super Admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2">You do not have permission to view this page.</p>
        <Link href="/dashboard" className="text-[#7a3e00] underline mt-4 block">Return to Dashboard</Link>
      </div>
    )
  }

  // 2. Fetch ALL data using the Admin Client
  const adminClient = createAdminClient()
  
  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const { data: allProfiles } = await adminClient.from('profiles').select('*')
  const { data: allModules } = await adminClient.from('modules').select('*, profiles!teacher_id(email)')
  const { data: allFeedbacks } = await adminClient.from('feedbacks').select('*, profiles!student_id(email)')
  
  // Combine Auth users with Profiles
  const combinedUsers = users.map(u => ({
    ...u,
    role: allProfiles?.find(p => p.id === u.id)?.role || 'unknown'
  }))

  return (
    <main className="max-w-[1200px] mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center bg-gradient-to-r from-red-800 to-red-600 text-white p-6 rounded-xl shadow-md">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="opacity-90">Manage all users, modules, and data.</p>
        </div>
        <Link href="/dashboard" className="bg-white text-red-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-100">
          Exit to Main App
        </Link>
      </header>

      {/* USERS TABLE */}
      <section className="bg-white rounded-xl shadow-sm border border-[#ddd] overflow-hidden">
        <h2 className="text-xl font-bold p-4 bg-[#f6eadf] text-[#7a3e00]">👥 All Users ({combinedUsers.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {combinedUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold uppercase">{u.role}</span></td>
                  <td className="p-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <form action={async () => {
                      'use server'
                      await adminDeleteUser(u.id)
                    }}>
                      <button className="text-red-600 font-bold hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODULES TABLE */}
      <section className="bg-white rounded-xl shadow-sm border border-[#ddd] overflow-hidden">
        <h2 className="text-xl font-bold p-4 bg-[#f6eadf] text-[#7a3e00]">📚 All Modules ({allModules?.length || 0})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Teacher</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allModules?.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{m.title}</td>
                  <td className="p-3 text-gray-500">{m.profiles?.email}</td>
                  <td className="p-3">
                    <form action={async () => {
                      'use server'
                      await adminDeleteModule(m.id)
                    }}>
                      <button className="text-red-600 font-bold hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FEEDBACK TABLE */}
      <section className="bg-white rounded-xl shadow-sm border border-[#ddd] overflow-hidden">
        <h2 className="text-xl font-bold p-4 bg-[#f6eadf] text-[#7a3e00]">💬 All Feedback ({allFeedbacks?.length || 0})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Ease</th>
                <th className="p-3">Helpful</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allFeedbacks?.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{f.profiles?.email}</td>
                  <td className="p-3 font-bold text-green-600">{f.ease_of_use}</td>
                  <td className="p-3 truncate max-w-xs">{f.helpful_text}</td>
                  <td className="p-3">
                    <form action={async () => {
                      'use server'
                      await adminDeleteFeedback(f.id)
                    }}>
                      <button className="text-red-600 font-bold hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}