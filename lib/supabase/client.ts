import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    "https://xkttyrvburnchkgtmgrq.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdHR5cnZidXJuY2hrZ3RtZ3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjM0NDQsImV4cCI6MjEwODg5OTQ0NH0.nKlpOhf44DRklDjDlrHQEKYWzgUn8WSnpJHZqo8uleo"
  )
}