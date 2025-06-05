'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample } from '@/types';
import { 
  Heart, ArrowLeft, Calendar, Music, User, LogOut,
  TrendingUp, Clock, Play, Pause, Download, ShoppingCart,
  BarChart3, Activity, Headphones
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
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalLikes: 0,
    favoriteGenre: 'N/A',
    mostLikedArtist: 'N/A',
    avgBpm: 0,
    recentActivity: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const userIdentifier = localStorage.getItem('user_identifier');
      if (!userIdentifier) {
        setLoading(false);
        return;
      }
      
      // Fetch liked samples
      const { data: likedData, error: likedError } = await supabase
        .from('user_likes')
        .select(`
          sample_id,
          created_at,
          samples!inner (
            *,
            artist:artists(*)
          )
        `)
        .eq('user_identifier', userIdentifier)
        .order('created_at', { ascending: false });

      if (likedError) {
        console.error('Liked samples error:', likedError);
      } else {
        const liked = likedData?.map((item: any) => ({
          ...item.samples,
          liked_at: item.created_at
        })) || [];
        setLikedSamples(liked);
        
        // Calculate stats
        calculateStats(liked);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (samples: Sample[]) => {
    if (samples.length === 0) return;

    // Favorite genre
    const genreCounts = samples.reduce((acc: any, sample) => {
      acc[sample.genre] = (acc[sample.genre] || 0) + 1;
      return acc;
    }, {});
    const favoriteGenre = Object.keys(genreCounts).reduce((a, b) => 
      genreCounts[a] > genreCounts[b] ? a : b
    );

    // Most liked artist
    const artistCounts = samples.reduce((acc: any, sample) => {
      const artistName = sample.artist?.name || 'LoopLib';
      acc[artistName] = (acc[artistName] || 0) + 1;
      return acc;
    }, {});
    const mostLikedArtist = Object.keys(artistCounts).reduce((a, b) => 
      artistCounts[a] > artistCounts[b] ? a : b
    );

    // Average BPM
    const avgBpm = Math.round(
      samples.reduce((sum, sample) => sum + sample.bpm, 0) / samples.length
    );

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = samples.filter((sample: any) => 
      sample.liked_at && new Date(sample.liked_at) > weekAgo
    ).length;

    setStats({
      totalLikes: samples.length,
      favoriteGenre,
      mostLikedArtist,
      avgBpm,
      recentActivity
    });
  };

  const togglePlay = (sampleId: string) => {
    if (playingId === sampleId) {
      setPlayingId(null);
    } else {
      setPlayingId(sampleId);
    }
  };

  const removeLike = async (sampleId: string) => {
    try {
      const userIdentifier = localStorage.getItem('user_identifier');
      if (!userIdentifier) return;

      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_identifier', userIdentifier)
        .eq('sample_id', sampleId);

      if (error) throw error;

      setLikedSamples(prev => prev.filter(sample => sample.id !== sampleId));
      toast.success('Removed from liked samples');
      
      // Recalculate stats
      const updatedSamples = likedSamples.filter(sample => sample.id !== sampleId);
      calculateStats(updatedSamples);
    } catch (error) {
      console.error('Error removing like:', error);
      toast.error('Failed to remove like');
    }
  };

  const renderSampleCard = (sample: Sample) => (
    <div
      key={sample.id}
      className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all group"
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
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-400">{sample.bpm} BPM</span>
          <button
            onClick={() => removeLike(sample.id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-all"
            title="Remove from likes"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>
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
        <div className="flex items-center space-x-1">
          <span className="text-xs text-neutral-500">{sample.key}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-neutral-800">
        <p className="text-xs text-neutral-500">
          Liked {(sample as any).liked_at ? new Date((sample as any).liked_at).toLocaleDateString() : 'Unknown date'}
        </p>
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
          <h1 className="text-3xl font-bold mb-2">Your Music Dashboard</h1>
          <p className="text-neutral-400">
            Track your favorite samples and music preferences
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalLikes}</p>
                <p className="text-xs text-neutral-400">Liked Samples</p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Music className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.favoriteGenre}</p>
                <p className="text-xs text-neutral-400">Favorite Genre</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Headphones className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.mostLikedArtist}</p>
                <p className="text-xs text-neutral-400">Top Artist</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.avgBpm}</p>
                <p className="text-xs text-neutral-400">Avg BPM</p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.recentActivity}</p>
                <p className="text-xs text-neutral-400">This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onBack}
              className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors text-left"
            >
              <Music className="w-6 h-6 text-orange-500 mb-2" />
              <h3 className="font-semibold mb-1">Discover New Samples</h3>
              <p className="text-sm text-neutral-400">Browse our latest collection</p>
            </button>
            
            <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg text-left">
              <Heart className="w-6 h-6 text-red-500 mb-2" />
              <h3 className="font-semibold mb-1">Create Playlist</h3>
              <p className="text-sm text-neutral-400">Export your likes (Coming Soon)</p>
            </div>
            
            <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg text-left">
              <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
              <h3 className="font-semibold mb-1">Music Stats</h3>
              <p className="text-sm text-neutral-400">Detailed analytics (Coming Soon)</p>
            </div>
          </div>
        </div>

        {/* Liked Samples */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your Liked Samples ({likedSamples.length})</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : likedSamples.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {likedSamples.map(renderSampleCard)}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 mb-2">No liked samples yet</p>
              <p className="text-sm text-neutral-500 mb-4">
                Start exploring and like samples to see them here!
              </p>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md transition-colors"
              >
                Browse Samples
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}