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
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [purchasingLicense, setPurchasingLicense] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalTrigger, setEmailModalTrigger] = useState<'download_limit' | 'premium_sample' | 'feature_access'>('download_limit');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
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
    { id: 'drill', name: 'Drill' },
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

  // Get all unique tags
  const allTags = Array.from(new Set(samples.flatMap(s => s.tags)));

  // Audio playback
  const togglePlay = async (sampleId: string, fileUrl: string) => {
    if (playingId === sampleId) {
      // Pause current
      audioElements[sampleId]?.pause();
      setPlayingId(null);
    } else {
      // Stop any playing audio
      Object.values(audioElements).forEach(audio => audio.pause());
      
      // Create or get audio element
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
        console.error('Playback error:', error);
        toast.error('Failed to play audio');
      }
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

  // Free download
  const handleFreeDownload = async (sample: Sample) => {
    // Check if email is required (after 3 downloads)
    if (!userEmail && downloadCount >= 3) {
      setEmailModalTrigger('download_limit');
      setShowEmailModal(true);
      return;
    }

    setDownloadingId(sample.id);
    
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sampleId: sample.id,
          email: 'anonymous@looplib.com' // You can collect email optionally
        })
      });

      if (!response.ok) throw new Error('Download failed');

      // Trigger download
      const link = document.createElement('a');
      link.href = sample.file_url;
      link.download = `${sample.name} - LoopLib.mp3`;
      link.click();

      toast.success('Download started! Check your downloads folder.');
      
      // Update download count
      const newCount = downloadCount + 1;
      setDownloadCount(newCount);
      localStorage.setItem('download_count', newCount.toString());
      
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold">LoopLib</h1>
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
          {/* Add Producer Dashboard if user has email */}
          {userEmail && (
            <div className="p-6 border-b border-neutral-800">
              <div className="max-w-6xl mx-auto">
                <div className="bg-neutral-900/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Welcome back!</h3>
                    <p className="text-sm text-neutral-400">
                      {producerStats.downloads} samples in your library
                    </p>
                  </div>
                  <a 
                    href="/library"
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Music className="w-4 h-4" />
                    <span>My Library</span>
                  </a>
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
                  {sortedSamples.length} {sortedSamples.length === 1 ? 'sample' : 'samples'}
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
                  {sortedSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="group bg-neutral-900/30 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/50 hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Play Button */}
                        <button
                          onClick={() => togglePlay(sample.id, sample.file_url)}
                          className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors group"
                        >
                          {playingId === sample.id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                          )}
                        </button>

                        {/* Sample Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-white flex items-center space-x-2">
                                <span>{sample.name}</span>
                                {sample.is_premium && (
                                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                                    PRO
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-neutral-400">{sample.artist?.name || 'Unknown Artist'}</p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {sample.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-neutral-800 text-xs rounded text-neutral-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-neutral-400">
                              <span>{sample.bpm} BPM</span>
                              <span>{sample.key}</span>
                              <span>{sample.duration}</span>
                              <span className="flex items-center space-x-1">
                                <Download className="w-3 h-3" />
                                <span>{sample.downloads}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{sample.likes}</span>
                              </span>
                            </div>

                            {/* Actions */}
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
                                <span>Free</span>
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
              {/* Info Box */}
              <div className="mb-8 p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">How It Works</h3>
                <p className="text-gray-300">
                  Download any sample for free to try in your projects. When you're ready to release your track, 
                  purchase a license that fits your needs. All licenses are lifetime and include instant delivery.
                </p>
              </div>

              {/* License Options */}
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

              <p className="text-center text-sm text-neutral-500 mt-8">
                Secure checkout powered by Stripe. Instant delivery to your email.
              </p>
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
    </div>
  );
}