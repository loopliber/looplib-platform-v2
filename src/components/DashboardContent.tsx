'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample } from '@/types';
import { 
  Heart, Calendar, Music, User,
  TrendingUp, Clock, Play, Pause, Download,
  BarChart3, Activity, Headphones, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { getUserIdentifier } from '@/utils/user-identity';
import { downloadFile } from '@/lib/download-utils';
import Link from 'next/link';

const WaveformPlayer = dynamic(() => import('./WaveformPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-8 bg-neutral-800 rounded animate-pulse" />
  )
});

interface DashboardContentProps {
  user: any;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [likedSamples, setLikedSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalLikes: 0,
    favoriteGenre: 'N/A',
    avgBpm: 0,
    recentActivity: 0
  });
  const [producerName, setProducerName] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get the consistent user identifier
      const userIdentifier = getUserIdentifier();
      
      // Fetch producer name from profiles table
      if (user?.id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('producer_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileData?.producer_name) {
          setProducerName(profileData.producer_name);
        } else if (user?.user_metadata?.producer_name) {
          setProducerName(user.user_metadata.producer_name);
        }
      }
      
      // Fetch liked samples using the consistent identifier
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
        console.error('Error fetching liked samples:', likedError);
        toast.error('Failed to load liked samples');
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
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (samples: any[]) => {
    if (samples.length === 0) {
      setStats({
        totalLikes: 0,
        favoriteGenre: 'N/A',
        avgBpm: 0,
        recentActivity: 0
      });
      return;
    }

    // Favorite genre
    const genreCounts = samples.reduce((acc: any, sample) => {
      acc[sample.genre] = (acc[sample.genre] || 0) + 1;
      return acc;
    }, {});
    const favoriteGenre = Object.keys(genreCounts).reduce((a, b) => 
      genreCounts[a] > genreCounts[b] ? a : b
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
      favoriteGenre: favoriteGenre.charAt(0).toUpperCase() + favoriteGenre.slice(1),
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
      const userIdentifier = getUserIdentifier();

      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_identifier', userIdentifier)
        .eq('sample_id', sampleId);

      if (error) throw error;

      // Update local state
      const updatedSamples = likedSamples.filter(sample => sample.id !== sampleId);
      setLikedSamples(updatedSamples);
      toast.success('Removed from liked samples');
      
      // Recalculate stats
      calculateStats(updatedSamples);
    } catch (error) {
      console.error('Error removing like:', error);
      toast.error('Failed to remove like');
    }
  };

  const handleDownload = async (sample: Sample) => {
    setDownloadingId(sample.id);
    
    try {
      // Create filename
      const extension = sample.file_url.split('.').pop() || 'mp3';
      const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
      const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
      const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted}_${sample.genre} @LOOPLIB.${extension}`;

      // Download the file
      await downloadFile(sample.file_url, downloadFilename);

      // Track the download
      const userEmail = user?.email || 'anonymous@looplib.com';
      await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sampleId: sample.id,
          email: userEmail
        })
      });

      toast.success('Download complete! Check your downloads folder.');
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download sample');
    } finally {
      setDownloadingId(null);
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
      
      <div className="flex items-center justify-between mb-3">
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
      
      {/* Download Button */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
        <p className="text-xs text-neutral-500">
          Liked {(sample as any).liked_at ? new Date((sample as any).liked_at).toLocaleDateString() : 'Recently'}
        </p>
        <button
          onClick={() => handleDownload(sample)}
          disabled={downloadingId === sample.id}
          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors text-xs font-medium flex items-center space-x-1 disabled:opacity-50"
        >
          {downloadingId === sample.id ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Download className="w-3 h-3" />
          )}
          <span>Download</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {producerName || user?.email?.split('@')[0] || 'Producer'}! 👋
          </h1>
          <p className="text-neutral-400">
            Track your favorite samples and music preferences
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            <Link
              href="/"
              className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors text-left block"
            >
              <Music className="w-6 h-6 text-orange-500 mb-2" />
              <h3 className="font-semibold mb-1">Discover New Samples</h3>
              <p className="text-sm text-neutral-400">Browse our latest collection</p>
            </Link>
            
            <Link
              href="/library"
              className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors text-left block"
            >
              <Download className="w-6 h-6 text-blue-500 mb-2" />
              <h3 className="font-semibold mb-1">My Downloads</h3>
              <p className="text-sm text-neutral-400">View download history</p>
            </Link>
            
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
              <Link
                href="/"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md transition-colors inline-block"
              >
                Browse Samples
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}