import { createBrowserClient as createClient } from "@supabase/ssr"

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'Prefer': 'return=representation'
        }
      }
    }
  )
}
