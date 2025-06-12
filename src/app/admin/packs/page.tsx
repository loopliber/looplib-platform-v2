// src/app/admin/packs/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadToR2 } from '@/lib/r2-client';
import { Sample, Artist } from '@/types';
import { Upload, Plus, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CreatePackPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [artistId, setArtistId] = useState('');
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState('');
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [availableSamples, setAvailableSamples] = useState<Sample[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingArt, setUploadingArt] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch samples
      const { data: samplesData } = await supabase
        .from('samples')
        .select('*, artist:artists(*)')
        .order('created_at', { ascending: false });
      
      setAvailableSamples(samplesData || []);

      // Fetch artists
      const { data: artistsData } = await supabase
        .from('artists')
        .select('*')
        .order('name');
      
      setArtists(artistsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverArtFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverArtPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coverArtFile) {
      toast.error('Please upload cover art');
      return;
    }
    
    if (selectedSamples.length === 0) {
      toast.error('Please select at least one sample');
      return;
    }
    
    setSaving(true);
    
    try {
      // Upload cover art
      setUploadingArt(true);
      const timestamp = Date.now();
      const fileName = `pack-covers/${timestamp}_${coverArtFile.name}`;
      const fileBuffer = Buffer.from(await coverArtFile.arrayBuffer());
      const coverArtUrl = await uploadToR2(fileName, fileBuffer, coverArtFile.type);
      setUploadingArt(false);
      
      // Create slug from name
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Create pack
      const { data: packData, error: packError } = await supabase
        .from('packs')
        .insert({
          name,
          slug,
          description,
          genre,
          artist_id: artistId || null,
          cover_art_url: coverArtUrl
        })
        .select()
        .single();
      
      if (packError) throw packError;
      
      // Add samples to pack
      const packSamples = selectedSamples.map((sampleId, index) => ({
        pack_id: packData.id,
        sample_id: sampleId,
        position: index
      }));
      
      const { error: samplesError } = await supabase
        .from('pack_samples')
        .insert(packSamples);
      
      if (samplesError) throw samplesError;
      
      toast.success('Pack created successfully!');
      router.push('/admin/packs');
      
    } catch (error) {
      console.error('Error creating pack:', error);
      toast.error('Failed to create pack');
    } finally {
      setSaving(false);
      setUploadingArt(false);
    }
  };

  const toggleSampleSelection = (sampleId: string) => {
    setSelectedSamples(prev => 
      prev.includes(sampleId) 
        ? prev.filter(id => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Sample Pack</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pack Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select Genre</option>
                  <option value="trap">Trap</option>
                  <option value="rnb">R&B</option>
                  <option value="soul">Soul</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Artist</label>
                <select
                  value={artistId}
                  onChange={(e) => setArtistId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="">Various Artists</option>
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
          
          {/* Cover Art */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Cover Art *</h2>
            
            <div className="flex items-start gap-6">
              {coverArtPreview ? (
                <div className="relative w-40 h-40 rounded-lg overflow-hidden">
                  <img
                    src={coverArtPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverArtFile(null);
                      setCoverArtPreview('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="w-40 h-40 border-2 border-dashed border-neutral-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-500" />
                    <span className="text-sm text-neutral-500">Upload Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverArtChange}
                    className="hidden"
                  />
                </label>
              )}
              
              <div className="flex-1">
                <p className="text-sm text-neutral-400 mb-2">
                  Upload a square image (1080x1080 recommended) for the pack cover.
                </p>
                <p className="text-xs text-neutral-500">
                  Supported formats: JPG, PNG, WebP. Max size: 5MB.
                </p>
              </div>
            </div>
          </div>
          
          {/* Sample Selection */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Select Samples ({selectedSamples.length} selected)
            </h2>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {availableSamples.map(sample => (
                <label
                  key={sample.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSamples.includes(sample.id)
                      ? 'bg-orange-500/20 border border-orange-500'
                      : 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSamples.includes(sample.id)}
                    onChange={() => toggleSampleSelection(sample.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{sample.name}</div>
                    <div className="text-sm text-neutral-400">
                      {sample.artist?.name} • {sample.bpm} BPM • {sample.key} • {sample.genre}
                    </div>
                  </div>
                  {sample.has_stems && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">
                      STEMS
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
          
          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/packs')}
              className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingArt}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 rounded-lg transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadingArt ? 'Uploading Art...' : 'Creating Pack...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Pack</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
          
          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/packs')}
              className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingArt}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 rounded-lg transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadingArt ? 'Uploading Art...' : 'Creating Pack...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Pack</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}