'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample, License } from '@/types';
import { X, Music, Download, Loader2, Check, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadFile } from '@/lib/download-utils';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: Sample | null;
  onPurchase: (license: License) => void;
}

export default function LicenseModal({ 
  isOpen, 
  onClose, 
  sample, 
  onPurchase 
}: LicenseModalProps) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [downloadingFree, setDownloadingFree] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchLicenses();
      checkUser();
    }
  }, [isOpen]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLicenses(data || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    }
  };

  const handleFreeDownload = async (sample: Sample) => {
    setDownloadingFree(true);
    try {
      const extension = sample.file_url.split('.').pop() || 'mp3';
      const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
      const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
      const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted} @LOOPLIB.${extension}`;
      
      await downloadFile(sample.file_url, downloadFilename);
      toast.success('Download complete!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download sample');
    } finally {
      setDownloadingFree(false);
    }
  };

  const handlePurchase = async (license: License) => {
    if (!user?.email) {
      toast.error('Please login to purchase');
      return;
    }

    // Add null check for sample
    if (!sample) {
      toast.error('Sample not found');
      return;
    }

    // Skip PaymentModal and go directly to Stripe Checkout
    setPurchasingId(license.id);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId: sample.id,
          licenseId: license.id,
          sampleName: sample.name,
          licenseName: license.name,
          amount: license.price
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(
        ({ loadStripe }) => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      );
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to process payment');
    } finally {
      setPurchasingId(null);
    }
  };

  if (!isOpen || !sample) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-800">
        {/* Header - Mobile Responsive */}
        <div className="relative h-24 sm:h-32 bg-gradient-to-br from-orange-600 via-orange-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 text-white">
            <h2 className="text-xl sm:text-2xl font-bold">{sample.name}</h2>
            <p className="text-sm sm:text-base text-white/80">{sample.artist?.name || 'LoopLib'}</p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Sample Details - Mobile Stacked */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-0">
              <span className="flex items-center space-x-1 text-neutral-400 text-sm">
                <Music className="w-4 h-4" />
                <span>{sample.bpm} BPM</span>
              </span>
              <span className="flex items-center space-x-1 text-neutral-400 text-sm">
                <span>🎹</span>
                <span>{sample.key}</span>
              </span>
              <span className="flex items-center space-x-1 text-neutral-400 text-sm">
                <span>🏷️</span>
                <span>{sample.genre}</span>
              </span>
            </div>
            
            {/* Free Download Button */}
            <button
              onClick={() => handleFreeDownload(sample)}
              disabled={downloadingFree}
              className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {downloadingFree ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Free Download</span>
            </button>
          </div>

          {/* License Grid - Mobile Responsive */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Choose Your License</h3>
            
            {/* Mobile: Single column, Desktop: 2-3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {licenses.map((license) => (
                <div
                  key={license.id}
                  className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    license.is_popular
                      ? 'border-orange-500 bg-orange-500/5'
                      : 'border-neutral-700 bg-neutral-800/30 hover:border-neutral-600'
                  }`}
                  onClick={() => handlePurchase(license)}
                >
                  {/* Popular Badge */}
                  {license.is_popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* License Header */}
                  <div className="text-center mb-4">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-2">{license.name}</h4>
                    <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1">
                      ${license.price}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400">{license.description}</p>
                  </div>

                  {/* Features List - Mobile Optimized */}
                  <ul className="space-y-2 sm:space-y-3 mb-6">
                    {license.features?.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-xs sm:text-sm">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Usage Rights - Mobile Optimized */}
                  <div className="text-xs text-neutral-400 mb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span>Streams: {license.max_streams === -1 ? 'Unlimited' : license.max_streams?.toLocaleString()}</span>
                      <span>Copies: {license.max_copies === -1 ? 'Unlimited' : license.max_copies?.toLocaleString()}</span>
                    </div>
                    {license.max_revenue && (
                      <div className="mt-1">
                        Revenue: ${license.max_revenue.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={() => handlePurchase(license)}
                    disabled={purchasingId === license.id}
                    className={`w-full py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
                      license.is_popular
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                    } disabled:opacity-50`}
                  >
                    {purchasingId === license.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Purchase License</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer - Mobile Responsive */}
          <div className="text-center text-xs sm:text-sm text-neutral-400 border-t border-neutral-800 pt-4 sm:pt-6">
            <p className="mb-2">
              All licenses include high-quality WAV stems and MIDI files.
            </p>
            <p>
              Questions? Contact{' '}
              <a href="mailto:support@looplib.com" className="text-orange-400 hover:underline">
                support@looplib.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}