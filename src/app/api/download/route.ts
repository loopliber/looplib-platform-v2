// app/api/download/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Function to create Supabase client with error handling
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client inside the handler
    const supabase = getSupabaseClient();
    
    const { sampleId, email } = await request.json();

    if (!sampleId) {
      return NextResponse.json(
        { error: 'Sample ID is required' },
        { status: 400 }
      );
    }

    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Record the download
    const { error: downloadError } = await supabase
      .from('user_downloads')
      .insert({
        user_email: email || 'anonymous@looplib.com',
        sample_id: sampleId,
        ip_address: ip
      });

    if (downloadError) {
      console.error('Download recording error:', downloadError);
    }

    // Increment download counter
    const { error: updateError } = await supabase.rpc(
      'increment_sample_downloads',
      { sample_id: sampleId }
    );

    if (updateError) {
      console.error('Counter update error:', updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}