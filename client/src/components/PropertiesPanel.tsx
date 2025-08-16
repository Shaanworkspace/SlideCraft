import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  updateElement, 
  deleteElement, 
  duplicateElement, 
  setSelectedElement 
} from '@/store/presentationSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Copy, Trash2, Type, Square, Circle, Minus, Image } from 'lucide-react';
import { TextElement, ShapeElement, ImageElement } from '@shared/schema';

export const PropertiesPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { presentation, ui } = useSelector((state: RootState) => state.presentation);

  if (!presentation || !ui.selectedElementId || !ui.showPropertiesPanel) {
    return null;
  }

  const activeSlide = presentation.slides.find(s => s.id === presentation.activeSlideId);
  const selectedElement = activeSlide?.elements.find(e => e.id === ui.selectedElementId);

  if (!selectedElement) {
    return null;
  }

  const handleClose = () => {
    dispatch(setSelectedElement(null));
  };

  const handleUpdate = (updates: Partial<typeof selectedElement>) => {
    dispatch(updateElement({
      elementId: selectedElement.id,
      updates,
    }));
  };

  const handleDelete = () => {
    dispatch(deleteElement(selectedElement.id));
  };

  const handleDuplicate = () => {
    dispatch(duplicateElement(selectedElement.id));
  };

  const getElementIcon = () => {
    switch (selectedElement.type) {
      case 'text':
        return <Type className="w-4 h-4 text-primary" />;
      case 'rectangle':
        return <Square className="w-4 h-4 text-primary" />;
      case 'circle':
        return <Circle className="w-4 h-4 text-primary" />;
      case 'line':
        return <Minus className="w-4 h-4 text-primary" />;
      case 'image':
        return <Image className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  const renderTextProperties = () => {
    const textElement = selectedElement as TextElement;
    
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Text</h4>
        
        <div>
          <Label className="text-xs text-text-secondary">Content</Label>
          <Textarea
            value={textElement.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            className="text-xs resize-none"
            rows={2}
            data-testid="input-text-content"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-text-secondary">Font Size</Label>
            <Input
              type="number"
              value={textElement.fontSize}
              onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) || 16 })}
              className="text-xs"
              data-testid="input-font-size"
            />
          </div>
          <div>
            <Label className="text-xs text-text-secondary">Font Weight</Label>
            <Select
              value={textElement.fontWeight}
              onValueChange={(value) => handleUpdate({ fontWeight: value as 'normal' | 'bold' })}
            >
              <SelectTrigger className="text-xs" data-testid="select-font-weight">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label className="text-xs text-text-secondary">Font Family</Label>
          <Select
            value={textElement.fontFamily}
            onValueChange={(value) => handleUpdate({ fontFamily: value })}
          >
            <SelectTrigger className="text-xs" data-testid="select-font-family">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-text-secondary">Text Align</Label>
          <Select
            value={textElement.textAlign}
            onValueChange={(value) => handleUpdate({ textAlign: value as 'left' | 'center' | 'right' })}
          >
            <SelectTrigger className="text-xs" data-testid="select-text-align">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderShapeProperties = () => {
    const shapeElement = selectedElement as ShapeElement;
    
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Shape</h4>
        
        <div>
          <Label className="text-xs text-text-secondary">Stroke Width</Label>
          <Input
            type="number"
            value={shapeElement.strokeWidth}
            onChange={(e) => handleUpdate({ strokeWidth: parseInt(e.target.value) || 1 })}
            className="text-xs"
            min="0"
            data-testid="input-stroke-width"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 bg-surface border-l border-border p-4 overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Properties</h3>
          <Button
            onClick={handleClose}
            size="sm"
            variant="ghost"
            className="p-1 h-auto"
            data-testid="button-close-properties"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Element Type */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              {getElementIcon()}
            </div>
            <div>
              <div className="text-sm font-medium capitalize">
                {selectedElement.type === 'text' ? 'Text Box' : selectedElement.type}
              </div>
              <div className="text-xs text-text-secondary">
                ID: {selectedElement.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>

        {/* Position & Size */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Position & Size</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-text-secondary">X</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handleUpdate({ x: parseInt(e.target.value) || 0 })}
                className="text-xs"
                data-testid="input-position-x"
              />
            </div>
            <div>
              <Label className="text-xs text-text-secondary">Y</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handleUpdate({ y: parseInt(e.target.value) || 0 })}
                className="text-xs"
                data-testid="input-position-y"
              />
            </div>
            <div>
              <Label className="text-xs text-text-secondary">Width</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => handleUpdate({ width: parseInt(e.target.value) || 1 })}
                className="text-xs"
                min="1"
                data-testid="input-width"
              />
            </div>
            <div>
              <Label className="text-xs text-text-secondary">Height</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => handleUpdate({ height: parseInt(e.target.value) || 1 })}
                className="text-xs"
                min="1"
                data-testid="input-height"
              />
            </div>
          </div>
        </div>

        {/* Type-specific properties */}
        {selectedElement.type === 'text' && renderTextProperties()}
        {['rectangle', 'circle', 'line'].includes(selectedElement.type) && renderShapeProperties()}

        {/* Appearance */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Appearance</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-text-secondary">
                {selectedElement.type === 'text' ? 'Text Color' : 'Fill Color'}
              </Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedElement.type === 'text' ? (selectedElement as TextElement).fill : (selectedElement as ShapeElement).fill}
                  onChange={(e) => handleUpdate({ fill: e.target.value })}
                  className="w-8 h-6 border border-border rounded cursor-pointer"
                  data-testid="input-fill-color"
                />
                <Input
                  type="text"
                  value={selectedElement.type === 'text' ? (selectedElement as TextElement).fill : (selectedElement as ShapeElement).fill}
                  onChange={(e) => handleUpdate({ fill: e.target.value })}
                  className="flex-1 text-xs"
                  data-testid="input-fill-color-text"
                />
              </div>
            </div>
            
            {selectedElement.type === 'text' && (selectedElement as TextElement).backgroundColor && (
              <div>
                <Label className="text-xs text-text-secondary">Background</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={(selectedElement as TextElement).backgroundColor || '#ffffff'}
                    onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                    className="w-8 h-6 border border-border rounded cursor-pointer"
                    data-testid="input-background-color"
                  />
                  <Input
                    type="text"
                    value={(selectedElement as TextElement).backgroundColor || '#ffffff'}
                    onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                    className="flex-1 text-xs"
                    data-testid="input-background-color-text"
                  />
                </div>
              </div>
            )}

            {['rectangle', 'circle', 'line'].includes(selectedElement.type) && (selectedElement as ShapeElement).stroke && (
              <div>
                <Label className="text-xs text-text-secondary">Stroke Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={(selectedElement as ShapeElement).stroke || '#000000'}
                    onChange={(e) => handleUpdate({ stroke: e.target.value })}
                    className="w-8 h-6 border border-border rounded cursor-pointer"
                    data-testid="input-stroke-color"
                  />
                  <Input
                    type="text"
                    value={(selectedElement as ShapeElement).stroke || '#000000'}
                    onChange={(e) => handleUpdate({ stroke: e.target.value })}
                    className="flex-1 text-xs"
                    data-testid="input-stroke-color-text"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            <Label className="text-xs text-text-secondary">Opacity</Label>
            <Slider
              value={[selectedElement.opacity]}
              onValueChange={(value) => handleUpdate({ opacity: value[0] })}
              min={0}
              max={1}
              step={0.1}
              className="mt-2"
              data-testid="slider-opacity"
            />
            <div className="text-xs text-text-secondary text-center mt-1">
              {Math.round(selectedElement.opacity * 100)}%
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button
            onClick={handleDuplicate}
            variant="outline"
            className="w-full"
            data-testid="button-duplicate-element"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="w-full"
            data-testid="button-delete-element"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
