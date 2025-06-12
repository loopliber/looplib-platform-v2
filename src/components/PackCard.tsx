// src/components/PackCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Pack } from '@/types';
import { Music, Download, Clock } from 'lucide-react';
import Image from 'next/image';

interface PackCardProps {
  pack: Pack;
}

export default function PackCard({ pack }: PackCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Link href={`/packs/${pack.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-all">
        {/* Cover Art */}
        <div className="relative aspect-square">
          <Image
            src={pack.cover_art_url}
            alt={pack.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Sample Count Badge */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
            <span className="text-xs font-medium text-white">
              {pack.sample_count || 0} samples
            </span>
          </div>
          
          {/* Featured Badge */}
          {pack.featured && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500 rounded-md">
              <span className="text-xs font-bold text-white">FEATURED</span>
            </div>
          )}
        </div>
        
        {/* Pack Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-orange-400 transition-colors">
            {pack.name}
          </h3>
          <p className="text-sm text-neutral-400 mb-3">
            {pack.artist?.name || 'Various Artists'}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Music className="w-3 h-3 mr-1" />
                {pack.genre || 'Mixed'}
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(pack.release_date)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}   