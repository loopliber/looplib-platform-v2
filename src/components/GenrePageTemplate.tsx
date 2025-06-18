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
import toast from 'react-hot-toast';
import { downloadFile } from '@/lib/download-utils';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import TermsModal from '@/components/TermsModal';

const WaveformPlayer = dynamic(() => import('@/components/WaveformPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-12 bg-neutral-800 rounded animate-pulse" />
  )
});

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
  heroImage?: string; // Add hero image option
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
  // Move constants to the top, before state variables
  const SAMPLES_PER_PAGE = 12;
  const supabase = createClient();
  const Icon = config.icon;

  // Now declare state variables
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(initialSamples.length > 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBpmRange, setSelectedBpmRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'bpm'>('popular');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [likedSamples, setLikedSamples] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [displayedSampleCount, setDisplayedSampleCount] = useState(SAMPLES_PER_PAGE);
  const [shuffleKey, setShuffleKey] = useState(0);

  // Add these state variables to track ongoing requests
  const [isFetchingLikes, setIsFetchingLikes] = useState(false);
  const [isFetchingLicenses, setIsFetchingLicenses] = useState(false);

  // Add state for terms modal around line 90:
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasSeenTerms, setHasSeenTerms] = useState(false);

  // Initialize component with better error handling
  useEffect(() => {
    let mounted = true;
    let fetchPromise: Promise<void> | null = null;

    const initialize = async () => {
      // Prevent multiple simultaneous fetches
      if (fetchPromise) return fetchPromise;
      
      fetchPromise = (async () => {
        try {
          // Only fetch samples if we don't have initial samples
          if (initialSamples.length === 0 && samples.length === 0) {
            setLoading(true);
            await fetchGenreSamples();
          }
          
          // Fetch other data in parallel ONLY ONCE
          await Promise.allSettled([
            fetchLicenses(),
            loadUserLikes()
          ]);
          
          if (mounted && typeof window !== 'undefined') {
            // Removed anonymousDownloads logic
          }
        } catch (error) {
          console.error('Initialization error:', error);
          if (mounted) {
            toast.error('Failed to load page data');
          }
        } finally {
          if (mounted) {
            setInitialLoadComplete(true);
            setLoading(false);
          }
          fetchPromise = null; // Reset for potential retry
        }
      })();
      
      return fetchPromise;
    };

    // Only initialize once
    if (!initialLoadComplete) {
      initialize();
    }

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - run only once

  const fetchGenreSamples = async () => {
  try {
    const { data, error } = await supabase
      .from('v_samples_with_pack_info') // Use the view instead of 'samples'
      .select('*')
      .eq('genre', config.genreSlug)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // The view already includes pack info, so we can use it directly
    const samplesWithArtwork = data?.map((sample: any) => ({
      ...sample,
      artwork_url: sample.pack_artwork_url || null,
      pack_name: sample.pack_name || null,
      pack_slug: sample.pack_slug || null
    })) || [];
    
    setSamples(samplesWithArtwork);
  } catch (error) {
    console.error(`Error fetching ${config.genre} samples:`, error);
    throw error;
  }
};

  const fetchLicenses = async () => {
    if (isFetchingLicenses) return;
    setIsFetchingLicenses(true);
    
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLicenses(data || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setIsFetchingLicenses(false);
    }
  };

  const loadUserLikes = async () => {
    setIsFetchingLikes(true);
    
    try {
      // Simplified without user identity tracking - just set empty likes
      setLikedSamples(new Set());
    } catch (error) {
      console.error('Error loading likes:', error);
      setLikedSamples(new Set());
    } finally {
      setIsFetchingLikes(false);
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
    
    if (sortBy === 'popular') {
      // Sort by name alphabetically since likes property doesn't exist
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === 'bpm') {
      result.sort((a, b) => (a.bpm || 0) - (b.bpm || 0));
    }

    return shuffleArray(result);
  }, [filteredSamples, sortBy]);

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
    const isLiked = likedSamples.has(sampleId);
    
    if (isLiked) {
      setLikedSamples(prev => {
        const newSet = new Set(prev);
        newSet.delete(sampleId);
        return newSet;
      });
      toast.success('Removed from liked samples');
    } else {
      setLikedSamples(prev => new Set(prev).add(sampleId));
      toast.success('Added to liked samples');
    }
  };

  const handleFreeDownload = async (sample: Sample) => {
    // Check if user has seen terms on first download
    if (!hasSeenTerms) {
      const seenTerms = localStorage.getItem('hasSeenTerms');
      if (!seenTerms) {
        setSelectedSample(sample);
        setShowTermsModal(true);
        return; // Don't proceed with download yet
      }
      setHasSeenTerms(true);
    }

    setDownloadingId(sample.id);
    
    try {
      const extension = sample.file_url.split('.').pop() || 'mp3';
      const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
      const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
      const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted} @LOOPLIB.${extension}`;

      await downloadFile(sample.file_url, downloadFilename);
      toast.success('Download complete!');
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download sample');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLicensePurchase = async (license: License) => {
    if (!selectedSample) return;
    
    toast.success(`Visit our shop for ${license.name} licensing!`);
    window.open('https://shop.looplib.com', '_blank');
  };

  const EssentialIcon = config.educationalContent.essentialElements.icon;
  const TipsIcon = config.educationalContent.productionTips.icon;

  // Show loading state only on initial load
  if (loading && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced Hero Section with Image */}
      <section className="relative overflow-hidden">
        {config.heroImage ? (
          <>
            {/* Hero Image Background */}
            <div className="absolute inset-0 h-[500px]">
              <img 
                src={config.heroImage} 
                alt={`${config.genre} Hero`}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
            </div>
            
            {/* Hero Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                  {config.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-8 drop-shadow-md">
                  {config.subtitle}
                </p>
                
                {/* Stats */}
                <div className="flex justify-center items-center space-x-8 text-white">
                  <div>
                    <p className="text-3xl font-bold text-orange-400">{samples.length}</p>
                    <p className="text-sm">Free Samples</p>
                  </div>
                  <div className="w-px h-12 bg-white/30" />
                  <div>
                    <p className="text-3xl font-bold text-orange-400">100%</p>
                    <p className="text-sm">Royalty Free</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Fallback to gradient if no image */
          <div className={`bg-gradient-to-b ${config.heroGradient} to-black`}>
            <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
              <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">{config.title}</h1>
                <p className="text-lg text-neutral-300">{config.subtitle}</p>
              </div>
            </div>
          </div>
        )}
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
        {displayedSamples.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 text-lg">No samples found matching your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {displayedSamples.map((sample) => (
                <div key={sample.id} className="group bg-neutral-800/80 border border-neutral-700 rounded-lg p-3 sm:p-4 hover:bg-neutral-800 hover:border-neutral-600 transition-all">
                  {/* Add artwork section */}
                  <div className="flex gap-3 mb-3">
                    {/* Album artwork */}
                    <div className="flex-shrink-0">
                      {sample.artwork_url ? (
                        <img 
                          src={sample.artwork_url} 
                          alt={sample.pack_name || sample.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover bg-neutral-800"
                          onError={(e) => {
                            console.log('Image failed to load:', sample.artwork_url);
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (fallback && fallback.style) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                          <Music className="w-4 h-4 sm:w-6 sm:h-6 text-neutral-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Mobile-optimized layout */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                          <span className="text-xs sm:text-sm text-neutral-400">{sample.bpm} BPM</span>
                          <span className="text-xs sm:text-sm text-neutral-500">•</span>
                          <span className="text-xs sm:text-sm text-neutral-400">{sample.key}</span>
                          {/* Add STEMS badge here */}
                          {sample.has_stems && (
                            <>
                              <span className="text-xs sm:text-sm text-neutral-500">•</span>
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded">
                                STEMS
                              </span>
                            </>
                          )}
                          {/* Add pack badge */}
                          {sample.pack_name && (
                            <>
                              <span className="hidden sm:inline text-xs sm:text-sm text-neutral-500">•</span>
                              <span className="hidden sm:inline px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">
                                {sample.pack_name}
                              </span>
                            </>
                          )}
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
                      <h3 className="font-medium text-white text-sm sm:text-base mb-1 truncate">{sample.name}</h3>
                      <p className="text-xs sm:text-sm text-neutral-400 mb-3 truncate">{sample.artist?.name || 'LoopLib'}</p>
                    </div>
                  </div>
                  
                  {/* Waveform - moved outside the flex container */}
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
                  
                  {/* Action buttons - rest stays the same */}
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
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Free Download</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedSample(sample);
                          setShowTermsModal(true);
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

      {/* Terms Modal - Add this component for terms and conditions */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        sampleName={selectedSample?.name || ''}
        onAccept={() => {
          localStorage.setItem('hasSeenTerms', 'true');
          setHasSeenTerms(true);
          setShowTermsModal(false);
          
          if (selectedSample) {
            handleFreeDownload(selectedSample);
          }
        }}
      />
    </div>
  );
}