// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadataString = formData.get('metadata') as string;
    
    if (!file || !metadataString) {
      return NextResponse.json({ error: 'Missing file or metadata' }, { status: 400 });
    }

    const metadata = JSON.parse(metadataString);
    const supabase = createClient();

    // Create a unique filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${cleanName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('samples')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('samples')
      .getPublicUrl(fileName);

    // Insert sample metadata into database
    const { data: sampleData, error: dbError } = await supabase
      .from('samples')
      .insert([
        {
          name: metadata.name,
          artist_name: metadata.artistName,
          genre: metadata.genre,
          bpm: parseInt(metadata.bpm),
          key: metadata.key,
          tags: metadata.tags,
          file_url: publicUrl,
          file_name: fileName,
          file_size: file.size,
          has_stems: metadata.has_stems,
          duration: null,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('samples').remove([fileName]);
      return NextResponse.json({ error: 'Failed to save sample metadata' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      sample: sampleData 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}