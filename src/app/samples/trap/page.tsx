'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample, License } from '@/types';
import { 
  Play, Pause, Download, Heart, Search, 
  Music, ShoppingCart, X, Check, Loader2, Filter,
  TrendingUp, Clock, Hash, User, LogOut, Shuffle,
  Zap, Flame, Headphones
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import { downloadFile } from '@/lib/download-utils';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import WaveformPlayer to avoid SSR issues
const WaveformPlayer = dynamic(() => import('@/components/WaveformPlayer'), { 
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

export default function TrapSamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBpmRange, setSelectedBpmRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'bpm'>('popular');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [likedSamples, setLikedSamples] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [purchasingLicense, setPurchasingLicense] = useState<string | null>(null);
  const [displayedSampleCount, setDisplayedSampleCount] = useState(12);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [anonymousDownloads, setAnonymousDownloads] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0);

  const SAMPLES_PER_PAGE = 12;
  const supabase = createClient();

  // Trap-specific BPM ranges
  const bpmRanges = [
    { id: 'all', label: 'All BPMs', min: 0, max: 999 },
    { id: '140-150', label: '140-150 BPM', min: 140, max: 150 },
    { id: '150-160', label: '150-160 BPM', min: 150, max: 160 },
    { id: '160-170', label: '160-170 BPM', min: 160, max: 170 },
  ];

  // Common trap tags
  const trapTags = ['808', 'hi-hat', 'dark', 'hard', 'melodic', 'drill', 'rage', 'ambient'];

  // Initialize
  useEffect(() => {
    fetchTrapSamples();
    fetchLicenses();
    loadUserLikes();
    checkUser();
    
    if (typeof window !== 'undefined') {
      setAnonymousDownloads(parseInt(localStorage.getItem('anonymous_downloads') || '0'));
    }
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchTrapSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('samples')
        .select(`
          *,
          artist:artists(*)
        `)
        .eq('genre', 'trap')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      console.error('Error fetching trap samples:', error);
      toast.error('Failed to load trap samples');
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
      const matchesSearch = searchTerm === '' || 
        sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.artist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => sample.tags.includes(tag));
      
      const bpmRange = bpmRanges.find(r => r.id === selectedBpmRange);
      const matchesBpm = !bpmRange || bpmRange.id === 'all' || 
        (sample.bpm >= bpmRange.min && sample.bpm <= bpmRange.max);
      
      return matchesSearch && matchesTags && matchesBpm;
    });
  }, [samples, searchTerm, selectedTags, selectedBpmRange]);

  // Sort samples
  const sortedSamples = useMemo(() => {
    let result = [...filteredSamples];
    
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
    }
    
    return shuffleArray(result);
  }, [filteredSamples, sortBy, shuffleKey]);

  const displayedSamples = sortedSamples.slice(0, displayedSampleCount);

  // Get all unique tags from trap samples
  const allTrapTags = useMemo(() => 
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

      const extension = sample.file_url.split('.').pop() || 'mp3';
      const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
      const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
      const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted}_trap @LOOPLIB.${extension}`;
      
      await downloadFile(sample.file_url, downloadFilename);
      
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
      
      if (!user && anonymousDownloads === 0) {
        toast.success('First download complete! Create an account for unlimited downloads! 🎵', {
          duration: 5000
        });
      }
      
      fetchTrapSamples();
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <img 
                  src="https://www.looplib.com/cdn/shop/files/looplib-logo-loop-kits.png?v=1735326433&width=370"
                  alt="LoopLib"
                  className="h-8 w-auto"
                />
              </Link>
              
              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center space-x-2 text-sm">
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                  Home
                </Link>
                <span className="text-neutral-600">/</span>
                <Link href="/samples" className="text-neutral-400 hover:text-white transition-colors">
                  Samples
                </Link>
                <span className="text-neutral-600">/</span>
                <span className="text-white">Trap</span>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <button className="text-neutral-400 hover:text-white transition-colors flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Account</span>
                </button>
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

      {/* Hero Section - Minimal */}
      <section className="bg-gradient-to-b from-orange-900/20 to-black border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              {/* H1 - Primary SEO title */}
              <h1 className="text-3xl font-bold mb-2">Free Trap Samples & Loops</h1>
              <p className="text-neutral-400">
                {samples.length}+ professional trap sounds • 140-170 BPM • Instant download
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{samples.length}</p>
                <p className="text-xs text-neutral-400">Trap Samples</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">100%</p>
                <p className="text-xs text-neutral-400">Royalty Free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filters Row */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search trap samples..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* BPM Filter */}
            <select
              value={selectedBpmRange}
              onChange={(e) => setSelectedBpmRange(e.target.value)}
              className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {bpmRanges.map(range => (
                <option key={range.id} value={range.id}>{range.label}</option>
              ))}
            </select>

            {/* Sort */}
            <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg">
              <button 
                onClick={() => setSortBy('popular')}
                className={`px-4 py-3 ${sortBy === 'popular' ? 'text-orange-400' : 'text-neutral-400'}`}
              >
                Popular
              </button>
              <button 
                onClick={() => setSortBy('newest')}
                className={`px-4 py-3 ${sortBy === 'newest' ? 'text-orange-400' : 'text-neutral-400'}`}
              >
                Newest
              </button>
              <button 
                onClick={() => setSortBy('bpm')}
                className={`px-4 py-3 ${sortBy === 'bpm' ? 'text-orange-400' : 'text-neutral-400'}`}
              >
                BPM
              </button>
            </div>

            {/* Shuffle */}
            <button
              onClick={() => setShuffleKey(prev => prev + 1)}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>

          {/* Tag Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {trapTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTags(prev => 
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-orange-500 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* H2 - Secondary title for featured samples */}
        <h2 className="text-xl font-semibold mb-4">Popular Trap Samples This Week</h2>

        {/* Samples Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {displayedSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="group bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-400">{sample.bpm} BPM</span>
                      <span className="text-sm text-neutral-500">•</span>
                      <span className="text-sm text-neutral-400">{sample.key}</span>
                      {sample.has_stems && (
                        <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded text-xs font-semibold">
                          STEMS
                        </span>
                      )}
                    </div>
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
                  </div>
                  
                  <h3 className="font-medium text-white mb-1">{sample.name}</h3>
                  <p className="text-sm text-neutral-400 mb-4">{sample.artist?.name || 'LoopLib'}</p>
                  
                  <div className="mb-4">
                    <WaveformPlayer
                      url={sample.file_url}
                      isPlaying={playingId === sample.id}
                      onPlayPause={() => togglePlay(sample.id)}
                      height={40}
                      waveColor="#525252"
                      progressColor="#f97316"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {sample.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-neutral-800 text-xs rounded text-neutral-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFreeDownload(sample)}
                        disabled={downloadingId === sample.id}
                        className="px-3 py-1.5 bg-neutral-800 text-white hover:bg-neutral-700 rounded-md transition-colors flex items-center space-x-1 text-sm disabled:opacity-50"
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
                        className="px-3 py-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded-md transition-colors text-sm"
                      >
                        License
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {displayedSampleCount < sortedSamples.length && (
              <div className="flex justify-center mb-12">
                <button
                  onClick={() => setDisplayedSampleCount(prev => prev + SAMPLES_PER_PAGE)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Load More Trap Samples ({sortedSamples.length - displayedSampleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}

        {/* SEO Content Section */}
        <section className="mt-16 pb-16 prose prose-invert max-w-none">
          {/* H2 - Educational content */}
          <h2 className="text-xl font-semibold mb-4">How to Use Trap Samples in Your Productions</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
              {/* H3 */}
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-400" />
                Essential Trap Elements
              </h3>
              <ul className="space-y-2 text-neutral-300">
                <li>• Heavy 808 bass lines (20-60 Hz)</li>
                <li>• Rapid hi-hat patterns and rolls</li>
                <li>• Dark atmospheric melodies</li>
                <li>• Punchy snare on 3rd beat</li>
              </ul>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
              {/* H3 */}
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Headphones className="w-5 h-5 mr-2 text-orange-400" />
                Production Tips
              </h3>
              <ul className="space-y-2 text-neutral-300">
                <li>• Layer multiple hi-hat patterns</li>
                <li>• Use sidechain compression on 808s</li>
                <li>• Add reverb to melodic elements</li>
                <li>• Keep kick patterns simple but hard</li>
              </ul>
            </div>
          </div>

          <div className="text-neutral-300 space-y-4 max-w-4xl">
            <p>
              Trap music production has evolved significantly since its origins in the Southern United States. 
              Our free trap samples are designed to give you the authentic sound that defines modern trap music, 
              from booming 808s to crisp hi-hat rolls.
            </p>
            <p>
              When producing trap beats, the key is finding the right balance between hard-hitting drums and 
              atmospheric melodies. Start with a solid 808 pattern as your foundation, then layer in hi-hats 
              and snares to create that signature trap rhythm.
            </p>
          </div>
        </section>
      </div>

      {/* License Modal - Same as original */}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          checkUser();
        }}
      />
    </div>
  );
}