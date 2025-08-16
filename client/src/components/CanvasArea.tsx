import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addElement, setZoom, saveToHistory } from '@/store/presentationSlice';
import { useFabricCanvas } from '@/hooks/useFabricCanvas';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
import { SlideElement, TextElement, ShapeElement } from '@shared/schema';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';

interface CanvasAreaProps {
  onExportSlide: (dataUrl: string) => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({ onExportSlide }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { presentation, ui } = useSelector((state: RootState) => state.presentation);
  const { canvas, addElement: addElementToCanvas, setZoom: setCanvasZoom, exportAsImage } = useFabricCanvas(canvasRef);

  // Handle tool selection and canvas interaction
  useEffect(() => {
    if (!canvas) return;

    const handleCanvasClick = (e: any) => {
      if (ui.selectedTool === 'select') return;

      const pointer = canvas.getPointer(e.e);
      
      dispatch(saveToHistory());
      
      let newElement: SlideElement;

      switch (ui.selectedTool) {
        case 'text':
          newElement = {
            id: nanoid(),
            type: 'text',
            x: pointer.x,
            y: pointer.y,
            width: 200,
            height: 50,
            angle: 0,
            opacity: 1,
            text: 'New Text',
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: 'normal',
            fill: '#212121',
            textAlign: 'left',
          } as TextElement;
          break;

        case 'rectangle':
          newElement = {
            id: nanoid(),
            type: 'rectangle',
            x: pointer.x,
            y: pointer.y,
            width: 100,
            height: 60,
            angle: 0,
            opacity: 1,
            fill: '#1976D2',
            strokeWidth: 1,
          } as ShapeElement;
          break;

        case 'circle':
          newElement = {
            id: nanoid(),
            type: 'circle',
            x: pointer.x,
            y: pointer.y,
            width: 80,
            height: 80,
            angle: 0,
            opacity: 1,
            fill: '#1976D2',
            strokeWidth: 1,
          } as ShapeElement;
          break;

        case 'line':
          newElement = {
            id: nanoid(),
            type: 'line',
            x: pointer.x,
            y: pointer.y,
            width: 100,
            height: 0,
            angle: 0,
            opacity: 1,
            fill: '#212121',
            strokeWidth: 2,
          } as ShapeElement;
          break;

        case 'image':
          fileInputRef.current?.click();
          return;

        default:
          return;
      }

      dispatch(addElement(newElement));
      addElementToCanvas(newElement);
    };

    canvas.on('mouse:down', handleCanvasClick);

    return () => {
      canvas.off('mouse:down', handleCanvasClick);
    };
  }, [canvas, ui.selectedTool, dispatch, addElementToCanvas]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgSrc = event.target?.result as string;
      
      dispatch(saveToHistory());
      
      const newElement: SlideElement = {
        id: nanoid(),
        type: 'image',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        angle: 0,
        opacity: 1,
        src: imgSrc,
        alt: file.name,
      };

      dispatch(addElement(newElement));
      addElementToCanvas(newElement);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(ui.zoom * 1.2, 5);
    dispatch(setZoom(newZoom));
    setCanvasZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(ui.zoom / 1.2, 0.1);
    dispatch(setZoom(newZoom));
    setCanvasZoom(newZoom);
  };

  const handleFitToScreen = () => {
    const newZoom = 1;
    dispatch(setZoom(newZoom));
    setCanvasZoom(newZoom);
  };

  const handleActualSize = () => {
    const newZoom = 1;
    dispatch(setZoom(newZoom));
    setCanvasZoom(newZoom);
  };

  const handleExportSlide = () => {
    const dataUrl = exportAsImage('png');
    onExportSlide(dataUrl);
  };

  if (!presentation) {
    return (
      <div className="flex-1 bg-gray-200 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-full">
          <div className="text-center text-text-secondary">
            <h2 className="text-2xl font-semibold mb-4">No Presentation</h2>
            <p>Create a new presentation or load an existing one to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Canvas Container */}
      <div className="flex-1 bg-gray-200 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg" style={{ aspectRatio: '16/9' }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full rounded-lg"
              data-testid="presentation-canvas"
            />
          </div>
          
          {/* Canvas Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">Zoom:</span>
              <Button
                onClick={handleZoomOut}
                size="sm"
                variant="ghost"
                data-testid="button-zoom-out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[3rem] text-center">
                {Math.round(ui.zoom * 100)}%
              </span>
              <Button
                onClick={handleZoomIn}
                size="sm"
                variant="ghost"
                data-testid="button-zoom-in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleFitToScreen}
                size="sm"
                variant="outline"
                data-testid="button-fit-to-screen"
              >
                <Maximize className="w-4 h-4 mr-1" />
                Fit to Screen
              </Button>
              <Button
                onClick={handleActualSize}
                size="sm"
                variant="outline"
                data-testid="button-actual-size"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Actual Size
              </Button>
              <Button
                onClick={handleExportSlide}
                size="sm"
                variant="outline"
                data-testid="button-export-current-slide"
              >
                Export This Slide
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        data-testid="input-image-upload"
      />
    </div>
  );
};
