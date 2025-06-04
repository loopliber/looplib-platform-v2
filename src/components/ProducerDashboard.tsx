// components/ProducerDashboard.tsx

import React from 'react';
import { Download, Heart, Clock, TrendingUp, Zap, Award } from 'lucide-react';

interface ProducerStats {
  downloads: number;
  favorites: number;
  lastVisit: string;
  preferredGenre: string;
  credits: number;
  streak: number;
}

export default function ProducerDashboard({ stats }: { stats: ProducerStats }) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Producer Stats</h3>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{stats.credits} Credits</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-neutral-400 mb-1">
            <Download className="w-4 h-4" />
            <span className="text-xs">Downloads</span>
          </div>
          <p className="text-xl font-bold">{stats.downloads}</p>
        </div>

        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-neutral-400 mb-1">
            <Heart className="w-4 h-4" />
            <span className="text-xs">Favorites</span>
          </div>
          <p className="text-xl font-bold">{stats.favorites}</p>
        </div>

        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-neutral-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Your Style</span>
          </div>
          <p className="text-xl font-bold">{stats.preferredGenre}</p>
        </div>

        <div className="bg-neutral-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-neutral-400 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs">Streak</span>
          </div>
          <p className="text-xl font-bold">{stats.streak} days</p>
        </div>
      </div>

      {/* Progress to next tier */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-neutral-400">Progress to Gold Producer</span>
          <span className="text-neutral-400">{stats.downloads}/100</span>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
            style={{ width: `${(stats.downloads / 100) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}