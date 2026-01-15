import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'

export default async function HomePage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/today')
  } else {
    redirect('/auth/signin')
  }
}
