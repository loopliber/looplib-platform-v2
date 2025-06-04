'use client';

import React, { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, Music, X, Save, Loader2, Plus, Hash, Clock, FileAudio } from 'lucide-react';
import toast from 'react-hot-toast';

interface SampleUpload {
  id: string;
  file: File | null;
  name: string;
  bpm: string;
  key: string;
  genre: string;
  tags: string[];
  duration: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

const GENRE_OPTIONS = ['trap', 'drill', 'rnb', 'soul'];
const KEY_OPTIONS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];
const KEY_TYPES = ['min', 'maj'];

const SUGGESTED_TAGS = [
  'trap', 'smooth', 'chill', 'guitar', 'soul', 'melodic', 'hard', 'emotional'
];

export default function AdminUploadPage() {
  const [samples, setSamples] = useState<SampleUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [artistName, setArtistName] = useState('LoopLib');
  const [isDragging, setIsDragging] = useState(false);
  const supabase = createClient();

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter(file => 
      file.type.includes('audio') || 
      ['.mp3', '.wav', '.m4a'].some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (audioFiles.length === 0) {
      toast.error('Please drop audio files only');
      return;
    }

    // Limit to 10 files at once
    const filesToAdd = audioFiles.slice(0, 10);
    if (audioFiles.length > 10) {
      toast('Only first 10 files will be added', {
        icon: '⚠️',
      });
    }

    // Create sample slots for each file
    const newSamples: SampleUpload[] = filesToAdd.map(file => {
      const filename = file.name.replace(/\.(mp3|wav|m4a)$/i, '');
      
      // Parse metadata from filename
      const bpmMatch = filename.match(/\b(\d{2,3})\b/);
      const bpm = bpmMatch ? bpmMatch[1] : '140';
      
      let key = 'C min';
      const keyMatch = filename.match(/([A-G]#?)\s*(min|maj)?/i);
      if (keyMatch) {
        key = `${keyMatch[1]} ${keyMatch[2] || 'min'}`;
      }
      
      let name = filename
        .replace(/\b\d{2,3}\b/g, '')
        .replace(/([A-G]#?\s*(?:min|maj)?)/gi, '')
        .replace(/@[^\s]+/g, '')
        .replace(/_/g, ' ')
        .trim();
      
      name = name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        id: Date.now().toString() + Math.random(),
        file,
        name,
        bpm,
        key,
        genre: 'trap',
        tags: [],
        duration: '0:15',
        uploading: false,
        uploaded: false
      };
    });

    setSamples(prev => [...prev, ...newSamples]);
    toast.success(`Added ${filesToAdd.length} samples`);
  }, []);

  // Add new sample slot
  const addSampleSlot = () => {
    const newSample: SampleUpload = {
      id: Date.now().toString(),
      file: null,
      name: '',
      bpm: '140',
      key: 'C min',
      genre: 'trap',
      tags: [],
      duration: '0:15',
      uploading: false,
      uploaded: false
    };
    setSamples([...samples, newSample]);
  };

  // Parse filename when file is selected
  const handleFileSelect = (sampleId: string, file: File) => {
    const filename = file.name.replace(/\.(mp3|wav|m4a)$/i, '');
    
    // Try to parse BPM from filename
    const bpmMatch = filename.match(/\b(\d{2,3})\b/);
    const bpm = bpmMatch ? bpmMatch[1] : '140';
    
    // Try to parse key
    let key = 'C min';
    const keyMatch = filename.match(/([A-G]#?)\s*(min|maj)?/i);
    if (keyMatch) {
      key = `${keyMatch[1]} ${keyMatch[2] || 'min'}`;
    }
    
    // Clean name
    let name = filename
      .replace(/\b\d{2,3}\b/g, '') // Remove BPM
      .replace(/([A-G]#?\s*(?:min|maj)?)/gi, '') // Remove key
      .replace(/@[^\s]+/g, '') // Remove producer tag
      .replace(/_/g, ' ')
      .trim();
    
    // Capitalize
    name = name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    setSamples(samples.map(s => 
      s.id === sampleId 
        ? { ...s, file, name, bpm, key }
        : s
    ));
  };

  // Update sample field
  const updateSample = (id: string, field: keyof SampleUpload, value: any) => {
    setSamples(samples.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  // Toggle tag
  const toggleTag = (sampleId: string, tag: string) => {
    setSamples(samples.map(s => {
      if (s.id === sampleId) {
        const tags = s.tags.includes(tag)
          ? s.tags.filter(t => t !== tag)
          : [...s.tags, tag];
        return { ...s, tags };
      }
      return s;
    }));
  };

  // Remove sample
  const removeSample = (id: string) => {
    setSamples(samples.filter(s => s.id !== id));
  };

  // Upload all samples
  const uploadAllSamples = async () => {
    const samplesToUpload = samples.filter(s => s.file && !s.uploaded);
    if (samplesToUpload.length === 0) {
      toast.error('No samples to upload');
      return;
    }

    setUploading(true);

    try {
      // Upload each sample
      for (const sample of samplesToUpload) {
        try {
          // Update UI to show uploading
          setSamples(prev => prev.map(s => 
            s.id === sample.id ? { ...s, uploading: true } : s
          ));

          // Upload file via API route (bypasses RLS)
          const formData = new FormData();
          formData.append('file', sample.file!);
          formData.append('metadata', JSON.stringify({
            name: sample.name,
            artistName,
            genre: sample.genre,
            bpm: sample.bpm,
            key: sample.key,
            duration: sample.duration,
            tags: sample.tags
          }));

          const response = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
          }

          const { data } = await response.json();

          // Mark as uploaded
          setSamples(prev => prev.map(s => 
            s.id === sample.id 
              ? { ...s, uploading: false, uploaded: true, url: data.file_url } 
              : s
          ));

          toast.success(`Uploaded: ${sample.name}`);

        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed: ${sample.name}`);
          setSamples(prev => prev.map(s => 
            s.id === sample.id ? { ...s, uploading: false } : s
          ));
        }
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  function generateWaveformData(length = 64) {
    return Array.from({ length }, () => Math.random() * 0.8 + 0.2);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Upload</h1>
          <p className="text-gray-400">Upload and configure multiple samples at once</p>
        </div>

        {/* Artist Name */}
        <div className="mb-6 bg-gray-900 rounded-lg p-4">
          <label className="block text-sm font-medium mb-2">Artist Name</label>
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="w-full max-w-xs px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`mb-8 border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
          }`}
        >
          <FileAudio className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-medium mb-2">
            {isDragging ? 'Drop files here' : 'Drag & Drop Audio Files'}
          </h3>
          <p className="text-gray-400 mb-4">
            Drop up to 10 samples at once (.mp3, .wav, .m4a)
          </p>
          <p className="text-sm text-gray-500">
            Files will be automatically parsed for BPM and key
          </p>
        </div>

        {/* Sample Upload Cards */}
        {samples.length > 5 ? (
          // Compact view for many samples
          <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
            {samples.map((sample, index) => (
              <div key={sample.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                  <span className="font-medium flex-1">{sample.name || 'Unnamed'}</span>
                  <span className="text-sm text-gray-400">{sample.bpm} BPM</span>
                  <span className="text-sm text-gray-400">{sample.key}</span>
                  <span className="text-sm text-gray-400">{sample.genre}</span>
                  {sample.uploaded && <span className="text-green-500 text-sm">✓</span>}
                  {sample.uploading && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                </div>
                <button
                  onClick={() => removeSample(sample.id)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors ml-4"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Detailed view for few samples
          <div className="space-y-4 mb-6">
            {samples.map((sample, index) => (
            <div key={sample.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Sample #{index + 1}</h3>
                <button
                  onClick={() => removeSample(sample.id)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Audio File</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(sample.id, e.target.files[0])}
                    className="hidden"
                    id={`file-${sample.id}`}
                  />
                  <label
                    htmlFor={`file-${sample.id}`}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md cursor-pointer transition-colors flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{sample.file ? sample.file.name : 'Choose File'}</span>
                  </label>
                  {sample.uploaded && (
                    <span className="text-green-500 text-sm">✓ Uploaded</span>
                  )}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={sample.name}
                    onChange={(e) => updateSample(sample.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="Sample name"
                  />
                </div>

                {/* BPM */}
                <div>
                  <label className="block text-sm font-medium mb-1">BPM</label>
                  <input
                    type="number"
                    value={sample.bpm}
                    onChange={(e) => updateSample(sample.id, 'bpm', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="140"
                    min="60"
                    max="200"
                  />
                </div>

                {/* Key */}
                <div>
                  <label className="block text-sm font-medium mb-1">Key</label>
                  <select
                    value={sample.key}
                    onChange={(e) => updateSample(sample.id, 'key', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
                  >
                    {KEY_OPTIONS.map(note => 
                      KEY_TYPES.map(type => (
                        <option key={`${note} ${type}`} value={`${note} ${type}`}>
                          {note} {type}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium mb-1">Genre</label>
                  <select
                    value={sample.genre}
                    onChange={(e) => updateSample(sample.id, 'genre', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
                  >
                    {GENRE_OPTIONS.map(genre => (
                      <option key={genre} value={genre}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(sample.id, tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        sample.tags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Selected: {sample.tags.join(', ') || 'None'}
                </div>
              </div>

              {/* Upload Progress */}
              {sample.uploading && (
                <div className="mt-4 flex items-center space-x-2 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
                      ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <div>
            <input
              type="file"
              accept=".mp3,.wav,.m4a"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files).slice(0, 10);
                  files.forEach(file => {
                    const newSample: SampleUpload = {
                      id: Date.now().toString() + Math.random(),
                      file: null,
                      name: '',
                      bpm: '140',
                      key: 'C min',
                      genre: 'trap',
                      tags: [],
                      duration: '0:15',
                      uploading: false,
                      uploaded: false
                    };
                    setSamples(prev => [...prev, newSample]);
                    // Parse and set file
                    handleFileSelect(newSample.id, file);
                  });
                  e.target.value = ''; // Reset input
                }
              }}
              className="hidden"
              id="multi-file-input"
            />
            <label
              htmlFor="multi-file-input"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Add Samples</span>
            </label>
          </div>

          <button
            onClick={uploadAllSamples}
            disabled={uploading || samples.length === 0}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Upload All Samples</span>
              </>
            )}
          </button>

          <span className="text-sm text-gray-400">
            {samples.filter(s => s.file).length} files selected
          </span>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-medium mb-2">Quick Tips</h3>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>• Files are automatically parsed for BPM and key from filename</li>
            <li>• You can manually adjust all values before uploading</li>
            <li>• Click tags to add/remove them from samples</li>
            <li>• All samples upload to Supabase Storage and database</li>
            <li>• Maximum 20 samples at once for best performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}