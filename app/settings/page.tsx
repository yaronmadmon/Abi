import SettingsScreen from '@/components/settings/SettingsScreen'

export default async function SettingsPage() {
  let email: string | null = null
  let name: string | null = null
  let provider: string | null = null
  let userId: string | null = null

  // Best-effort: if Supabase is configured and a user is signed in, show their info.
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseAnonKey) {
      const { createServerClient } = await import('@/lib/supabase')
      const supabase = createServerClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (user) {
        email = user.email ?? null
        userId = user.id ?? null
        
        // Get name from user metadata or profile
        name = user.user_metadata?.full_name || 
               user.user_metadata?.name || 
               null
        
        // Get login provider
        if (user.identities && user.identities.length > 0) {
          provider = user.identities[0].provider || null
        } else if (user.app_metadata?.provider) {
          provider = user.app_metadata.provider
        }
        
        // If name not in metadata, try to get from profiles table
        if (!name) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single()
            if (profile?.full_name) {
              name = profile.full_name
            }
          } catch {
            // Profile might not exist yet, that's okay
          }
        }
      }
    }
  } catch {
    // Gracefully handle errors
  }

  return <SettingsScreen email={email} name={name} provider={provider} userId={userId} />
}

