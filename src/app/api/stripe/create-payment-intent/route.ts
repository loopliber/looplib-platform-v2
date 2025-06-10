import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { sampleId, licenseId, userEmail } = await request.json();

    const supabase = createClient();

    // Get sample and license details
    const [sampleResult, licenseResult] = await Promise.all([
      supabase.from('samples').select('*').eq('id', sampleId).single(),
      supabase.from('licenses').select('*').eq('id', licenseId).single()
    ]);

    if (sampleResult.error || licenseResult.error) {
      return NextResponse.json({ error: 'Sample or license not found' }, { status: 404 });
    }

    const sample = sampleResult.data;
    const license = licenseResult.data;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: license.price * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        sampleId,
        licenseId,
        sampleName: sample.name,
        licenseName: license.name,
        userEmail,
      },
    });

    // Store pending purchase in database
    await supabase.from('purchases').insert({
      user_email: userEmail,
      sample_id: sampleId,
      license_id: licenseId,
      stripe_payment_intent_id: paymentIntent.id,
      amount_paid: license.price * 100,
      status: 'pending'
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}