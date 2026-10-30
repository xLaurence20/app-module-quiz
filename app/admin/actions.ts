'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function adminDeleteUser(userId: string) {
  const supabase = createAdminClient()
  // Deletes from Auth AND cascades to profiles, modules, etc.
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function adminDeleteModule(moduleId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('modules').delete().eq('id', moduleId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function adminDeleteFeedback(feedbackId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('feedbacks').delete().eq('id', feedbackId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}