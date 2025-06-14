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
import { downloadSample } from '@/lib/download-utils';

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
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user?.email) {
        await fetchDownloadHistory(user);
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const fetchDownloadHistory = async (user: any) => {
    try {
      const userEmail = user?.email;
      if (!userEmail) {
        console.log('No user email found');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching downloads for email:', userEmail);

      // First, let's check if there are any downloads for this user
      const { data: downloadCheck, error: downloadCheckError } = await supabase
        .from('user_downloads')
        .select('*')
        .eq('user_email', userEmail)
        .limit(10);
      
      console.log('📥 User downloads found:', downloadCheck);
      
      if (downloadCheckError) {
        console.error('Download check error:', downloadCheckError);
      }

      // Get download history with proper join
      const { data: downloadData, error: downloadError } = await supabase
        .from('user_downloads')
        .select(`
          downloaded_at,
          sample_id,
          samples (
            id,
            name,
            file_url,
            bpm,
            key,
            genre,
            tags,
            has_stems,
            created_at,
            artist_id,
            artists (
              id,
              name
            ),
            pack:primary_pack_id(
              id,
              name,
              slug,
              cover_art_url
            )
          )
        `)
        .eq('user_email', userEmail)
        .order('downloaded_at', { ascending: false });

      console.log('📥 Full download query result:', downloadData);
      console.log('❌ Download error:', downloadError);

      if (downloadError) {
        throw downloadError;
      }

      // Debug: Check what we got
      if (downloadData && downloadData.length > 0) {
        console.log('🔍 First download record:', downloadData[0]);
        console.log('🔍 Sample data in first record:', downloadData[0].samples);
      }

      // Process the data - handle the nested structure properly
      const processedDownloads = downloadData
        ?.filter((item: any) => {
          if (!item.samples) {
            console.warn('⚠️ Download without sample data:', item);
            return false;
          }
          return true;
        })
        ?.map((item: any) => ({
          ...item.samples,
          artist: item.samples.artists, // Map the nested artist
          artwork_url: item.samples.pack?.cover_art_url || null,
          pack_name: item.samples.pack?.name || null,
          pack_slug: item.samples.pack?.slug || null,
          downloaded_at: item.downloaded_at,
          download_count: 1
        })) || [];

      console.log('✅ Processed downloads:', processedDownloads);
      
      // Group by sample_id to remove duplicates and count downloads
      const groupedDownloads: Record<string, DownloadedSample> = processedDownloads.reduce((acc: Record<string, DownloadedSample>, download: any) => {
        const sampleId = download.id;
        
        if (!acc[sampleId]) {
          // First occurrence of this sample
          acc[sampleId] = {
            ...download,
            download_count: 1,
            first_downloaded_at: download.downloaded_at,
            downloaded_at: download.downloaded_at // Keep the most recent download date
          };
        } else {
          // Subsequent occurrence - increment count and update to latest download date
          acc[sampleId].download_count += 1;
          // Keep the most recent download date
          if (new Date(download.downloaded_at) > new Date(acc[sampleId].downloaded_at)) {
            acc[sampleId].downloaded_at = download.downloaded_at;
          }
        }
        
        return acc;
      }, {} as Record<string, DownloadedSample>);

      // Convert back to array with proper typing
      const uniqueDownloads: DownloadedSample[] = Object.values(groupedDownloads);
      console.log('🎯 Unique downloads with counts:', uniqueDownloads);

      setDownloads(uniqueDownloads);

    } catch (error) {
      console.error('💥 Error fetching downloads:', error);
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort downloads
  const filteredDownloads = downloads.filter(sample => {
    const matchesSearch = sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase());
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
      // Use the proper download utility
      await downloadSample(sample, sample.genre);

      // Track re-download
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sampleId: sample.id,
          email: user?.email
        })
      });

      if (!response.ok) {
        console.error('Download tracking failed:', await response.text());
      }

      toast.success('Download started!');
      
      // Refresh to update count
      if (user) {
        fetchDownloadHistory(user);
      }
    } catch (error) {
      console.error('Download error:', error);
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
                    <p className="text-sm text-neutral-400">{sample.artist?.name || 'LoopLib'}</p>
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