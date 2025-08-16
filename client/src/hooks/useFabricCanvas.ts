import { useEffect, useRef, useCallback } from 'react';
import { Canvas, Textbox, Rect, Circle, Line, FabricImage, FabricObject } from 'fabric';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  setSelectedElement, 
  updateElement, 
  updateCanvasState, 
  saveToHistory 
} from '@/store/presentationSlice';
import { SlideElement, TextElement, ShapeElement, ImageElement } from '@shared/schema';

export const useFabricCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const canvasInstance = useRef<Canvas | null>(null);
  const dispatch = useDispatch();
  
  const { presentation, ui } = useSelector((state: RootState) => state.presentation);
  const activeSlide = presentation?.slides.find(s => s.id === presentation.activeSlideId);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: ui.canvasSize.width,
      height: ui.canvasSize.height,
      backgroundColor: '#ffffff',
    });

    canvasInstance.current = canvas;

    // Selection event handlers
    canvas.on('selection:created', (e: any) => {
      if (e.selected && e.selected.length === 1) {
        const obj = e.selected[0];
        dispatch(setSelectedElement(obj.data?.id || null));
      }
    });

    canvas.on('selection:updated', (e: any) => {
      if (e.selected && e.selected.length === 1) {
        const obj = e.selected[0];
        dispatch(setSelectedElement(obj.data?.id || null));
      }
    });

    canvas.on('selection:cleared', () => {
      dispatch(setSelectedElement(null));
    });

    // Object modification handlers
    canvas.on('object:modified', (e: any) => {
      if (e.target && e.target.data?.id) {
        dispatch(saveToHistory());
        
        const updates = {
          x: e.target.left || 0,
          y: e.target.top || 0,
          width: e.target.width ? e.target.width * (e.target.scaleX || 1) : 0,
          height: e.target.height ? e.target.height * (e.target.scaleY || 1) : 0,
          angle: e.target.angle || 0,
        };

        dispatch(updateElement({
          elementId: e.target.data.id,
          updates,
        }));

        // Save canvas state
        if (activeSlide) {
          dispatch(updateCanvasState({
            slideId: activeSlide.id,
            canvasState: canvas.toJSON(),
          }));
        }
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [canvasRef, ui.canvasSize]);

  // Load slide content
  useEffect(() => {
    if (!canvasInstance.current || !activeSlide) return;

    const canvas = canvasInstance.current;
    
    // Clear canvas
    canvas.clear();

    // Load from saved canvas state if available
    if (activeSlide.canvasState) {
      canvas.loadFromJSON(activeSlide.canvasState, () => {
        canvas.renderAll();
      });
    } else {
      // Create fabric objects from elements
      activeSlide.elements.forEach(element => {
        const fabricObj = createFabricObject(element);
        if (fabricObj) {
          canvas.add(fabricObj);
        }
      });
      canvas.renderAll();
    }
  }, [activeSlide?.id]);

  // Create fabric object from element data
  const createFabricObject = (element: SlideElement): FabricObject | null => {
    let obj: FabricObject | null = null;

    switch (element.type) {
      case 'text':
        const textElement = element as TextElement;
        obj = new Textbox(textElement.text, {
          left: textElement.x,
          top: textElement.y,
          width: textElement.width,
          height: textElement.height,
          fontSize: textElement.fontSize,
          fontFamily: textElement.fontFamily,
          fontWeight: textElement.fontWeight,
          fill: textElement.fill,
          backgroundColor: textElement.backgroundColor,
          textAlign: textElement.textAlign,
        });
        break;

      case 'rectangle':
        const rectElement = element as ShapeElement;
        obj = new Rect({
          left: rectElement.x,
          top: rectElement.y,
          width: rectElement.width,
          height: rectElement.height,
          fill: rectElement.fill,
          stroke: rectElement.stroke,
          strokeWidth: rectElement.strokeWidth,
        });
        break;

      case 'circle':
        const circleElement = element as ShapeElement;
        obj = new Circle({
          left: circleElement.x,
          top: circleElement.y,
          radius: Math.min(circleElement.width, circleElement.height) / 2,
          fill: circleElement.fill,
          stroke: circleElement.stroke,
          strokeWidth: circleElement.strokeWidth,
        });
        break;

      case 'line':
        const lineElement = element as ShapeElement;
        obj = new Line([
          lineElement.x,
          lineElement.y,
          lineElement.x + lineElement.width,
          lineElement.y + lineElement.height,
        ], {
          stroke: lineElement.stroke || lineElement.fill,
          strokeWidth: lineElement.strokeWidth,
        });
        break;

      case 'image':
        const imageElement = element as ImageElement;
        // Note: fabric.Image.fromURL is async, so we handle it differently
        FabricImage.fromURL(imageElement.src).then((img: FabricObject) => {
          img.set({
            left: imageElement.x,
            top: imageElement.y,
            width: imageElement.width,
            height: imageElement.height,
          });
          (img as any).data = { id: imageElement.id, type: imageElement.type };
          canvasInstance.current?.add(img);
          canvasInstance.current?.renderAll();
        }).catch(() => {
          console.error('Failed to load image:', imageElement.src);
        });
        return null; // Return null since we handle async loading above
    }

    if (obj) {
      obj.set({
        angle: element.angle,
        opacity: element.opacity,
        ...element.fabricProps,
      });
      (obj as any).data = { id: element.id, type: element.type };
    }

    return obj;
  };

  // Add new element to canvas
  const addElement = useCallback((element: SlideElement) => {
    if (!canvasInstance.current) return;

    const fabricObj = createFabricObject(element);
    if (fabricObj) {
      canvasInstance.current.add(fabricObj);
      canvasInstance.current.setActiveObject(fabricObj);
      canvasInstance.current.renderAll();
    }
  }, []);

  // Delete selected element
  const deleteSelectedElement = useCallback(() => {
    if (!canvasInstance.current) return;

    const activeObject = canvasInstance.current.getActiveObject();
    if (activeObject) {
      canvasInstance.current.remove(activeObject);
      dispatch(setSelectedElement(null));
    }
  }, [dispatch]);

  // Set zoom level
  const setZoom = useCallback((zoom: number) => {
    if (!canvasInstance.current) return;

    canvasInstance.current.setZoom(zoom);
    canvasInstance.current.renderAll();
  }, []);

  // Export canvas as image
  const exportAsImage = useCallback((format: 'png' | 'jpeg' = 'png'): string => {
    if (!canvasInstance.current) return '';

    return canvasInstance.current.toDataURL({
      format,
      quality: 0.9,
      multiplier: 2, // Higher resolution
    });
  }, []);

  return {
    canvas: canvasInstance.current,
    addElement,
    deleteSelectedElement,
    setZoom,
    exportAsImage,
  };
};
