// lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, return a dummy client if env vars are not set
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // Server-side during build
      console.warn('Supabase environment variables not set. Using dummy client for build.');
      return null as any;
    }
    throw new Error('Supabase environment variables are required');
  }

  return createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        storageKey: 'looplib-auth-token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  );
}