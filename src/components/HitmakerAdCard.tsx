// components/HitmakerAdCard.tsx
'use client';

import React from 'react';
import { ShoppingBag, Sparkles, Package, ArrowRight } from 'lucide-react';

export default function HitmakerAdCard() {
  return (
    <a
      href="https://www.looplib.com/hitmaker"
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg p-4 hover:from-purple-900/70 hover:to-pink-900/70 hover:border-purple-500/50 transition-all overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500" />
        </div>
        
        {/* Promo badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
            LIMITED OFFER
          </span>
        </div>
        
        <div className="relative z-10 flex gap-3">
          {/* Product image */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-black">
              <img 
                src="https://cdn.shopify.com/s/files/1/0816/1257/0973/files/hitmaker-bundle-popup.webp" 
                alt="Hitmaker Bundle"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-purple-400">HITMAKER BUNDLE</span>
                <span className="text-sm text-neutral-500">•</span>
                <span className="text-sm text-neutral-400">300+ Samples</span>
              </div>
            </div>
            
            {/* Title and description */}
            <h3 className="font-bold text-white text-base mb-1">Make Beats Like The Pros</h3>
            <p className="text-sm text-neutral-300 mb-3">
              Industry-quality stems, drums & chord progressions
            </p>
            
            {/* Features highlight */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-neutral-400">With Stems</span>
              </div>
              <div className="flex items-center space-x-1">
                <ShoppingBag className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-neutral-400">Instant Download</span>
              </div>
            </div>
            
            {/* CTA section */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-500 line-through">$199</span>
                <span className="text-lg font-bold text-white ml-2">$49.99</span>
                <span className="text-xs text-green-400 ml-2">78% OFF</span>
              </div>
              
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md transition-all flex items-center space-x-2 text-sm font-medium group-hover:scale-105">
                <span>Get Bundle</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}