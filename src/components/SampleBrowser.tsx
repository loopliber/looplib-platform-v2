// components/SampleBrowser.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sample, License, Genre, SortBy } from '@/types';
import { 
  Play, Pause, Download, Heart, Search, 
  Music, X, Loader2, Filter, Shuffle, Zap, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadFile } from '@/lib/download-utils';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import TermsModal from './TermsModal';

// Dynamically import WaveformPlayer to avoid SSR issues
const WaveformPlayer = dynamic(() => import('./WaveformPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-10 bg-neutral-800 rounded animate-pulse" />
  )
});

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
  initialSamples?: Sample[];
}

export default function SampleBrowser({ 
  initialGenre = 'all', 
  pageTitle,
  pageSubtitle,
  accentColor = 'orange',
  initialSamples = []
}: SampleBrowserProps) {
  // Core state
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(initialSamples.length === 0);
  
  // Filter state
  const [selectedGenre, setSelectedGenre] = useState<Genre>(initialGenre);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [shuffleKey, setShuffleKey] = useState(0);
  
  // UI state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasSeenTerms, setHasSeenTerms] = useState(false);
  
  // User state
  const [user, setUser] = useState<any>(null);
  const [likedSamples, setLikedSamples] = useState<Set<string>>(new Set());
  const [anonymousDownloads, setAnonymousDownloads] = useState(0);
  
  // Loading states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [purchasingLicense, setPurchasingLicense] = useState<string | null>(null);
  
  // Pagination - Show only 7 initially for home page
  const [displayedSampleCount, setDisplayedSampleCount] = useState(7);
  const SAMPLES_PER_PAGE = 7;
  
  const supabase = createClient();

  const genres: { id: Genre; name: string; icon: React.ReactNode }[] = [
    { id: 'all', name: 'All Genres', icon: <Music className="w-4 h-4" /> },
    { id: 'trap', name: 'Trap', icon: <Zap className="w-4 h-4" /> },
    { id: 'rnb', name: 'R&B', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'soul', name: 'Soul', icon: <Heart className="w-4 h-4" /> },
  ];

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        if (initialSamples.length === 0) {
          await fetchSamples();
        }
        await fetchLicenses();
        await loadUserLikes();
        await checkUser();
        
        if (typeof window !== 'undefined') {
          const savedDownloads = parseInt(localStorage.getItem('anonymous_downloads') || '0');
          setAnonymousDownloads(savedDownloads);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        toast.error('Failed to initialize application');
      }
    };

    initializeComponent();
  }, []);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedSampleCount(SAMPLES_PER_PAGE);
    setShuffleKey(prev => prev + 1);
  }, [selectedGenre, selectedTags]);

  const checkUser = async () => {
    try {
      // Removed auth user checking
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const fetchSamples = async () => {
  if (initialSamples.length > 0) return;
  
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('v_samples_with_pack_info') // Use the view
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform data to include artwork_url at the top level
    const samplesWithArtwork = data?.map((sample: any) => {
      console.log('Sample pack data:', {
        name: sample.name,
        pack_artwork_url: sample.pack_artwork_url,
        pack_name: sample.pack_name,
        pack_slug: sample.pack_slug
      });
      
      return {
        ...sample,
        artwork_url: sample.pack_artwork_url || null,
        pack_name: sample.pack_name || null,
        pack_slug: sample.pack_slug || null
      };
    }) || [];
    
    setSamples(samplesWithArtwork);
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
    // Simplified without user identity tracking
    setLikedSamples(new Set());
  };

  // Memoized filtered and sorted samples
  const { filteredSamples, sortedSamples } = useMemo(() => {
    try {
      const filtered = samples.filter(sample => {
        const matchesGenre = selectedGenre === 'all' || sample.genre === selectedGenre;
        const matchesSearch = searchTerm === '' || 
          sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.artist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => sample.tags?.includes(tag));
        
        return matchesGenre && matchesSearch && matchesTags;
      });
      
      let sorted = [...filtered];
      switch(sortBy) {
        case 'popular':
          sorted.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
          break;
        case 'newest':
          sorted.sort((a, b) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
          break;
        case 'bpm':
          sorted.sort((a, b) => a.bpm - b.bpm);
          break;
        case 'name':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
      
      return {
        filteredSamples: filtered,
        sortedSamples: shuffleArray(sorted)
      };
    } catch (error) {
      console.error('Error filtering samples:', error);
      return { filteredSamples: [], sortedSamples: [] };
    }
  }, [samples, selectedGenre, searchTerm, selectedTags, sortBy, shuffleKey]);

  const displayedSamples = useMemo(() => 
    sortedSamples.slice(0, displayedSampleCount),
    [sortedSamples, displayedSampleCount]
  );
  
  // Get all unique tags
  const allTags = useMemo(() => 
    Array.from(new Set(samples.flatMap(s => s.tags || []))).sort(),
    [samples]
  );

  // Event handlers
  const togglePlay = useCallback((sampleId: string) => {
    setPlayingId(current => current === sampleId ? null : sampleId);
  }, []);

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
    
    setPurchasingLicense(license.id);
    
    try {
      // Removed Stripe checkout code
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to process payment');
    } finally {
      setPurchasingLicense(null);
    }
  };

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleRefresh = useCallback(() => {
    setShuffleKey(prev => prev + 1);
    toast.success('🎲 Samples shuffled!', { duration: 1500 });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content - Full Width */}
      <main className="w-full">
        {/* Hero Banner */}
        <div className="relative h-96 overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://cdn.shopify.com/videos/c/o/v/545e2bf85e4a44409cd0a27ff0c91fa6.mov" type="video/mp4" />
          </video>
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Hero Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Royalty Free Samples & Loops For Future Hits
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                Discover premium sounds & samples for free
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden px-4 py-3 border-b border-neutral-800">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="flex items-center space-x-2 text-neutral-400 hover:text-white"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {(selectedTags.length > 0 || selectedGenre !== 'all') && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {selectedTags.length + (selectedGenre !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="sticky top-0 z-20 bg-black border-b border-neutral-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search any sound.."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-32 py-3 bg-neutral-900 border border-neutral-700 rounded-full 
                  focus:outline-none focus:border-blue-500 transition-colors text-white"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <a
                  href="https://shop.looplib.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-sm font-medium transition-colors"
                >
                  Shop
                </a>
                <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Browse by Genre */}
        <div className="p-4 md:p-6 border-b border-neutral-800">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">Browse genres</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${selectedGenre === genre.id 
                        ? 'bg-white text-black' 
                        : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
                  >
                    {genre.icon}
                    <span>{genre.name}</span>
                  </button>
                ))}
                <button className="px-4 py-2 rounded-full text-sm font-medium bg-neutral-800 text-white hover:bg-neutral-700">
                  Explore All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Samples Grid - Boxed Layout */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : sortedSamples.length === 0 ? (
              <div className="text-center py-20">
                <Music className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 text-lg mb-2">No samples found</p>
                <p className="text-neutral-500 text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedSamples.map((sample) => (
                  <div 
                    key={sample.id} 
                    className="group bg-neutral-800/80 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-800 hover:border-neutral-600 transition-all"
                  >
                    {/* Add artwork section */}
                    <div className="flex gap-3 mb-3">
                      {/* Album artwork */}
                      <div className="flex-shrink-0">
                        {sample.artwork_url ? (
                          <img 
                            src={sample.artwork_url} 
                            alt={sample.pack_name || sample.name}
                            className="w-16 h-16 rounded-lg object-cover bg-neutral-800"
                            onError={(e) => {
                              console.log('Image failed to load:', sample.artwork_url);
                              const target = e.currentTarget;
                              const fallback = target.nextElementSibling as HTMLElement;
                              target.style.display = 'none';
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        {/* Fallback placeholder - always render it */}
                        <div 
                          className={`w-16 h-16 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center ${sample.artwork_url ? 'hidden' : 'flex'}`}
                        >
                          <Music className="w-6 h-6 text-neutral-500" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header with BPM, Key and Like button */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-neutral-400">{sample.bpm} BPM</span>
                            <span className="text-sm text-neutral-500">•</span>
                            <span className="text-sm text-neutral-400">{sample.key}</span>
                            {sample.has_stems && (
                              <>
                                <span className="text-sm text-neutral-500">•</span>
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded">
                                  STEMS
                                </span>
                              </>
                            )}
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
                            className={`p-2 rounded-md transition-colors ${
                              likedSamples.has(sample.id)
                                ? 'bg-red-500/20 text-red-500' 
                                : 'bg-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedSamples.has(sample.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        
                        {/* Title and artist */}
                        <h3 className="font-medium text-white text-base mb-1">{sample.name}</h3>
                        <p className="text-sm text-neutral-400 mb-3">{sample.artist?.name || 'LoopLib'}</p>
                      </div>
                    </div>
                    
                    {/* Waveform - moved outside the flex container */}
                    <div className="mb-4 h-16">
                      <WaveformPlayer
                        url={sample.file_url}
                        isPlaying={playingId === sample.id}
                        onPlayPause={() => togglePlay(sample.id)}
                        height={64}
                        waveColor="#666666"
                        progressColor="#f97316"
                      />
                    </div>
                    
                    {/* Tags and Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                      <div className="flex flex-wrap gap-1">
                        {sample.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-neutral-800 text-xs rounded text-neutral-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFreeDownload(sample)}
                          disabled={downloadingId === sample.id}
                          className="flex-1 sm:flex-none px-4 py-2 bg-neutral-800 text-white hover:bg-neutral-700 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
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
                          className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-md transition-colors text-sm"
                        >
                          License
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {displayedSampleCount < sortedSamples.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setDisplayedSampleCount(prev => prev + SAMPLES_PER_PAGE)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                >
                  Load More Samples
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Benefits */}
        <div className="bg-black border-t border-neutral-800 p-8 md:p-12">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-yellow-400 mb-2">100% royalty free</h3>
              <p className="text-sm text-neutral-400">Use your sounds anywhere, cleared for all projects</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Yours forever</h3>
              <p className="text-sm text-neutral-400">Every sound you download is yours to keep forever</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Cancel anytime</h3>
              <p className="text-sm text-neutral-400">No commitments here. Change your mind? No problem</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Filter Overlay */}
      {mobileSidebarOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 h-full w-80 bg-neutral-900 z-50 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Sort */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">SORT BY</h3>
              <div className="space-y-1">
                {[
                  { id: 'popular', label: 'Most Popular' },
                  { id: 'newest', label: 'Newest First' },
                  { id: 'bpm', label: 'BPM' },
                  { id: 'name', label: 'Name' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id as SortBy);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                      ${sortBy === option.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Tags */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3">TAGS</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 20).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors
                      ${selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Mobile Shuffle Button */}
            <button
              onClick={() => {
                handleRefresh();
                setMobileSidebarOpen(false);
              }}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle Results</span>
            </button>
          </div>
        </>
      )}

      {/* Terms Modal - add this section */}
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