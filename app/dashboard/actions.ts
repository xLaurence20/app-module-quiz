'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitActivity(activityId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { error } = await supabase.from('activity_submissions').insert({
    activity_id: activityId, student_id: user.id, content
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function submitFeedback(ease: string, helpful: string, improve: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { error } = await supabase.from('feedbacks').insert({
    student_id: user.id, ease_of_use: ease, helpful_text: helpful, improve_text: improve
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}