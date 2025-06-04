// app/api/admin/upload/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string);

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('samples')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('samples')
      .getPublicUrl(fileName);

    // Get or create artist
    let { data: artist } = await supabaseAdmin
      .from('artists')
      .select()
      .eq('name', metadata.artistName)
      .single();

    if (!artist) {
      const { data: newArtist } = await supabaseAdmin
        .from('artists')
        .insert({ name: metadata.artistName })
        .select()
        .single();
      artist = newArtist;
    }

    // Insert sample record
    const { data, error: dbError } = await supabaseAdmin
      .from('samples')
      .insert({
        name: metadata.name,
        artist_id: artist.id,
        genre: metadata.genre,
        bpm: parseInt(metadata.bpm),
        key: metadata.key,
        duration: metadata.duration,
        tags: metadata.tags,
        file_url: publicUrl,
        waveform_data: generateWaveformData(),
        downloads: 0,
        likes: 0,
        is_premium: false
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function generateWaveformData(length = 64) {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.2);
}