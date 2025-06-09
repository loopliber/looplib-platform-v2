// app/api/subscribe/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Function to create Supabase client with error handling
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // Return null during build time
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { email, source, timestamp } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      // If Supabase is not configured, just log the subscription
      console.log('New subscriber (Supabase not configured):', { email, source, timestamp });
      return NextResponse.json({ success: true, message: 'Subscription logged' });
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