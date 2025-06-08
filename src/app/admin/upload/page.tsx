// app/admin/upload/page.tsx
'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    name: '',
    artistName: '',
    genre: 'trap',
    bpm: '',
    key: 'C',
    tags: [] as string[],
    has_stems: false,
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert('Sample uploaded successfully!');
        // Reset form
        setFile(null);
        setMetadata({
          name: '',
          artistName: '',
          genre: 'trap',
          bpm: '',
          key: 'C',
          tags: [],
          has_stems: false,
        });
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Sample</h1>
        
        <form onSubmit={handleUpload} className="space-y-6">
          {/* File input */}
          <div>
            <label className="block text-sm font-medium mb-2">Audio File</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
              required
            />
          </div>

          {/* Sample name */}
          <div>
            <label className="block text-sm font-medium mb-2">Sample Name</label>
            <input
              type="text"
              value={metadata.name}
              onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
              required
            />
          </div>

          {/* Artist name */}
          <div>
            <label className="block text-sm font-medium mb-2">Artist Name</label>
            <input
              type="text"
              value={metadata.artistName}
              onChange={(e) => setMetadata({ ...metadata, artistName: e.target.value })}
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
              required
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select
              value={metadata.genre}
              onChange={(e) => setMetadata({ ...metadata, genre: e.target.value })}
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
            >
              <option value="trap">Trap</option>
              <option value="rnb">R&B</option>
              <option value="soul">Soul</option>
            </select>
          </div>

          {/* BPM and Key */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">BPM</label>
              <input
                type="number"
                value={metadata.bpm}
                onChange={(e) => setMetadata({ ...metadata, bpm: e.target.value })}
                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Key</label>
              <select
                value={metadata.key}
                onChange={(e) => setMetadata({ ...metadata, key: e.target.value })}
                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
              >
                <option value="C">C</option>
                <option value="C#">C#</option>
                <option value="D">D</option>
                <option value="D#">D#</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#</option>
                <option value="G">G</option>
                <option value="G#">G#</option>
                <option value="A">A</option>
                <option value="A#">A#</option>
                <option value="B">B</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="dark, melodic, 808"
              onChange={(e) => setMetadata({ 
                ...metadata, 
                tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
              })}
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-lg"
            />
          </div>

          {/* Has stems */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="has_stems"
              checked={metadata.has_stems}
              onChange={(e) => setMetadata({ ...metadata, has_stems: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="has_stems" className="text-sm">Has stem files</label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Sample</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}