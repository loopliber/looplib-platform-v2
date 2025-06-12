// lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, return a dummy client if env vars are not set
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      console.warn('Supabase environment variables not set. Using dummy client for build.');
      return null as any;
    }
    throw new Error('Supabase environment variables are required');
  }

  // Create and store the instance
  supabaseInstance = createSupabaseClient(
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

  return supabaseInstance;
}