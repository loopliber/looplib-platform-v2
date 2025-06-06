'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  Music, User, LogOut, ArrowRight, Sparkles,
  Flame, Heart, Headphones, Play, Pause
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GenreStats {
  genre: string;
  count: number;
  newThisWeek: number;
}

interface GenreCollection {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  icon: React.ReactNode;
  description: string;
  bpmRange: string;
  tags: string[];
  gradient: string;
  accentColor: string;
  previewUrl?: string;
}

export default function SamplesCollectionPage() {
  const [user, setUser] = useState<any>(null);
  const [genreStats, setGenreStats] = useState<Record<string, GenreStats>>({});
  const [loading, setLoading] = useState(true);
  const [playingGenre, setPlayingGenre] = useState<string | null>(null);
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  
  const supabase = createClient();

  // Define genre collections
  const genreCollections: GenreCollection[] = [
    {
      id: 'trap',
      name: 'Trap',
      slug: 'trap',
      emoji: '🔥',
      icon: <Flame className="w-6 h-6" />,
      description: 'Hard-hitting 808s and dark melodies',
      bpmRange: '140-170 BPM',
      tags: ['808', 'Hi-Hats', 'Dark', 'Hard'],
      gradient: 'from-orange-600 via-red-600 to-red-800',
      accentColor: 'orange',
      previewUrl: '/samples/trap-preview.mp3' // Add preview URLs when available
    },
    {
      id: 'soul',
      name: 'Soul',
      slug: 'soul',
      emoji: '❤️',
      icon: <Heart className="w-6 h-6" />,
      description: 'Warm vintage sounds and gospel chords',
      bpmRange: '70-110 BPM',
      tags: ['Vintage', 'Warm', 'Gospel', 'Classic'],
      gradient: 'from-pink-600 via-purple-600 to-indigo-700',
      accentColor: 'pink',
      previewUrl: '/samples/soul-preview.mp3'
    },
    {
      id: 'rnb',
      name: 'R&B',
      slug: 'rnb',
      emoji: '💫',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Smooth melodies and modern vibes',
      bpmRange: '60-100 BPM',
      tags: ['Smooth', 'Melodic', 'Modern', 'Chill'],
      gradient: 'from-purple-600 via-purple-700 to-purple-900',
      accentColor: 'purple',
      previewUrl: '/samples/rnb-preview.mp3'
    }
  ];

  useEffect(() => {
    checkUser();
    fetchGenreStats();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchGenreStats = async () => {
    try {
      // Fetch sample counts by genre
      const { data: samples, error } = await supabase
        .from('samples')
        .select('genre, created_at');

      if (error) throw error;

      // Calculate stats
      const stats: Record<string, GenreStats> = {};
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      samples?.forEach(sample => {
        const genre = sample.genre;
        if (!stats[genre]) {
          stats[genre] = { genre, count: 0, newThisWeek: 0 };
        }
        stats[genre].count++;
        
        if (new Date(sample.created_at) > oneWeekAgo) {
          stats[genre].newThisWeek++;
        }
      });

      setGenreStats(stats);
    } catch (error) {
      console.error('Error fetching genre stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const playPreview = async (genre: string, previewUrl?: string) => {
    if (!previewUrl) return;

    // Stop all other previews
    Object.values(audioElements).forEach(audio => audio.pause());

    if (playingGenre === genre) {
      setPlayingGenre(null);
      return;
    }

    let audio = audioElements[genre];
    if (!audio) {
      audio = new Audio(previewUrl);
      audio.volume = 0.5;
      audio.addEventListener('ended', () => setPlayingGenre(null));
      setAudioElements(prev => ({ ...prev, [genre]: audio }));
    }

    try {
      await audio.play();
      setPlayingGenre(genre);
    } catch (error) {
      console.error('Error playing preview:', error);
    }
  };

  const totalSamples = Object.values(genreStats).reduce((sum, stat) => sum + stat.count, 0);
  const totalNew = Object.values(genreStats).reduce((sum, stat) => sum + stat.newThisWeek, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-neutral-900 to-black border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Free Sample Collections</h1>
            <p className="text-neutral-400 text-base sm:text-lg mb-6">
              Professional samples and loops organized by genre
            </p>
            
            {/* Stats */}
            <div className="flex justify-center items-center space-x-6 sm:space-x-8 text-sm">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-orange-400">{totalSamples}</p>
                <p className="text-xs sm:text-sm text-neutral-400">Total Samples</p>
              </div>
              <div className="w-px h-12 bg-neutral-700" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-green-400">{totalNew}</p>
                <p className="text-xs sm:text-sm text-neutral-400">New This Week</p>
              </div>
              <div className="w-px h-12 bg-neutral-700" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-400">{genreCollections.length}</p>
                <p className="text-xs sm:text-sm text-neutral-400">Genres</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Genre Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-4 sm:space-y-6">
          {genreCollections.map((genre) => {
            const stats = genreStats[genre.id] || { count: 0, newThisWeek: 0 };
            const isHovered = hoveredGenre === genre.id;
            const isPlaying = playingGenre === genre.id;
            
            return (
              <Link
                key={genre.id}
                href={`/samples/${genre.slug}`}
                className="block group"
                onMouseEnter={() => setHoveredGenre(genre.id)}
                onMouseLeave={() => setHoveredGenre(null)}
              >
                <div className={`
                  relative overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-800 
                  bg-gradient-to-r ${genre.gradient} p-0.5
                  transform transition-all duration-300 hover:scale-[1.02]
                `}>
                  <div className="relative bg-black/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-12 h-12 sm:w-14 sm:h-14 rounded-xl 
                            bg-gradient-to-br ${genre.gradient} 
                            flex items-center justify-center text-2xl sm:text-3xl
                            transform transition-transform group-hover:scale-110
                          `}>
                            {genre.emoji}
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold flex items-center">
                              {genre.name} Samples
                              {stats.newThisWeek > 0 && (
                                <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                  +{stats.newThisWeek} new
                                </span>
                              )}
                            </h2>
                            <p className="text-neutral-400 text-sm sm:text-base">{genre.description}</p>
                          </div>
                        </div>
                        
                        {/* Play Preview Button - Desktop only */}
                        {genre.previewUrl && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              playPreview(genre.id, genre.previewUrl);
                            }}
                            className={`
                              hidden sm:flex w-12 h-12 rounded-full items-center justify-center
                              transition-all transform hover:scale-110
                              ${isPlaying 
                                ? 'bg-green-500 text-white' 
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                              }
                            `}
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                          </button>
                        )}
                      </div>
                      
                      {/* Stats and Tags */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4 sm:space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <Music className="w-4 h-4 text-neutral-400" />
                            <span className="text-white font-medium">{stats.count} Samples</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Headphones className="w-4 h-4 text-neutral-400" />
                            <span className="text-neutral-300">{genre.bpmRange}</span>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {genre.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-3 py-1 bg-neutral-800/50 text-xs rounded-full text-neutral-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* CTA */}
                      <div className="mt-4 sm:mt-6 flex items-center justify-between">
                        <span className={`
                          text-sm font-medium text-${genre.accentColor}-400
                          group-hover:text-${genre.accentColor}-300 transition-colors
                        `}>
                          Browse {genre.name} Collection
                        </span>
                        <ArrowRight className={`
                          w-5 h-5 text-${genre.accentColor}-400
                          transform transition-all group-hover:translate-x-2
                          group-hover:text-${genre.accentColor}-300
                        `} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Coming Soon Section */}
        <div className="mt-12 text-center">
          <p className="text-neutral-400 mb-4">More genres coming soon</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Gospel', 'Drill', 'Afrobeat', 'Lo-fi', 'Jazz'].map(genre => (
              <span key={genre} className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-500">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <p className="text-neutral-400 leading-relaxed">
          Explore our curated collection of royalty-free samples organized by genre. 
          Each collection features professionally produced loops and samples perfect for 
          music production. Download samples free for personal use, or purchase a license 
          when you're ready to release your music commercially.
        </p>
      </section>
    </div>
  );
}