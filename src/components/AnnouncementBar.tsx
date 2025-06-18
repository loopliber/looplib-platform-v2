// src/components/AnnouncementBar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem('announcement-dismissed');
    if (isDismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('announcement-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
      <Link 
        href="https://shop.looplib.com/products/hitmaker"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 px-4 text-center hover:bg-black/10 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <span className="text-sm sm:text-base font-medium">
            300+ wav samples with stems & drums 78% OFF
          </span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </Link>
      
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/20 rounded-full transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}