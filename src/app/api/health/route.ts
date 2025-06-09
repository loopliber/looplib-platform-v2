// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    r2: {
      publicUrl: !!process.env.R2_PUBLIC_URL, // Fixed: removed NEXT_PUBLIC_ prefix
      accountId: !!process.env.R2_ACCOUNT_ID,
      accessKey: !!process.env.R2_ACCESS_KEY_ID,
      secretKey: !!process.env.R2_SECRET_ACCESS_KEY,
      bucketName: !!process.env.R2_BUCKET_NAME,
    },
    google: {
      clientId: !!process.env.GOOGLE_CLIENT_ID,
      clientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    }
  };

  const allSupabaseConfigured = config.supabase.url && config.supabase.anonKey;
  const criticalR2Configured = config.r2.publicUrl;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configured: {
      ...config,
      ready: allSupabaseConfigured && criticalR2Configured
    }
  });
}