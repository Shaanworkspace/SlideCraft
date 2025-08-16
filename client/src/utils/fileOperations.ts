import { Presentation } from '@shared/schema';
import PptxGenJS from 'pptxgenjs';

export interface FileOperations {
  savePresentation: (presentation: Presentation) => void;
  loadPresentation: () => Promise<Presentation | null>;
  exportSlideAsImage: (dataUrl: string, fileName?: string) => void;
}

// Save presentation as PPTX file
export const savePresentation = async (presentation: Presentation): Promise<void> => {
  try {
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'PowerPoint Editor';
    pptx.company = 'Local App';
    pptx.title = presentation.title;
    
    // Add slides
    presentation.slides.forEach((slide, index) => {
      const pptxSlide = pptx.addSlide();
      
      // Add slide title as a background element
      if (slide.title) {
        pptxSlide.addText(slide.title, {
          x: 0.5,
          y: 0.2,
          w: '90%',
          h: 0.5,
          fontSize: 24,
          bold: true,
          align: 'center',
          color: '363636'
        });
      }
      
      // Add elements to slide
      slide.elements.forEach((element) => {
        // Convert pixels to inches (approximate conversion for PowerPoint)
        const xInch = (element.x / 72); // 72 pixels per inch
        const yInch = (element.y / 72);
        const wInch = (element.width / 72);
        const hInch = (element.height / 72);
        
        switch (element.type) {
          case 'text':
            pptxSlide.addText(element.text || 'Text', {
              x: xInch,
              y: yInch,
              w: wInch,
              h: hInch,
              fontSize: element.fontSize || 16,
              fontFace: element.fontFamily || 'Arial',
              bold: element.fontWeight === 'bold',
              color: element.fill?.replace('#', '') || '212121',
              align: element.textAlign || 'left'
            });
            break;
            
          case 'rectangle':
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: xInch,
              y: yInch,
              w: wInch,
              h: hInch,
              fill: { color: element.fill?.replace('#', '') || '1976D2' },
              line: element.stroke ? {
                color: element.stroke.replace('#', ''),
                width: element.strokeWidth || 1
              } : undefined
            });
            break;
            
          case 'circle':
            pptxSlide.addShape(pptx.ShapeType.ellipse, {
              x: xInch,
              y: yInch,
              w: wInch,
              h: hInch,
              fill: { color: element.fill?.replace('#', '') || '1976D2' },
              line: element.stroke ? {
                color: element.stroke.replace('#', ''),
                width: element.strokeWidth || 1
              } : undefined
            });
            break;
            
          case 'line':
            pptxSlide.addShape(pptx.ShapeType.line, {
              x: xInch,
              y: yInch,
              w: wInch,
              h: hInch,
              line: {
                color: element.stroke?.replace('#', '') || element.fill?.replace('#', '') || '212121',
                width: element.strokeWidth || 2
              }
            });
            break;
            
          case 'image':
            if (element.src) {
              try {
                pptxSlide.addImage({
                  data: element.src,
                  x: xInch,
                  y: yInch,
                  w: wInch,
                  h: hInch
                });
              } catch (imageError) {
                console.warn('Failed to add image to slide:', imageError);
              }
            }
            break;
        }
      });
    });
    
    // Generate and download the PPTX file
    await pptx.writeFile({ fileName: `${presentation.title || 'presentation'}.pptx` });
    
  } catch (error) {
    console.error('Error saving presentation:', error);
    throw new Error('Failed to save presentation. Please try again.');
  }
};

// Load presentation from JSON file (keeping JSON for compatibility)
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

// Modern file save using File System Access API (if supported) - now saves as PPTX
export const saveWithFileSystemAccess = async (presentation: Presentation): Promise<void> => {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API not supported');
  }

  try {
    // For File System Access API, we'll use the regular save method
    // since pptxgenjs handles the file creation
    await savePresentation(presentation);
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