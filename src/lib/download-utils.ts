export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Small delay to ensure download starts
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download file');
  }
};

export const formatFilename = (sample: any, genre?: string): string => {
  const extension = sample.file_url?.split('.').pop() || 'mp3';
  const keyFormatted = sample.key ? sample.key.toLowerCase().replace(/\s+/g, '') : 'cmaj';
  const nameFormatted = sample.name.toLowerCase().replace(/\s+/g, '');
  const genreFormatted = genre || sample.genre || 'sample';
  
  return `${nameFormatted}_${sample.bpm}_${keyFormatted}_${genreFormatted} @LOOPLIB.${extension}`;
};

export const downloadSample = async (sample: any, genre?: string): Promise<void> => {
  const filename = formatFilename(sample, genre);
  await downloadFile(sample.file_url, filename);
};