'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample } from '@/types';
import { 
  Heart, Download, ArrowLeft, Calendar, Music,
  TrendingUp, Clock, User, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const WaveformPlayer = dynamic(() => import('./WaveformPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-8 bg-neutral-800 rounded animate-pulse" />
  )
});

interface DashboardProps {
  user: any;
  onBack: () => void;
  onLogout: () => void;
}

export default function Dashboard({ user, onBack, onLogout }: DashboardProps) {
  const [likedSamples, setLikedSamples] = useState<Sample[]>([]);
  const [downloadedSamples, setDownloadedSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'liked' | 'downloads'>('liked');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Only run on client side and when user is available
    if (typeof window !== 'undefined' && user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Even safer approach:
  const fetchUserData = async () => {
    try {
      // Add safety check for browser environment
      if (typeof window === 'undefined') return;
      
      const userIdentifier = localStorage.getItem('user_identifier');
      if (!userIdentifier) return;
      
      // Fetch liked samples with proper typing
      const { data: likedData, error: likedError } = await supabase
        .from('user_likes')
        .select(`
          sample_id,
          samples (
            *,
            artist:artists(*)
          )
        `)
        .eq('user_identifier', userIdentifier);

      if (likedError) throw likedError;
      
      // Safely extract samples with proper type checking
      const liked: Sample[] = [];
      if (likedData) {
        likedData.forEach((item: any) => {
          if (item.samples) {
            liked.push(item.samples);
          }
        });
      }
      setLikedSamples(liked);

      // Fetch download history
      const { data: samplesData, error: samplesError } = await supabase
        .from('samples')
        .select(`
          *,
          artist:artists(*)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (samplesError) throw samplesError;
      setDownloadedSamples(samplesData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (sampleId: string) => {
    if (playingId === sampleId) {
      setPlayingId(null);
    } else {
      setPlayingId(sampleId);
    }
  };

  const renderSampleCard = (sample: Sample) => (
    <div
      key={sample.id}
      className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-400">
            {sample.genre}
          </span>
          {sample.has_stems && (
            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded text-xs font-semibold">
              STEMS
            </span>
          )}
        </div>
        <span className="text-sm text-neutral-400">{sample.bpm} BPM</span>
      </div>
      
      <div className="mb-3">
        <h3 className="font-medium text-white mb-1">{sample.name}</h3>
        <p className="text-sm text-neutral-400">{sample.artist?.name || 'LoopLib'}</p>
      </div>
      
      <div className="mb-3">
        <WaveformPlayer
          url={sample.file_url}
          isPlaying={playingId === sample.id}
          onPlayPause={() => togglePlay(sample.id)}
          height={32}
          waveColor="#525252"
          progressColor="#f97316"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {sample.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 bg-neutral-800 text-xs rounded text-neutral-400">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-neutral-500">{sample.key}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-none mx-auto px-0">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center pl-6 space-x-4">
              <img 
                src="https://www.looplib.com/cdn/shop/files/looplib-logo-loop-kits.png?v=1735326433&width=370"
                alt="LoopLib"
                className="h-8 w-auto"
              />
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Samples</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4 pr-6">
              <div className="flex items-center space-x-2 text-neutral-400">
                <User className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </div>
              <button
                onClick={onLogout}
                className="text-neutral-400 hover:text-white transition-colors flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-neutral-400">
            Manage your liked samples and download history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{likedSamples.length}</p>
                <p className="text-sm text-neutral-400">Liked Samples</p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Download className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{downloadedSamples.length}</p>
                <p className="text-sm text-neutral-400">Downloads</p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Music className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Pro</p>
                <p className="text-sm text-neutral-400">Member Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-neutral-900/50 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('liked')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'liked'
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Liked Samples
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'downloads'
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Recent Downloads
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === 'liked' ? (
              likedSamples.length > 0 ? (
                likedSamples.map(renderSampleCard)
              ) : (
                <div className="col-span-full text-center py-20">
                  <Heart className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">No liked samples yet</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Start exploring and like samples to see them here!
                  </p>
                </div>
              )
            ) : (
              downloadedSamples.length > 0 ? (
                downloadedSamples.map(renderSampleCard)
              ) : (
                <div className="col-span-full text-center py-20">
                  <Download className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">No downloads yet</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Download some samples to see your history here!
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}