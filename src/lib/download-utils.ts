// lib/download-utils.ts
// Utility functions for handling file downloads

/**
 * Downloads a file by fetching it as a blob and triggering a download
 * This ensures the file downloads instead of opening in a new tab
 */
export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * Alternative download method using modern File System Access API
 * Falls back to traditional method if not supported
 */
export async function downloadFileModern(url: string, filename: string): Promise<void> {
  // Check if the File System Access API is available
  if ('showSaveFilePicker' in window) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      
      // Show save file picker
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Audio Files',
          accept: {
            'audio/mpeg': ['.mp3'],
            'audio/wav': ['.wav']
          }
        }]
      });
      
      // Write the file
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      
    } catch (error: any) {
      // User cancelled or error occurred, fall back to traditional method
      if (error.name !== 'AbortError') {
        console.log('Falling back to traditional download method');
        await downloadFile(url, filename);
      }
    }
  } else {
    // Fall back to traditional download method
    await downloadFile(url, filename);
  }
}

/**
 * Downloads multiple files with progress tracking
 */
export async function downloadMultipleFiles(
  files: Array<{ url: string; filename: string }>,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  let completed = 0;
  
  for (const file of files) {
    await downloadFile(file.url, file.filename);
    completed++;
    onProgress?.(completed, files.length);
  }
}