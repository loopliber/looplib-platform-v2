// lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Reset any stale instances when the module loads
if (typeof window !== 'undefined' && window.location.search.includes('session_id')) {
  // Clear any stale auth data when returning from Stripe
  localStorage.removeItem('looplib-auth-token');
}

export function createClient() {
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

  // Always create a fresh instance - don't cache
  const client = createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        storageKey: 'looplib-auth-token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
      },
      // Add request retry logic
      global: {
        headers: {
          'x-client-info': 'looplib-web',
        },
      },
      // Disable real-time subscriptions to prevent memory leaks
      realtime: {
        params: {
          eventsPerSecond: 0,
        },
      },
    }
  );

  return client;
}