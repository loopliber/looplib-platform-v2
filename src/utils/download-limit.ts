// src/utils/download-limit.ts

// Utility functions for managing download limits
interface DownloadRecord {
  sampleId: string;
  timestamp: number;
}

const DAILY_DOWNLOAD_LIMIT = 4; // Changed from 10 to 4
const DOWNLOAD_RESET_HOURS = 24;

// Get downloads from localStorage
const getStoredDownloads = (): DownloadRecord[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('user_downloads');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save downloads to localStorage
const saveDownloads = (downloads: DownloadRecord[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_downloads', JSON.stringify(downloads));
};

// Clean old downloads (older than 24 hours)
const cleanOldDownloads = (downloads: DownloadRecord[]): DownloadRecord[] => {
  const cutoff = Date.now() - (DOWNLOAD_RESET_HOURS * 60 * 60 * 1000);
  return downloads.filter(download => download.timestamp > cutoff);
};

// Check if user can download
export const canDownload = (): boolean => {
  const downloads = getStoredDownloads();
  const recentDownloads = cleanOldDownloads(downloads);
  return recentDownloads.length < DAILY_DOWNLOAD_LIMIT;
};

// Record a download
export const recordDownload = (sampleId: string): void => {
  const downloads = getStoredDownloads();
  const recentDownloads = cleanOldDownloads(downloads);
  
  const newDownload: DownloadRecord = {
    sampleId,
    timestamp: Date.now()
  };
  
  recentDownloads.push(newDownload);
  saveDownloads(recentDownloads);
};

// Get remaining downloads
export const getRemainingDownloads = (): number => {
  const downloads = getStoredDownloads();
  const recentDownloads = cleanOldDownloads(downloads);
  return Math.max(0, DAILY_DOWNLOAD_LIMIT - recentDownloads.length);
};

// Check if user has unlimited downloads (premium feature)
export const hasUnlimitedDownloads = (user: any): boolean => {
  // Add your premium user check logic here
  // For now, return false for all users
  return false;
};

// Check if sample was already downloaded today
export const hasDownloadedToday = (sampleId: string): boolean => {
  const downloads = getStoredDownloads();
  const recentDownloads = cleanOldDownloads(downloads);
  return recentDownloads.some(download => download.sampleId === sampleId);
};

// Get time until downloads reset
export const getTimeUntilReset = (): string => {
  const downloads = getStoredDownloads();
  if (downloads.length === 0) return "24 hours";
  
  const oldestDownload = Math.min(...downloads.map(d => d.timestamp));
  const resetTime = oldestDownload + (DOWNLOAD_RESET_HOURS * 60 * 60 * 1000);
  const timeUntilReset = resetTime - Date.now();
  
  if (timeUntilReset <= 0) return "Now";
  
  const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
  const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// In src/components/SampleBrowser.tsx, find handleFreeDownload function and replace the limit check:

// Around line 330, replace the download limit check with:
const handleFreeDownload = async (sample: Sample) => {
  setDownloadingId(sample.id);
  
  try {
    // Remove all download limit checks - unlimited for everyone
    
    const extension = sample.file_url.split('.').pop() || 'mp3';
    const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
    const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
    const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted} @LOOPLIB.${extension}`;

    await downloadFile(sample.file_url, downloadFilename);

    toast.success('Download complete!');
    
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download sample');
  } finally {
    setDownloadingId(null);
  }
};

// In src/components/GenrePageTemplate.tsx, find handleFreeDownload and do the same:

const handleFreeDownload = async (sample: Sample) => {
  setDownloadingId(sample.id);

  try {
    // Remove all download limit checks - unlimited for everyone
    
    const extension = sample.file_url.split('.').pop() || 'mp3';
    const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
    const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
    const downloadFilename = `${nameFormatted}_${sample.bpm}_${keyFormatted}_${config.genreSlug} @LOOPLIB.${extension}`;

    await downloadFile(sample.file_url, downloadFilename);

    toast.success('Download complete!');
    
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download sample');
  } finally {
    setDownloadingId(null);
  }
};