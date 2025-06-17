// src/components/TermsModal.tsx
'use client';

import React from 'react';
import { X, FileText, Users, DollarSign, CheckCircle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleName: string;
}

export default function TermsModal({ isOpen, onClose, sampleName }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full animate-in slide-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Terms of Use</h2>
                <p className="text-sm text-neutral-400">{sampleName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Collaboration Requirement */}
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">Collaboration Required</h3>
                  <p className="text-sm text-neutral-300 mb-3">
                    To use this sample, you must add <span className="text-orange-400 font-medium">@looplib</span> as a collaborator on:
                  </p>
                  <ul className="space-y-1 text-sm text-neutral-400">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>BeatStars</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Airbit</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Traktrain</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Revenue Split */}
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">Revenue Split</h3>
                  <div className="flex items-center justify-between bg-neutral-900 rounded-lg p-3">
                    <span className="text-sm text-neutral-300">Producer (You)</span>
                    <span className="text-lg font-bold text-white">50%</span>
                  </div>
                  <div className="flex items-center justify-between bg-neutral-900 rounded-lg p-3 mt-2">
                    <span className="text-sm text-neutral-300">LoopLib</span>
                    <span className="text-lg font-bold text-white">50%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-sm text-orange-200">
                By downloading and using this sample, you agree to these terms. This ensures fair collaboration and proper credit for all parties involved.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </>
  );
}