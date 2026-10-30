'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  // MOVE IT HERE: This ensures it only runs in the browser, not during the build
  const supabase = createClient() 
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setBusy(false); return setError(error.message) }
    } else {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { role: role } }
      })
      if (error) { setBusy(false); return setError(error.message) }
      
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, role: role, email: email })
      }
    }
    
    setBusy(false)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-[15px] shadow-sm border border-[#ddd] p-8 w-full max-w-md">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl text-[#7a3e00] font-bold">
            {mode === 'signin' ? 'Sign in to Module' : 'Create an Account'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Food Services • Grade 9</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Email</label>
            <input 
              className="w-full p-3 border border-[#ccc] rounded-lg focus:outline-[#7a3e00]" 
              type="email" 
              placeholder="student@test.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2d241f] mb-1">Password</label>
            <input 
              className="w-full p-3 border border-[#ccc] rounded-lg focus:outline-[#7a3e00]" 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-bold text-[#2d241f] mb-1">Role</label>
              <select 
                className="w-full p-3 border border-[#ccc] rounded-lg focus:outline-[#7a3e00] bg-white" 
                value={role} 
                onChange={e => setRole(e.target.value as 'student' | 'teacher')}
              >
                <option value="student">I am a Student</option>
                <option value="teacher">I am a Teacher</option>
              </select>
            </div>
          )}

          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          
          <button 
            disabled={busy} 
            className="w-full bg-[#7a3e00] text-white p-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            {busy ? 'Processing...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            className="text-sm text-[#315f8a] hover:underline"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>

      </div>
    </div>
  )
}