// app/api/admin/generate-preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// You'll need to install: npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function POST(request: NextRequest) {
  try {
    const { sampleId, fileUrl } = await request.json();
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate preview filename
    const timestamp = Date.now();
    const previewFileName = `previews/${sampleId}_preview_${timestamp}.mp3`;
    
    // Create preview using FFmpeg (for local/server processing)
    // For Vercel, you might need to use a cloud service
    const previewUrl = await generatePreview(fileUrl, previewFileName);
    
    // Update database with preview URL
    const { error } = await supabaseAdmin
      .from('samples')
      .update({ preview_url: previewUrl })
      .eq('id', sampleId);

    if (error) throw error;

    return NextResponse.json({ success: true, previewUrl });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}

// For cloud processing (recommended for Vercel)
async function generatePreviewCloud(fileUrl: string, outputFileName: string) {
  // Option 1: Use Cloudinary
  // Option 2: Use AWS Lambda with FFmpeg layer
  // Option 3: Use a service like Bannerbear or Shotstack
  
  // Example with a cloud service API:
  const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDCONVERT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tasks: {
        'import-file': {
          operation: 'import/url',
          url: fileUrl
        },
        'convert-audio': {
          operation: 'convert',
          input: 'import-file',
          output_format: 'mp3',
          some_other_option: {
            audio_bitrate: 128,
            audio_codec: 'mp3',
            trim_start: '0',
            trim_duration: '25' // 25 seconds
          }
        },
        'export-file': {
          operation: 'export/url',
          input: 'convert-audio'
        }
      }
    })
  });
  
  const result = await response.json();
  return result.url;
}