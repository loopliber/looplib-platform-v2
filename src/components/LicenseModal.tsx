'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample, License } from '@/types';
import { X, Music, Download, Loader2, Check, Mail } from 'lucide-react';
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
  const [downloadingFree, setDownloadingFree] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchLicenses();
    }
  }, [isOpen]);

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('is_active', true) // Only fetch active licenses
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
      const extension = 'mp3'; // Always MP3 for free downloads
      const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
      const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
      const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted} @LOOPLIB.${extension}`;
      
      await downloadFile(sample.file_url, downloadFilename);
      toast.success('MP3 download complete!');
      onClose();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download sample');
    } finally {
      setDownloadingFree(false);
    }
  };

  const handleExclusiveContact = () => {
    const subject = `Exclusive License Request - ${sample?.name}`;
    const body = `Hi LoopLib Team,

I'm interested in purchasing the exclusive license for:

Sample: ${sample?.name}
BPM: ${sample?.bpm}
Key: ${sample?.key}
Genre: ${sample?.genre}

Please provide a quote and next steps.

Thank you!`;

    const mailtoLink = `mailto:support@looplib.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    toast.success('Email client opened - we\'ll respond within 24 hours!');
    onClose();
  };

  if (!isOpen || !sample) return null;

  const freeLicense = licenses.find(l => l.name === 'FREE');
  const exclusiveLicense = licenses.find(l => l.name === 'EXCLUSIVE');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-800">
        {/* Header */}
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
          {/* Sample Details */}
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
          </div>

          {/* License Options */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Choose Your License</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* FREE License */}
              {freeLicense && (
                <div className="relative p-6 rounded-xl border-2 border-neutral-700 bg-neutral-800/30 hover:border-neutral-600 transition-all">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-white mb-2">FREE</h4>
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      $0
                    </div>
                    <p className="text-sm text-neutral-400">{freeLicense.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {freeLicense.features?.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleFreeDownload(sample)}
                    disabled={downloadingFree}
                    className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    {downloadingFree ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Free MP3 Download</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* EXCLUSIVE License */}
              {exclusiveLicense && (
                <div className="relative p-6 rounded-xl border-2 border-orange-500 bg-orange-500/5 transition-all">
                  {/* Popular Badge */}
                  {exclusiveLicense.is_popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-white mb-2">EXCLUSIVE</h4>
                    <div className="text-2xl font-bold text-orange-400 mb-1">
                      QUOTE
                    </div>
                    <p className="text-sm text-neutral-400">{exclusiveLicense.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {exclusiveLicense.features?.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Check className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleExclusiveContact}
                    className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact for Quote</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-neutral-400 border-t border-neutral-800 pt-4 sm:pt-6">
            <p className="mb-2">
              Exclusive licenses include high-quality 32-bit WAV files and full commercial rights.
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