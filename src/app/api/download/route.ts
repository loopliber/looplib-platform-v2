// app/api/download/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
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