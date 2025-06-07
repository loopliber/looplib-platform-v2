'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample, License, Genre, SortBy } from '@/types';
import { 
  Play, Pause, Download, Heart, Search, 
  Music, ShoppingCart, X, Check, Loader2, Filter,
  TrendingUp, Clock, Hash, User, LogOut, Shuffle
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';
import { downloadFile } from '@/lib/download-utils';
import dynamic from 'next/dynamic';
import Dashboard from './Dashboard';
import Link from 'next/link';
import LicenseModal from '@/components/LicenseModal';

// Dynamically import WaveformPlayer to avoid SSR issues
const WaveformPlayer = dynamic(() => import('./WaveformPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-12 bg-neutral-800 rounded animate-pulse" />
  )
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface SampleBrowserProps {
  initialGenre?: Genre;
  pageTitle?: string;
  pageSubtitle?: string;
  accentColor?: string;
  initialSamples?: Sample[]; // Add this
}

export default function SampleBrowser({ 
  initialGenre = 'all', 
  pageTitle,
  pageSubtitle,
  accentColor = 'orange',
  initialSamples = [] // Add this
}: SampleBrowserProps) {
  const [samples, setSamples] = useState<Sample[]>(initialSamples); // Use initial data
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false); // Start as false
  const [selectedGenre, setSelectedGenre] = useState<Genre>(initialGenre);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [likedSamples, setLikedSamples] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [purchasingLicense, setPurchasingLicense] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [displayedSampleCount, setDisplayedSampleCount] = useState(5);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [anonymousDownloads, setAnonymousDownloads] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0); // Key to force re-shuffle
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Add state for mobile sidebar

  const SAMPLES_PER_PAGE = 5;
  const supabase = createClient();

  const genres: { id: Genre; name: string; emoji: string }[] = [
    { id: 'all', name: 'All Genres', emoji: '🎵' },
    { id: 'trap', name: 'Trap', emoji: '🔥' },
    { id: 'rnb', name: 'R&B', emoji: '💫' },
    { id: 'soul', name: 'Soul', emoji: '❤️' },
  ];

  // Initialize
  useEffect(() => {
    if (initialSamples.length === 0) {
      fetchSamples();
    }
    fetchLicenses();
    loadUserLikes();
    checkUser();
    
    // Load localStorage values
    if (typeof window !== 'undefined') {
      setAnonymousDownloads(parseInt(localStorage.getItem('anonymous_downloads') || '0'));
      setDownloadCount(parseInt(localStorage.getItem('download_count') || '0'));
    }
  }, []);

  // Auto-shuffle when filters change
  useEffect(() => {
    setShuffleKey(prev => prev + 1);
    setDisplayedSampleCount(SAMPLES_PER_PAGE);
  }, [selectedGenre, selectedTags]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const fetchSamples = async () => {
    if (initialSamples.length > 0) return; // Skip if we have initial data
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('samples')
        .select(`
          *,
          artist:artists(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      console.error('Error fetching samples:', error);
      toast.error('Failed to load samples');
    } finally {
      setLoading(false);
    }
  };

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLicenses(data || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    }
  };

  const loadUserLikes = async () => {
    const userIdentifier = localStorage.getItem('user_identifier') || generateUserIdentifier();
    
    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('sample_id')
        .eq('user_identifier', userIdentifier);

      if (error) throw error;
      
      const likedIds = new Set(data?.map(like => like.sample_id) || []);
      setLikedSamples(likedIds);
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const generateUserIdentifier = () => {
    if (typeof window === 'undefined') return null;
    
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_identifier', id);
    return id;
  };

  // Filter samples
  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      const matchesGenre = selectedGenre === 'all' || sample.genre === selectedGenre;
      const matchesSearch = searchTerm === '' || 
        sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.artist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => sample.tags.includes(tag));
      
      return matchesGenre && matchesSearch && matchesTags;
    });
  }, [samples, selectedGenre, searchTerm, selectedTags]);

  // Sort and shuffle samples
  const sortedAndShuffledSamples = useMemo(() => {
    let result = [...filteredSamples];
    
    // Apply sorting
    switch(sortBy) {
      case 'popular':
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'bpm':
        result.sort((a, b) => a.bpm - b.bpm);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    // Always shuffle to add randomness
    return shuffleArray(result);
  }, [filteredSamples, sortBy, shuffleKey]);

  const displayedSamples = sortedAndShuffledSamples.slice(0, displayedSampleCount);
  
  // Get all unique tags
  const allTags = useMemo(() => 
    Array.from(new Set(samples.flatMap(s => s.tags))).sort(),
    [samples]
  );

  const togglePlay = (sampleId: string) => {
    setPlayingId(playingId === sampleId ? null : sampleId);
  };

  const toggleLike = async (sampleId: string) => {
    const userIdentifier = localStorage.getItem('user_identifier') || generateUserIdentifier();
    const isLiked = likedSamples.has(sampleId);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_identifier', userIdentifier)
          .eq('sample_id', sampleId);
        
        if (error) throw error;
        
        setLikedSamples(prev => {
          const newSet = new Set(prev);
          newSet.delete(sampleId);
          return newSet;
        });
        toast.success('Removed from liked samples');
      } else {
        const { error } = await supabase
          .from('user_likes')
          .upsert({
            user_identifier: userIdentifier,
            sample_id: sampleId
          }, {
            onConflict: 'user_identifier,sample_id'
          });
        
        if (error) throw error;
        
        setLikedSamples(prev => new Set(prev).add(sampleId));
        toast.success('Added to liked samples');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleFreeDownload = async (sample: Sample) => {
    setDownloadingId(sample.id);
    
    try {
      // Check if user is logged in
      if (!user) {
        if (anonymousDownloads >= 1) {
          setShowAuthModal(true);
          setDownloadingId(null);
          toast.error('Please create an account to continue downloading');
          return;
        }
        
        const newCount = anonymousDownloads + 1;
        setAnonymousDownloads(newCount);
        localStorage.setItem('anonymous_downloads', newCount.toString());
      }

      // Create filename
      const extension = sample.file_url.split('.').pop() || 'mp3';
      const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
      const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
      const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted} @LOOPLIB.${extension}`;
      
      await downloadFile(sample.file_url, downloadFilename);
      
      // Track download
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
      
      // Update download count
      const newCount = downloadCount + 1;
      setDownloadCount(newCount);
      localStorage.setItem('download_count', newCount.toString());
      
      if (!user && anonymousDownloads === 0) {
        toast.success('First download complete! Create an account for unlimited downloads! 🎵', {
          duration: 5000
        });
      }
      
      fetchSamples();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download sample');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLicensePurchase = async (license: License) => {
    if (!selectedSample) return;
    
    setPurchasingLicense(license.id);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId: selectedSample.id,
          licenseId: license.id,
          sampleName: selectedSample.name,
          licenseName: license.name,
          amount: license.price
        })
      });

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to process payment');
    } finally {
      setPurchasingLicense(null);
    }
  };

  const handleRefresh = useCallback(() => {
    setShuffleKey(prev => prev + 1);
    toast.success('🎲 Samples shuffled!', { duration: 1500 });
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleGenreClick = useCallback((genreId: Genre) => {
    setSelectedGenre(genreId);
    setSearchTerm(''); // Clear search when changing genre
  }, []);

  if (showDashboard) {
    return (
      <Dashboard 
        user={user}
        onBack={() => setShowDashboard(false)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Breadcrumb Navigation */}
      {selectedGenre !== 'all' && (
        <div className="bg-neutral-900/30 border-b border-neutral-800 px-6 py-3">
          <nav className="max-w-6xl mx-auto" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-neutral-600">/</li>
              <li>
                <span className="text-neutral-400">Samples</span>
              </li>
              <li className="text-neutral-600">/</li>
              <li>
                <span className="text-white font-medium capitalize">
                  {selectedGenre === 'rnb' ? 'R&B' : selectedGenre}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        {/* Mobile Filter Button */}
        <div className="md:hidden p-4 border-b border-neutral-800">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="flex items-center space-x-2 text-neutral-400 hover:text-white"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {selectedTags.length > 0 && (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                {selectedTags.length}
              </span>
            )}
          </button>
        </div>

        <aside className={`
          fixed md:relative md:block
          ${mobileSidebarOpen ? 'left-0' : '-left-64'}
          w-64 border-r border-neutral-800 bg-neutral-900 md:bg-neutral-900/30 
          min-h-screen p-6 transition-all duration-300 z-30
          md:translate-x-0
        `}>
          {/* Close button for mobile */}
          <div className="md:hidden flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </h2>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 hover:bg-neutral-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </h2>
          
          {/* Genres */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase text-neutral-400 mb-3">Genres</h3>
            <div className="space-y-1">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                    selectedGenre === genre.id
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="font-medium">{genre.name}</span>
                  <span className="text-lg">{genre.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-neutral-400 mb-3">Tags</h3>
            <div className="max-h-60 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-orange-500 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="mt-3 text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                Clear all tags ({selectedTags.length})
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Search & Sort */}
          <div className="border-b border-neutral-800 bg-neutral-900/30 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search samples, artists, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                
                <div className="flex items-center space-x-2 bg-neutral-800 border border-neutral-700 rounded-md">
                  <button 
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-2 transition-colors ${
                      sortBy === 'popular' ? 'text-orange-400' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Popular"
                  >
                    <TrendingUp className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setSortBy('newest')}
                    className={`px-3 py-2 transition-colors ${
                      sortBy === 'newest' ? 'text-orange-400' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Newest"
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setSortBy('bpm')}
                    className={`px-3 py-2 transition-colors ${
                      sortBy === 'bpm' ? 'text-orange-400' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="BPM"
                  >
                    <Hash className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center space-x-2 font-medium"
                  title="Shuffle samples"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Page Titles - Right After Search Section */}
          {pageTitle && (
            <div className="pt-8 pb-6 px-6">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-2 text-white">
                  {pageTitle}
                </h1>
                {pageSubtitle && (
                  <h2 className={`text-xl font-semibold text-${accentColor}-400`}>
                    {pageSubtitle}
                  </h2>
                )}
              </div>
            </div>
          )}

          {/* Samples List */}
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : sortedAndShuffledSamples.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-neutral-400">No samples found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Sample Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayedSamples.map((sample) => (
                      <div key={sample.id} className="group bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 sm:p-4 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all">
                        {/* Mobile-optimized layout */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                            <span className="text-xs sm:text-sm text-neutral-400">{sample.bpm} BPM</span>
                            <span className="text-xs sm:text-sm text-neutral-500">•</span>
                            <span className="text-xs sm:text-sm text-neutral-400">{sample.key}</span>
                          </div>
                          <button
                            onClick={() => toggleLike(sample.id)}
                            className={`self-end sm:self-auto p-2 rounded-md transition-colors ${
                              likedSamples.has(sample.id)
                                ? 'bg-red-500/20 text-red-500' 
                                : 'bg-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedSamples.has(sample.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        
                        {/* Title and artist */}
                        <h3 className="font-medium text-white text-sm sm:text-base mb-1">{sample.name}</h3>
                        <p className="text-xs sm:text-sm text-neutral-400 mb-3">{sample.artist?.name || 'LoopLib'}</p>
                        
                        {/* Waveform */}
                        <div className="mb-4 h-12 sm:h-16">
                          <WaveformPlayer
                            url={sample.file_url}
                            isPlaying={playingId === sample.id}
                            onPlayPause={() => togglePlay(sample.id)}
                            height={48}
                            waveColor="#666666"
                            progressColor="#f97316"
                          />
                        </div>
                        
                        {/* Action buttons - stack on mobile */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                          <div className="flex flex-wrap gap-1">
                            {sample.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-neutral-800 text-xs rounded text-neutral-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFreeDownload(sample)}
                              disabled={downloadingId === sample.id}
                              className="flex-1 sm:flex-none px-3 py-1.5 bg-neutral-800 text-white hover:bg-neutral-700 rounded-md transition-colors flex items-center justify-center space-x-1 text-xs sm:text-sm disabled:opacity-50"
                            >
                              {downloadingId === sample.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                              <span>Free</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedSample(sample);
                                setShowLicenseModal(true);
                              }}
                              className="flex-1 sm:flex-none px-3 py-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded-md transition-colors text-xs sm:text-sm"
                            >
                              License
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {displayedSampleCount < sortedAndShuffledSamples.length && (
                    <div className="flex justify-center pt-8">
                      <button
                        onClick={() => setDisplayedSampleCount(prev => prev + SAMPLES_PER_PAGE)}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                      >
                        Load More ({sortedAndShuffledSamples.length - displayedSampleCount} remaining)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* License Modal */}
      <LicenseModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        sample={selectedSample}
        onPurchase={handleLicensePurchase}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          checkUser();
          setShowAuthModal(false);
        }}
      />
      
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}