// components/SampleBrowser.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample, License, Genre, SortBy } from '@/types';
import { 
  Play, Pause, Download, Heart, Search, ChevronDown, 
  Music, ShoppingCart, X, Check, Loader2, Filter,
  TrendingUp, Clock, Hash, User, LogOut
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import EmailCaptureModal from './EmailCaptureModal';
import ProducerDashboard from './ProducerDashboard';
import AuthModal from './AuthModal';
import { useUserRole } from '@/hooks/useUserRole';
import { downloadFile } from '@/lib/download-utils';
import dynamic from 'next/dynamic';

// Dynamically import WaveformPlayer to avoid SSR issues
const WaveformPlayer = dynamic(() => import('./WaveformPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-12 bg-neutral-800 rounded animate-pulse" />
  )
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SampleBrowser() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<Genre>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [likedSamples, setLikedSamples] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [purchasingLicense, setPurchasingLicense] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalTrigger, setEmailModalTrigger] = useState<'download_limit' | 'premium_sample' | 'feature_access'>('download_limit');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  
  // ADD THESE MISSING PAGINATION STATE VARIABLES:
  const [displayedSampleCount, setDisplayedSampleCount] = useState(5);
  const SAMPLES_PER_PAGE = 5;
  
  const [producerStats, setProducerStats] = useState({
    downloads: 0,
    favorites: 0,
    lastVisit: new Date().toISOString(),
    preferredGenre: 'trap',
    credits: 10,
    streak: 1
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { role, isAdmin } = useUserRole();

  const supabase = createClient();

  const genres: { id: Genre; name: string }[] = [
    { id: 'all', name: 'All Genres' },
    { id: 'trap', name: 'Trap' },
    { id: 'rnb', name: 'R&B' },
    { id: 'soul', name: 'Soul' },
  ];

  // Fetch samples and licenses
  useEffect(() => {
    fetchSamples();
    fetchLicenses();
    loadUserLikes();
    loadUserData();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      setUserEmail(user.email || null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserEmail(null);
    toast.success('Logged out successfully');
  };

  const loadUserData = () => {
    const email = localStorage.getItem('producer_email');
    const downloads = parseInt(localStorage.getItem('download_count') || '0');
    const favorites = likedSamples.size;
    
    setUserEmail(email);
    setDownloadCount(downloads);
    setProducerStats(prev => ({
      ...prev,
      downloads,
      favorites,
      credits: email ? 25 : 10 - downloads
    }));
  };

  const fetchSamples = async () => {
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

  // Filter and sort samples
  const filteredSamples = samples.filter(sample => {
    const matchesGenre = selectedGenre === 'all' || sample.genre === selectedGenre;
    const matchesSearch = sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.artist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => sample.tags.includes(tag));
    return matchesGenre && matchesSearch && matchesTags;
  });

  const sortedSamples = [...filteredSamples].sort((a, b) => {
    switch(sortBy) {
      case 'popular': return b.downloads - a.downloads;
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'bpm': return a.bpm - b.bpm;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  // ADD THIS LINE FOR PAGINATION:
  const displayedSamples = sortedSamples.slice(0, displayedSampleCount);

  // Get all unique tags
  const allTags = Array.from(new Set(samples.flatMap(s => s.tags)));

  // Audio playback with waveform
  const togglePlay = async (sampleId: string) => {
    if (playingId === sampleId) {
      // Pause current
      setPlayingId(null);
    } else {
      // Set new playing sample
      setPlayingId(sampleId);
    }
  };

  // Like/unlike sample
  const toggleLike = async (sampleId: string) => {
    const userIdentifier = localStorage.getItem('user_identifier') || generateUserIdentifier();
    const isLiked = likedSamples.has(sampleId);

    try {
      if (isLiked) {
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_identifier', userIdentifier)
          .eq('sample_id', sampleId);
        
        setLikedSamples(prev => {
          const newSet = new Set(prev);
          newSet.delete(sampleId);
          return newSet;
        });
      } else {
        await supabase
          .from('user_likes')
          .insert({
            user_identifier: userIdentifier,
            sample_id: sampleId
          });
        
        setLikedSamples(prev => new Set(prev).add(sampleId));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  // Free download - using database metadata for filename
  const handleFreeDownload = async (sample: Sample) => {
    setDownloadingId(sample.id);
    
    try {
      // Check if user is logged in
      if (!user) {
        // Check download count for anonymous users - ADD CLIENT-SIDE CHECK
        const currentDownloads = typeof window !== 'undefined' 
          ? parseInt(localStorage.getItem('anonymous_downloads') || '0')
          : 0;
        
        if (currentDownloads >= 1) {
          // Show auth modal instead of email modal
          setShowAuthModal(true);
          setDownloadingId(null);
          toast.error('Please create an account to continue downloading');
          return;
        }
        
        // Allow first download for anonymous users - ADD CLIENT-SIDE CHECK
        if (typeof window !== 'undefined') {
          localStorage.setItem('anonymous_downloads', (currentDownloads + 1).toString());
        }
      }

      // Create filename using database metadata: name_bpm_key_@looplib.ext
      const extension = sample.file_url.split('.').pop() || 'mp3';
      
      // Format the key (remove spaces, lowercase)
      const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
      
      // Format the name (remove spaces, lowercase)
      const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
      
      // Create the filename: name_bpm_key @LOOPLIB.mp3
      const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted} @LOOPLIB.${extension}`;
      
      // Start download immediately with proper filename
      await downloadFile(sample.file_url, downloadFilename);
      
      // Then track the download
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sampleId: sample.id,
          email: user?.email || 'anonymous@looplib.com'
        })
      });

      if (!response.ok) {
        console.warn('Download tracking failed, but file downloaded successfully');
      }

      toast.success('Download complete! Check your downloads folder.');
      
      // Update download count - ADD CLIENT-SIDE CHECK
      const newCount = downloadCount + 1;
      setDownloadCount(newCount);
      if (typeof window !== 'undefined') {
        localStorage.setItem('download_count', newCount.toString());
      }
      
      // Show success message for first download if anonymous - ADD CLIENT-SIDE CHECK
      if (!user && typeof window !== 'undefined') {
        const anonymousDownloads = parseInt(localStorage.getItem('anonymous_downloads') || '0');
        if (anonymousDownloads === 1) {
          toast.success('First download complete! Create an account for unlimited downloads! 🎵', {
            duration: 5000
          });
        }
      }
      
      // Update producer stats
      setProducerStats(prev => ({
        ...prev,
        downloads: prev.downloads + 1,
        credits: Math.max(0, prev.credits - 1)
      }));
      
      // Refresh sample data to update download count
      fetchSamples();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download sample');
    } finally {
      setDownloadingId(null);
    }
  };

  // Purchase license
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
      
      // Redirect to Stripe Checkout
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

  // Update the getUserLibraryCount function:
  const getUserLibraryCount = () => {
    if (typeof window === 'undefined') return 0;
    
    // Get unique samples (avoid counting same sample twice if both liked and downloaded)
    const downloadedSamples = new Set(JSON.parse(localStorage.getItem('downloaded_samples') || '[]'));
    const allUserSamples = new Set([...likedSamples, ...downloadedSamples]);
    return allUserSamples.size;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="https://www.looplib.com/cdn/shop/files/looplib-logo-loop-kits.png?v=1735326433&width=370"
                  alt="LoopLib"
                  className="h-8 w-auto"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-neutral-400">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-neutral-400 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md transition-colors font-medium"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-neutral-800 bg-neutral-900/30 min-h-screen p-6">
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
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                    selectedGenre === genre.id
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="font-medium">{genre.name}</span>
                  <span className="text-xs">
                    {genre.id === 'all' 
                      ? samples.length 
                      : samples.filter(s => s.genre === genre.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-neutral-400 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-orange-500 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Welcome Message for logged in users */}
          {userEmail && (
            <div className="p-6 border-b border-neutral-800">
              <div className="max-w-6xl mx-auto">
                <div className="bg-neutral-900/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Welcome back!</h3>
                    <p className="text-sm text-neutral-400">
                      {getUserLibraryCount()} samples in your library
                      {likedSamples.size > 0 && (
                        <span className="text-red-400 ml-2">• {likedSamples.size} liked</span>
                      )}
                      {downloadCount > 0 && (
                        <span className="text-green-400 ml-2">• {downloadCount} downloaded</span>
                      )}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      // Filter to show only user's samples
                      setSelectedTags([]);
                      setSearchTerm('');
                      setSelectedGenre('all');
                      // You could add a filter for user's library here
                    }}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Music className="w-4 h-4" />
                    <span>My Library</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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
                  >
                    <TrendingUp className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setSortBy('newest')}
                    className={`px-3 py-2 transition-colors ${
                      sortBy === 'newest' ? 'text-orange-400' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setSortBy('bpm')}
                    className={`px-3 py-2 transition-colors ${
                      sortBy === 'bpm' ? 'text-orange-400' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Hash className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400">
                  {sortedSamples.length} samples
                </p>
              </div>
            </div>
          </div>

          {/* Samples List */}
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : sortedSamples.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-neutral-400">No samples found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="group bg-neutral-900/30 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/50 hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm text-neutral-400 mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-neutral-800 rounded text-xs">
                                {sample.genre}
                              </span>
                              {sample.has_stems && (
                                <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded text-xs font-semibold">
                                  STEMS
                                </span>
                              )}
                            </div>
                            <span>{sample.bpm} BPM</span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-white text-lg mb-1">{sample.name}</h3>
                              <p className="text-sm text-neutral-400">{sample.artist?.name || 'LoopLib'}</p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-neutral-400">{sample.key}</span>
                              <span className="text-sm text-neutral-400">•</span>
                              <span className="text-sm text-neutral-400">{sample.duration}</span>
                            </div>
                          </div>
                          
                          {/* Waveform Player */}
                          <div className="mb-4">
                            <WaveformPlayer
                              url={sample.file_url}
                              isPlaying={playingId === sample.id}
                              onPlayPause={() => togglePlay(sample.id)}
                              height={48}
                              waveColor="#525252"
                              progressColor="#f97316"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {sample.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-neutral-800 text-xs rounded text-neutral-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleLike(sample.id)}
                                className={`p-2 rounded-md transition-colors ${
                                  likedSamples.has(sample.id)
                                    ? 'bg-red-500/20 text-red-500' 
                                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${likedSamples.has(sample.id) ? 'fill-current' : ''}`} />
                              </button>
                              
                              <button
                                onClick={() => handleFreeDownload(sample)}
                                disabled={downloadingId === sample.id}
                                className="px-4 py-2 bg-neutral-800 text-white hover:bg-neutral-700 rounded-md transition-colors flex items-center space-x-2 disabled:opacity-50"
                              >
                                {downloadingId === sample.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                                <span>
                                  {!user && typeof window !== 'undefined' && parseInt(localStorage.getItem('anonymous_downloads') || '0') >= 1 
                                    ? 'Sign Up for More' 
                                    : 'Free'
                                  }
                                </span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedSample(sample);
                                  setShowLicenseModal(true);
                                }}
                                className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-md transition-colors flex items-center space-x-2"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>License</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {displayedSampleCount < sortedSamples.length && (
                    <div className="flex justify-center pt-8">
                      <button
                        onClick={() => setDisplayedSampleCount(prev => prev + SAMPLES_PER_PAGE)}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                      >
                        Load More
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
      {showLicenseModal && selectedSample && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Choose Your License</h2>
                  <p className="text-neutral-400 mt-1">
                    {selectedSample.name} by {selectedSample.artist?.name || 'Unknown Artist'}
                  </p>
                </div>
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {licenses.map((license) => (
                  <div
                    key={license.id}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      license.is_popular
                        ? 'border-orange-500 bg-orange-500/5'
                        : 'border-neutral-700 bg-neutral-800/30'
                    }`}
                  >
                    {license.is_popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 bg-orange-500 text-xs font-bold rounded-full uppercase">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold mb-2">{license.name}</h4>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold">${license.price}</span>
                        <span className="text-neutral-400 ml-1">USD</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {license.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      onClick={() => handleLicensePurchase(license)}
                      disabled={purchasingLicense === license.id}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                        license.is_popular
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                      }`}
                    >
                      {purchasingLicense === license.id ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        `Get ${license.name}`
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={(email) => {
          setUserEmail(email);
          setProducerStats(prev => ({ ...prev, credits: 25 }));
          loadUserData();
        }}
        triggerType={emailModalTrigger}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          checkUser();
          loadUserData();
        }}
      />

      {/* Anonymous User Banner */}
      {!user && (
        <div className="border-b border-neutral-800 bg-gradient-to-r from-orange-900/20 to-red-900/20 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-200">
                  {typeof window !== 'undefined' && parseInt(localStorage.getItem('anonymous_downloads') || '0') === 0 
                    ? '🎵 Try one free download, then create an account for unlimited access!'
                    : '✨ You\'ve used your free download! Create an account for unlimited downloads.'
                  }
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors font-medium text-sm"
              >
                {typeof window !== 'undefined' && parseInt(localStorage.getItem('anonymous_downloads') || '0') === 0 
                  ? 'Sign Up Free' 
                  : 'Create Account'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}