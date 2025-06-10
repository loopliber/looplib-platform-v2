// app/api/download/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sampleId, email } = body;

    console.log('Download API called with:', { sampleId, email });

    // Validate input
    if (!sampleId) {
      return NextResponse.json(
        { error: 'Sample ID is required' },
        { status: 400 }
      );
    }

    if (!email || email === 'anonymous@looplib.com') {
      console.log('Anonymous or no email provided, using default');
    }

    // Use service role for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert download record
    const { data, error } = await supabase
      .from('user_downloads')
      .insert({
        user_email: email || 'anonymous@looplib.com',
        sample_id: sampleId,
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        downloaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting download record:', error);
      return NextResponse.json(
        { error: 'Failed to record download', details: error.message },
        { status: 500 }
      );
    }

    console.log('Download recorded successfully:', data);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Failed to record download', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}