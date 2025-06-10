'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { X, Loader2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sample, License } from '@/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: Sample | null;
  license: License | null;
  userEmail: string;
  onSuccess: () => void;
}

const CheckoutForm = ({ 
  sample, 
  license, 
  userEmail, 
  onClose, 
  onSuccess 
}: {
  sample: Sample;
  license: License;
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sampleId: sample.id,
            licenseId: license.id,
            userEmail
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast.error('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [sample.id, license.id, userEmail]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) return;

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement!,
        billing_details: {
          email: userEmail,
        },
      }
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setIsLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      toast.success('Payment successful! Check your email for download link.');
      onSuccess();
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-neutral-900 p-4 rounded-lg">
        <h3 className="font-medium mb-2">{sample.name}</h3>
        <p className="text-sm text-neutral-400 mb-2">{license.name}</p>
        <p className="text-lg font-bold text-orange-500">${license.price}</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">
          Card Details
        </label>
        <div className="p-3 border border-neutral-700 rounded-lg bg-neutral-900">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#a3a3a3',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Processing...' : `Pay $${license?.price}`}</span>
        </button>
      </div>
    </form>
  );
};

export default function PaymentModal({
  isOpen,
  onClose,
  sample,
  license,
  userEmail,
  onSuccess
}: PaymentModalProps) {
  if (!isOpen || !sample || !license) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Complete Purchase</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm
            sample={sample}
            license={license}
            userEmail={userEmail}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </Elements>
      </div>
    </div>
  );
}