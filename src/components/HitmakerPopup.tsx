import React, { useState, useEffect } from 'react';
import { X, Package, Music, Download, Zap, Star, ArrowRight, Clock } from 'lucide-react';

export default function HitmakerPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    // Check if user has seen popup
    const hasSeenPopup = localStorage.getItem('hitmaker-popup-seen');
    const lastSeen = localStorage.getItem('hitmaker-popup-last-seen');
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    // Show popup if never seen or last seen more than 24 hours ago
    if (!hasSeenPopup || (lastSeen && parseInt(lastSeen) < oneDayAgo)) {
      setTimeout(() => setIsOpen(true), 3000); // Show after 3 seconds
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hitmaker-popup-seen', 'true');
    localStorage.setItem('hitmaker-popup-last-seen', Date.now().toString());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative bg-gradient-to-b from-neutral-900 to-black border border-neutral-800 rounded-2xl max-w-lg w-full shadow-2xl animate-slideIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>

          {/* Header Section */}
          <div className="relative overflow-hidden rounded-t-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-red-600/20 to-purple-600/20" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
            
            {/* Content */}
            <div className="relative z-10 p-8 text-center">
              {/* Limited Time Badge */}
              <div className="inline-flex items-center px-3 py-1 bg-red-500/20 border border-red-500 rounded-full text-red-400 text-sm font-medium mb-4 animate-pulse">
                <Zap className="w-4 h-4 mr-1" />
                LIMITED TIME - 75% OFF
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                Hitmaker Bundle
              </h2>
              <p className="text-lg text-neutral-300">
                Everything You Need to Make Professional Beats
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-8 pt-6">
            {/* What's Included */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-medium">300+ Premium Samples with Full Stems</p>
                  <p className="text-sm text-neutral-400">Trap, Soul, R&B & Boom Bap included</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">800 MIDI Chord Progressions</p>
                  <p className="text-sm text-neutral-400">Drag & drop into any DAW</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Instant Download (2.8GB)</p>
                  <p className="text-sm text-neutral-400">Plus mixer presets for FL Studio & Ableton</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Regular Price</p>
                  <p className="text-2xl text-neutral-500 line-through">$199.96</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-400 mb-1">Your Price</p>
                  <p className="text-3xl font-bold text-white">$49.99</p>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    Save $150
                  </div>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 mb-6 text-neutral-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Offer expires in:</span>
              <span className="text-white font-mono">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Reviews */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2 text-sm text-neutral-400">
                4.9/5 (127 Reviews)
              </span>
            </div>

            {/* CTA Button */}
            <a
              href="https://shop.looplib.com/products/hitmaker"
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full"
              onClick={() => {
                // Track conversion
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'conversion', {
                    'send_to': 'GT-M69HVS83/hitmaker-popup-click',
                    'value': 49.99,
                    'currency': 'USD'
                  });
                }
              }}
            >
              <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2">
                <span>Get Instant Access</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>

            {/* Trust Badges */}
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-neutral-500">
              <span>💳 Secure Checkout</span>
              <span>⚡ Instant Download</span>
              <span>✅ Lifetime Access</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </>
  );
}