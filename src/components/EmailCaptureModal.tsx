// components/EmailCaptureModal.tsx

import React, { useState } from 'react';
import { X, Music, Download, Sparkles, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  triggerType: 'download_limit' | 'premium_sample' | 'feature_access';
}

export default function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  triggerType 
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const headlines = {
    download_limit: {
      title: "You've discovered great sounds! 🎵",
      subtitle: "Join 10,000+ producers and unlock unlimited downloads",
      benefit: "Get 25 free downloads per month + exclusive samples"
    },
    premium_sample: {
      title: "This is a Premium Sample 👑",
      subtitle: "Get instant access with your email",
      benefit: "Plus weekly exclusive samples before anyone else"
    },
    feature_access: {
      title: "Unlock Pro Features 🚀",
      subtitle: "Take your production to the next level",
      benefit: "Save favorites, download history, and more"
    }
  };

  const content = headlines[triggerType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save to Supabase or your email service
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          source: triggerType,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        localStorage.setItem('producer_email', email);
        localStorage.setItem('email_verified_date', new Date().toISOString());
        onSuccess(email);
        toast.success('Welcome to the LoopLib family! 🎉');
        onClose();
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl max-w-md w-full border border-neutral-800 overflow-hidden">
        {/* Gradient Header */}
        <div className="relative h-32 bg-gradient-to-br from-orange-600 via-orange-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{content.title}</h2>
          <p className="text-neutral-400 mb-6">{content.subtitle}</p>

          {/* Benefits */}
          <div className="bg-neutral-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-200">{content.benefit}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2 text-xs text-neutral-400">
                    <Download className="w-3 h-3" />
                    <span>Instant download access</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-neutral-400">
                    <Mail className="w-3 h-3" />
                    <span>Weekly exclusive samples</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors pr-12"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Unlocking...' : 'Unlock Free Downloads'}
            </button>
          </form>

          <p className="text-xs text-neutral-500 text-center mt-4">
            No spam, unsubscribe anytime. By continuing, you agree to receive 
            marketing emails from LoopLib.
          </p>
        </div>
      </div>
    </div>
  );
}