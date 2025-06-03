// app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      // Record the purchase
      const { error } = await supabase.from('user_purchases').insert({
        user_email: session.customer_details?.email || 'unknown@email.com',
        sample_id: session.metadata?.sampleId,
        license_id: session.metadata?.licenseId,
        stripe_payment_id: session.payment_intent as string,
        amount: session.amount_total! / 100, // Convert from cents
      });

      if (error) {
        console.error('Failed to record purchase:', error);
      }

      // Send license email here (implement based on your email service)
      // await sendLicenseEmail(session);

    } catch (error) {
      console.error('Error processing successful payment:', error);
    }
  }

  return NextResponse.json({ received: true });
}