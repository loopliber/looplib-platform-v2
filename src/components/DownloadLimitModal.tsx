'use client';

import React from 'react';
import { X, Clock, Zap, Download } from 'lucide-react';
import { getTimeUntilReset, getRemainingDownloads } from '@/utils/download-limit';

interface DownloadLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp?: () => void;
}

export default function DownloadLimitModal({ isOpen, onClose, onSignUp }: DownloadLimitModalProps) {
  if (!isOpen) return null;

  const timeUntilReset = getTimeUntilReset();
  const remaining = getRemainingDownloads();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-700 max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-orange-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Daily Download Limit Reached</h2>
          <p className="text-neutral-400 mb-6">
            You've used all {4 - remaining} of your daily downloads. 
            {timeUntilReset !== "Now" && ` Downloads reset in ${timeUntilReset}.`}
          </p>

          <div className="bg-neutral-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Downloads used today</span>
              <span className="text-sm font-medium">{4 - remaining}/4</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((4 - remaining) / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                if (onSignUp) onSignUp();
              }}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Create Account for More Downloads</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Wait for Reset ({timeUntilReset})</span>
            </button>
          </div>

          <p className="text-xs text-neutral-500 mt-4">
            Create an account to get 4 downloads per day instead of the current limit.
          </p>
        </div>
      </div>
    </div>
  );
}