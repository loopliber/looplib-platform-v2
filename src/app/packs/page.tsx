// src/app/packs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Pack } from '@/types';
import PackCard from '@/components/PackCard';
import { Search, Filter, TrendingUp, Clock, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');
  
  const supabase = createClient();

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      // Fetch packs with sample counts
      const { data, error } = await supabase
        .from('packs')
        .select(`
          *,
          artist:artists(*),
          pack_samples(count)
        `)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include sample count with proper typing
      const packsWithCounts = data?.map((pack: any) => ({
        ...pack,
        sample_count: pack.pack_samples?.[0]?.count || 0
      })) || [];

      setPacks(packsWithCounts);
    } catch (error) {
      console.error('Error fetching packs:', error);
      toast.error('Failed to load packs');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort packs
  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || pack.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const sortedPacks = [...filteredPacks].sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      case 'popular':
        return b.featured ? 1 : -1; // Featured packs first
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Get unique genres
  const genres = ['all', ...new Set(packs.map(p => p.genre).filter(Boolean))];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-neutral-900 to-black border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Sample Packs
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400">
              Curated collections of samples organized by theme and style
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search packs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Genre Filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500"
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
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-orange-500"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </section>

      {/* Packs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : sortedPacks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-400">No packs found</p>
          </div>
        ) : (
          <>
            {/* Featured Packs */}
            {sortedPacks.some(p => p.featured) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-orange-400" />
                  Featured Packs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPacks.filter(p => p.featured).map(pack => (
                    <PackCard key={pack.id} pack={pack} />
                  ))}
                </div>
              </div>
            )}

            {/* All Packs */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {sortedPacks.some(p => p.featured) ? 'All Packs' : 'Sample Packs'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedPacks.filter(p => !p.featured).map(pack => (
                  <PackCard key={pack.id} pack={pack} />
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}