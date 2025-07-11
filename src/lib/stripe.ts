import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Client-side Stripe instance
export const getStripe = () => {
  if (typeof window === 'undefined') return null;
  
  const stripePromise = import('@stripe/stripe-js').then(
    ({ loadStripe }) => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  );
  
  return stripePromise;
};