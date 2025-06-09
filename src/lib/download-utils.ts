export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    // For same-origin or CORS-enabled files, fetch and create blob
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'audio/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to DOM, click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URL
    window.URL.revokeObjectURL(blobUrl);
    
    // Small delay to ensure download starts
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Download error:', error);
    
    // Fallback: try direct link method
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_self'; // Ensure it doesn't open in new tab
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (fallbackError) {
      console.error('Fallback download error:', fallbackError);
      throw new Error('Failed to download file');
    }
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