import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zplwxcrerblnrgkaxexz.supabase.co').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8uW6ovq5jeR0-ybo2-8Rxw_bBnchh8H').trim();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
