// lib/audio-processing.ts
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { uploadToR2 } from './r2-client';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

ffmpeg.setFfmpegPath(ffmpegStatic!);

interface ProcessedAudio {
  previewUrl: string;
  fullUrl: string;
  duration: number;
  waveformData: number[];
}

export async function processAudioFile(
  inputBuffer: Buffer,
  fileName: string,
  sampleId: string
): Promise<ProcessedAudio> {
  const tempDir = `/tmp/${crypto.randomBytes(16).toString('hex')}`;
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Save input file temporarily
    const inputPath = path.join(tempDir, 'input.wav');
    const previewPath = path.join(tempDir, 'preview.mp3');
    await fs.writeFile(inputPath, inputBuffer);

    // Get audio info
    const audioInfo = await getAudioInfo(inputPath);
    const duration = audioInfo.duration;

    // Generate preview (25 seconds max, from the most interesting part)
    const previewStart = selectBestPreviewStart(duration);
    
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(previewStart)
        .setDuration(Math.min(25, duration))
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .audioChannels(2)
        .audioFrequency(44100)
        .output(previewPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Generate waveform data
    const waveformData = await generateWaveformData(inputPath);

    // Upload to R2
    const [previewBuffer, fullBuffer] = await Promise.all([
      fs.readFile(previewPath),
      inputBuffer,
    ]);

    const timestamp = Date.now();
    const [previewUrl, fullUrl] = await Promise.all([
      uploadToR2(
        `previews/${sampleId}-${timestamp}-preview.mp3`,
        previewBuffer,
        'audio/mpeg'
      ),
      uploadToR2(
        `full/${sampleId}-${timestamp}-${fileName}`,
        fullBuffer,
        'audio/wav'
      ),
    ]);

    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });

    return {
      previewUrl,
      fullUrl,
      duration,
      waveformData,
    };
  } catch (error) {
    // Cleanup on error
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

// Select the most interesting part of the audio for preview
function selectBestPreviewStart(totalDuration: number): number {
  if (totalDuration <= 25) return 0;
  
  // For loops, start from beginning
  // For longer tracks, skip intro (usually 10-15% in)
  if (totalDuration > 60) {
    return totalDuration * 0.15; // Start at 15% of track
  }
  
  return 0;
}

// Generate waveform data (peaks for visualization)
async function generateWaveformData(
  audioPath: string,
  samples: number = 100
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const peaks: number[] = [];
    
    ffmpeg(audioPath)
      .audioFilters('aformat=channel_layouts=mono')
      .format('f32le')
      .pipe()
      .on('data', (chunk: Buffer) => {
        // Process audio data to extract peaks
        const floats = new Float32Array(chunk.buffer);
        const samplesPerPeak = Math.floor(floats.length / samples);
        
        for (let i = 0; i < samples; i++) {
          let peak = 0;
          for (let j = 0; j < samplesPerPeak; j++) {
            const idx = i * samplesPerPeak + j;
            if (idx < floats.length) {
              peak = Math.max(peak, Math.abs(floats[idx]));
            }
          }
          peaks.push(peak);
        }
      })
      .on('end', () => {
        // Normalize peaks to 0-1 range
        const maxPeak = Math.max(...peaks);
        const normalized = peaks.map(p => p / maxPeak);
        resolve(normalized.slice(0, samples));
      })
      .on('error', reject);
  });
}

// Get audio duration and info
async function getAudioInfo(audioPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format);
    });
  });
}