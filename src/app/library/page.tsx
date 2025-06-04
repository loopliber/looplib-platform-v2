'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample } from '@/types';
import { 
  Download, Clock, Music, Play, Pause, Heart, 
  Search, Filter, Calendar, TrendingUp, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface DownloadedSample extends Sample {
  downloaded_at: string;
  download_count: number;
}

export default function MyLibraryPage() {
  const [downloads, setDownloads] = useState<DownloadedSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'bpm'>('recent');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user?.email) {
      fetchDownloadHistory(user.email);
    } else {
      setLoading(false);
    }
  };

  const fetchDownloadHistory = async (email: string) => {
    try {
      // Get download history
      const { data: downloadData, error: downloadError } = await supabase
        .from('user_downloads')
        .select(`
          downloaded_at,
          sample_id,
          samples (
            *,
            artist:artists(*)
          )
        `)
        .eq('user_email', email)
        .order('downloaded_at', { ascending: false });

      if (downloadError) throw downloadError;

      // Count downloads per sample
      const downloadCounts = downloadData?.reduce((acc: any, item: any) => {
        acc[item.sample_id] = (acc[item.sample_id] || 0) + 1;
        return acc;
      }, {});

      // Get unique samples with their first download date
      const uniqueSamples = downloadData?.reduce((acc: any[], item: any) => {
        if (!acc.find(s => s.id === item.sample_id)) {
          acc.push({
            ...item.samples,
            downloaded_at: item.downloaded_at,
            download_count: downloadCounts[item.sample_id] || 1
          });
        }
        return acc;
      }, []) || [];

      setDownloads(uniqueSamples);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort downloads
  const filteredDownloads = downloads.filter(sample => {
    const matchesSearch = sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.artist?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'all' || sample.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const sortedDownloads = [...filteredDownloads].sort((a, b) => {
    switch(sortBy) {
      case 'recent':
        return new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'bpm':
        return a.bpm - b.bpm;
      default:
        return 0;
    }
  });

  // Get unique genres from downloads
  const genres = ['all', ...new Set(downloads.map(d => d.genre))];

  // Audio playback
  const togglePlay = async (sampleId: string, fileUrl: string) => {
    if (playingId === sampleId) {
      audioElements[sampleId]?.pause();
      setPlayingId(null);
    } else {
      Object.values(audioElements).forEach(audio => audio.pause());
      
      let audio = audioElements[sampleId];
      if (!audio) {
        audio = new Audio(fileUrl);
        audio.addEventListener('ended', () => setPlayingId(null));
        setAudioElements(prev => ({ ...prev, [sampleId]: audio }));
      }
      
      try {
        await audio.play();
        setPlayingId(sampleId);
      } catch (error) {
        toast.error('Failed to play audio');
      }
    }
  };

  const handleRedownload = async (sample: Sample) => {
    try {
      // Track re-download
      await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sampleId: sample.id,
          email: user?.email
        })
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = sample.file_url;
      link.download = `${sample.name} - LoopLib.mp3`;
      link.click();

      toast.success('Download started!');
      
      // Refresh to update count
      if (user?.email) {
        fetchDownloadHistory(user.email);
      }
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
          <h1 className="text-2xl font-bold text-white mb-2">Login to View Your Library</h1>
          <p className="text-neutral-400 mb-4">Track and manage all your downloaded samples</p>
          <Link 
            href="/"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold">LoopLib</h1>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                  Browse
                </Link>
                <Link href="/library" className="text-white font-medium">
                  My Library
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Library</h1>
          <p className="text-neutral-400">
            {downloads.length} samples downloaded • {downloads.reduce((acc, d) => acc + d.download_count, 0)} total downloads
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-neutral-900/50 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Genre Filter */}
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name</option>
              <option value="bpm">BPM</option>
            </select>
          </div>
        </div>

        {/* Downloads Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : sortedDownloads.length === 0 ? (
          <div className="text-center py-20">
            <Download className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
            <p className="text-neutral-400 text-lg">
              {searchTerm || filterGenre !== 'all' 
                ? 'No samples found matching your filters' 
                : 'No downloads yet'}
            </p>
            {downloads.length === 0 && (
              <Link 
                href="/"
                className="mt-4 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg inline-block"
              >
                Browse Samples
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedDownloads.map((sample) => (
              <div
                key={sample.id}
                className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/70 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{sample.name}</h3>
                    <p className="text-sm text-neutral-400">{sample.artist?.name || 'Unknown'}</p>
                  </div>
                  <button
                    onClick={() => togglePlay(sample.id, sample.file_url)}
                    className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors"
                  >
                    {playingId === sample.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-neutral-400 mb-3">
                  <span>{sample.bpm} BPM</span>
                  <span>{sample.key}</span>
                  <span>{sample.genre}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(sample.downloaded_at)}</span>
                    {sample.download_count > 1 && (
                      <span className="text-orange-400">• {sample.download_count}x</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRedownload(sample)}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Download again"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}