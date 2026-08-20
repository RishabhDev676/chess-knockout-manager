import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zplwxcrerblnrgkaxexz.supabase.co').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8uW6ovq5jeR0-ybo2-8Rxw_bBnchh8H').trim();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore if called from Server Component
        }
      },
    },
  });
}
