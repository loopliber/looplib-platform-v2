// app/api/subscribe/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, source, timestamp } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create a subscribers table in Supabase first, or use your email service
    // For now, we'll just log it
    console.log('New subscriber:', { email, source, timestamp });

    // If you have a subscribers table:
    /*
    const { error } = await supabase
      .from('subscribers')
      .insert({
        email,
        source,
        subscribed_at: timestamp
      });

    if (error) throw error;
    */

    // You could also integrate with email services like:
    // - SendGrid
    // - Mailchimp
    // - ConvertKit
    // - etc.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}