// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { uploadToR2 } from '@/lib/r2-client';

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
    const fileName = `samples/${timestamp}_${cleanName}`;

    // Convert file to buffer for R2 upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload file to Cloudflare R2
    const fileUrl = await uploadToR2(fileName, fileBuffer, file.type);

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
          file_url: fileUrl,
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