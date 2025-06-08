// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processAudioFile } from '@/lib/audio-processing';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate sample ID
    const sampleId = crypto.randomUUID();

    // Process audio (generate preview, upload to R2, extract waveform)
    const processed = await processAudioFile(buffer, file.name, sampleId);

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

    // Insert sample record with R2 URLs
    const { data, error: dbError } = await supabaseAdmin
      .from('samples')
      .insert({
        id: sampleId,
        name: metadata.name,
        artist_id: artist.id,
        genre: metadata.genre,
        bpm: parseInt(metadata.bpm),
        key: metadata.key,
        duration: Math.round(processed.duration).toString(),
        tags: metadata.tags,
        file_url: processed.fullUrl,        // R2 full file URL
        preview_url: processed.previewUrl,   // R2 preview URL
        waveform_data: processed.waveformData,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}