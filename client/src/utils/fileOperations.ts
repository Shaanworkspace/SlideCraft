import { Presentation } from '@shared/schema';

export interface FileOperations {
  savePresentation: (presentation: Presentation) => void;
  loadPresentation: () => Promise<Presentation | null>;
  exportSlideAsImage: (dataUrl: string, fileName?: string) => void;
}

// Save presentation as JSON file
export const savePresentation = (presentation: Presentation): void => {
  try {
    const dataStr = JSON.stringify(presentation, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${presentation.title || 'presentation'}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error saving presentation:', error);
    throw new Error('Failed to save presentation. Please try again.');
  }
};

// Load presentation from JSON file
export const loadPresentation = (): Promise<Presentation | null> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const presentation = JSON.parse(content) as Presentation;
          
          // Basic validation
          if (!presentation.id || !presentation.slides || !Array.isArray(presentation.slides)) {
            throw new Error('Invalid presentation format');
          }
          
          // Convert date strings back to Date objects
          presentation.createdAt = new Date(presentation.createdAt);
          presentation.updatedAt = new Date(presentation.updatedAt);
          
          resolve(presentation);
        } catch (error) {
          console.error('Error parsing presentation file:', error);
          reject(new Error('Invalid presentation file format. Please select a valid JSON file.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file. Please try again.'));
      };
      
      reader.readAsText(file);
    };
    
    input.oncancel = () => {
      resolve(null);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
};

// Export slide as image
export const exportSlideAsImage = (dataUrl: string, fileName: string = 'slide'): void => {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting image:', error);
    throw new Error('Failed to export image. Please try again.');
  }
};

// Check if File System Access API is supported
export const isFileSystemAccessSupported = (): boolean => {
  return 'showSaveFilePicker' in window;
};

// Modern file save using File System Access API (if supported)
export const saveWithFileSystemAccess = async (presentation: Presentation): Promise<void> => {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API not supported');
  }

  try {
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: `${presentation.title || 'presentation'}.json`,
      types: [
        {
          description: 'JSON files',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
    });

    const writable = await fileHandle.createWritable();
    const dataStr = JSON.stringify(presentation, null, 2);
    await writable.write(dataStr);
    await writable.close();
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled, don't throw error
      return;
    }
    console.error('Error saving with File System Access API:', error);
    throw new Error('Failed to save presentation. Please try again.');
  }
};

// Modern file load using File System Access API (if supported)
export const loadWithFileSystemAccess = async (): Promise<Presentation | null> => {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API not supported');
  }

  try {
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'JSON files',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
      multiple: false,
    });

    const file = await fileHandle.getFile();
    const content = await file.text();
    const presentation = JSON.parse(content) as Presentation;
    
    // Basic validation
    if (!presentation.id || !presentation.slides || !Array.isArray(presentation.slides)) {
      throw new Error('Invalid presentation format');
    }
    
    // Convert date strings back to Date objects
    presentation.createdAt = new Date(presentation.createdAt);
    presentation.updatedAt = new Date(presentation.updatedAt);
    
    return presentation;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled
      return null;
    }
    console.error('Error loading with File System Access API:', error);
    throw new Error('Failed to load presentation. Please check the file format.');
  }
};
