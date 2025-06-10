'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample, License } from '@/types';
import { 
  Play, Pause, Download, Heart, Search, 
  Music, ShoppingCart, X, Check, Loader2, Filter,
  TrendingUp, Clock, Hash, User, LogOut, Shuffle,
  LucideIcon
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import AuthModal from '@/components/AuthModal';
import LicenseModal from '@/components/LicenseModal';
import { downloadFile } from '@/lib/download-utils';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getUserIdentifier } from '@/utils/user-identity';

const WaveformPlayer = dynamic(() => import('@/components/WaveformPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-12 bg-neutral-800 rounded animate-pulse" />
  )
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export interface GenrePageConfig {
  genre: string;
  genreSlug: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  bpmRanges: Array<{ id: string; label: string; min: number; max: number }>;
  commonTags: string[];
  heroGradient: string;
  icon: LucideIcon;
  educationalContent: {
    essentialElements: {
      icon: LucideIcon;
      title: string;
      items: string[];
    };
    productionTips: {
      icon: LucideIcon;
      title: string;
      items: string[];
    };
    description: string[];
  };
}

interface GenrePageTemplateProps {
  config: GenrePageConfig;
  initialSamples?: Sample[];
}

export default function GenrePageTemplate({ config, initialSamples = [] }: GenrePageTemplateProps) {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
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
  const [anonymousDownloads, setAnonymousDownloads] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [user, setUser] = useState<any>(null);

  const SAMPLES_PER_PAGE = 12;
  const supabase = createClient();
  const Icon = config.icon;

  // Initialize
  useEffect(() => {
    // Only fetch if we don't have initial samples
    if (initialSamples.length === 0) {
      fetchGenreSamples();
    }
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

  const fetchGenreSamples = async () => {
    if (initialSamples.length > 0) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('samples')
        .select(`
          *,
          artist:artists(*)
        `)
        .eq('genre', config.genreSlug)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      console.error(`Error fetching ${config.genre} samples:`, error);
      toast.error(`Failed to load ${config.genre} samples`);
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
    const userIdentifier = getUserIdentifier();
    
    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('sample_id')
        .eq('user_identifier', userIdentifier);

      if (error) throw error;
      
      const likedIds = new Set<string>(
        data?.map((like: { sample_id: string }) => like.sample_id) || []
      );
      setLikedSamples(likedIds);
    } catch (error) {
      console.error('Error loading likes:', error);
    }
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
      
      const bpmRange = config.bpmRanges.find(r => r.id === selectedBpmRange);
      const matchesBpm = !bpmRange || bpmRange.id === 'all' || 
        (sample.bpm >= bpmRange.min && sample.bpm <= bpmRange.max);
      
      return matchesSearch && matchesTags && matchesBpm;
    });
  }, [samples, searchTerm, selectedTags, selectedBpmRange, config.bpmRanges]);

  // Sort samples
  const sortedSamples = useMemo(() => {
    let result = [...filteredSamples];
    
    switch(sortBy) {
      case 'popular':
        result.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        );
        break;
      case 'bpm':
        result.sort((a, b) => a.bpm - b.bpm);
        break;
    }
    
    return shuffleArray(result);
  }, [filteredSamples, sortBy, shuffleKey]);

  const displayedSamples = sortedSamples.slice(0, displayedSampleCount);

  // Get all unique tags from genre samples
  const allGenreTags = useMemo(() => 
    Array.from(new Set(samples.flatMap(s => s.tags))).sort(),
    [samples]
  );

  const togglePlay = (sampleId: string) => {
    setPlayingId(playingId === sampleId ? null : sampleId);
  };

  const toggleLike = async (sampleId: string) => {
    const userIdentifier = getUserIdentifier();
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
      // Check download limits for anonymous users
      if (!user && anonymousDownloads >= 1) {
        setShowAuthModal(true);
        setDownloadingId(null);
        toast.error('Please create an account to continue downloading');
        return;
      }
      
      // Update anonymous download counter
      if (!user) {
        const newCount = anonymousDownloads + 1;
        setAnonymousDownloads(newCount);
        localStorage.setItem('anonymous_downloads', newCount.toString());
      }

      const extension = sample.file_url.split('.').pop() || 'mp3';
      const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
      const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
      const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted}_${config.genreSlug} @LOOPLIB.${extension}`;

      await downloadFile(sample.file_url, downloadFilename);

      const userEmail = user?.email || 'anonymous@looplib.com';
      await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: sample.id, email: userEmail }),
      });

      if (user) {
        toast.success('Download complete! Check your downloads folder.');
      } else {
        if (anonymousDownloads === 0) {
          toast.success('First download complete! Create an account for unlimited downloads! 🎵', {
            duration: 5000
          });
        } else {
          toast.success('Download complete! Check your downloads folder.');
        }
      }

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

  const EssentialIcon = config.educationalContent.essentialElements.icon;
  const TipsIcon = config.educationalContent.productionTips.icon;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Minimal */}
      <section className={`bg-gradient-to-b ${config.heroGradient} to-black border-b border-neutral-800`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
              <p className="text-neutral-400">{config.subtitle}</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
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
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${config.genre.toLowerCase()} samples...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm md:text-base"
              />
            </div>

            {/* Mobile Filter Row */}
            <div className="flex flex-wrap gap-2">
              {/* BPM Filter */}
              <select
                value={selectedBpmRange}
                onChange={(e) => setSelectedBpmRange(e.target.value)}
                className="flex-1 min-w-[120px] px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
              >
                {config.bpmRanges.map(range => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>

              {/* Sort - Mobile Responsive */}
              <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-2 text-sm ${sortBy === 'popular' ? 'text-orange-400' : 'text-neutral-400'}`}
                >
                  Popular
                </button>
                <button 
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-2 text-sm ${sortBy === 'newest' ? 'text-orange-400' : 'text-neutral-400'}`}
                >
                  New
                </button>
                <button 
                  onClick={() => setSortBy('bpm')}
                  className={`px-3 py-2 text-sm ${sortBy === 'bpm' ? 'text-orange-400' : 'text-neutral-400'}`}
                >
                  BPM
                </button>
              </div>

              {/* Shuffle */}
              <button
                onClick={() => setShuffleKey(prev => prev + 1)}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-1 text-sm"
              >
                <Shuffle className="w-4 h-4" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>

            {/* Tag Filters - Scrollable on mobile */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {config.commonTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTags(prev => 
                      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                    )}
                    className={`px-3 py-1 rounded-full text-sm transition-colors whitespace-nowrap ${
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
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Popular {config.genre} Samples This Week</h2>

        {/* Samples Grid */}
        {loading && samples.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : displayedSamples.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 text-lg">No samples found matching your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
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

            {/* Load More */}
            {displayedSampleCount < sortedSamples.length && (
              <div className="flex justify-center mb-12">
                <button
                  onClick={() => setDisplayedSampleCount(prev => prev + SAMPLES_PER_PAGE)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Load More {config.genre} Samples ({sortedSamples.length - displayedSampleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}

        {/* SEO Content Section */}
        <section className="mt-16 pb-16 prose prose-invert max-w-none">
          <h2 className="text-xl font-semibold mb-4">How to Use {config.genre} Samples in Your Productions</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <EssentialIcon className="w-5 h-5 mr-2 text-orange-400" />
                {config.educationalContent.essentialElements.title}
              </h3>
              <ul className="space-y-2 text-neutral-300">
                {config.educationalContent.essentialElements.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <TipsIcon className="w-5 h-5 mr-2 text-orange-400" />
                {config.educationalContent.productionTips.title}
              </h3>
              <ul className="space-y-2 text-neutral-300">
                {config.educationalContent.productionTips.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-neutral-300 space-y-4 max-w-4xl">
            {config.educationalContent.description.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </section>
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
        }}
      />
    </div>
  );
}