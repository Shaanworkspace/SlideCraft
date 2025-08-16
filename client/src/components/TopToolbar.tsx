import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  createNewPresentation, 
  loadPresentation as loadPresentationAction,
  setSelectedTool, 
  undo, 
  redo 
} from '@/store/presentationSlice';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  File, 
  Save, 
  FolderOpen, 
  Undo, 
  Redo, 
  MousePointer, 
  Type, 
  Square, 
  Circle, 
  Minus, 
  Image, 
  Download, 
  Share 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  savePresentation, 
  loadPresentation,
  isFileSystemAccessSupported,
  saveWithFileSystemAccess,
  loadWithFileSystemAccess 
} from '@/utils/fileOperations';
import { ToolType } from '@shared/schema';

interface TopToolbarProps {
  onExportSlide?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ onExportSlide }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { presentation, ui, history } = useSelector((state: RootState) => state.presentation);

  const tools: Array<{ type: ToolType; icon: React.ReactNode; label: string }> = [
    { type: 'select', icon: <MousePointer className="w-4 h-4" />, label: 'Select' },
    { type: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
    { type: 'rectangle', icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
    { type: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
    { type: 'line', icon: <Minus className="w-4 h-4" />, label: 'Line' },
    { type: 'image', icon: <Image className="w-4 h-4" />, label: 'Image' },
  ];

  const handleNewPresentation = () => {
    if (presentation) {
      const confirmNew = window.confirm('Are you sure? Any unsaved changes will be lost.');
      if (!confirmNew) return;
    }
    
    dispatch(createNewPresentation());
    toast({
      title: "New presentation created",
      description: "A new blank presentation has been created.",
    });
  };

  const handleSavePresentation = async () => {
    if (!presentation) return;

    try {
      if (isFileSystemAccessSupported()) {
        await saveWithFileSystemAccess(presentation);
      } else {
        savePresentation(presentation);
      }
      
      toast({
        title: "PPTX downloaded",
        description: "Your presentation has been saved as a PowerPoint file.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleLoadPresentation = async () => {
    try {
      let loadedPresentation;
      
      if (isFileSystemAccessSupported()) {
        loadedPresentation = await loadWithFileSystemAccess();
      } else {
        loadedPresentation = await loadPresentation();
      }
      
      if (loadedPresentation) {
        dispatch(loadPresentationAction(loadedPresentation));
        toast({
          title: "Presentation loaded",
          description: "Your presentation has been loaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Load failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleToolSelect = (tool: ToolType) => {
    dispatch(setSelectedTool(tool));
  };

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  const handleExportSlide = () => {
    onExportSlide?.();
  };

  const handleShare = () => {
    toast({
      title: "Share feature",
      description: "Sharing functionality coming soon!",
    });
  };

  return (
    <div className="bg-surface border-b border-border p-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: File Operations */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleNewPresentation}
            size="sm"
            className="bg-primary hover:bg-primary-dark"
            data-testid="button-new-presentation"
          >
            <File className="w-4 h-4 mr-1" />
            New
          </Button>
          
          <Button
            onClick={handleSavePresentation}
            size="sm"
            variant="secondary"
            disabled={!presentation}
            data-testid="button-save-presentation"
          >
            <Save className="w-4 h-4 mr-1" />
            Save PPTX
          </Button>

          <Button
            onClick={handleLoadPresentation}
            size="sm"
            variant="outline"
            data-testid="button-load-presentation"
          >
            <FolderOpen className="w-4 h-4 mr-1" />
            Load
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Button
            onClick={handleUndo}
            size="sm"
            variant="ghost"
            disabled={history.past.length === 0}
            data-testid="button-undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleRedo}
            size="sm"
            variant="ghost"
            disabled={history.future.length === 0}
            data-testid="button-redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Center: Element Tools */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          {tools.map((tool) => (
            <Button
              key={tool.type}
              onClick={() => handleToolSelect(tool.type)}
              size="sm"
              variant="ghost"
              className={cn(
                "transition-colors",
                ui.selectedTool === tool.type
                  ? "bg-white text-text-primary shadow-sm border border-border"
                  : "text-text-secondary hover:bg-white hover:text-text-primary"
              )}
              data-testid={`button-tool-${tool.type}`}
            >
              {tool.icon}
              <span className="ml-1">{tool.label}</span>
            </Button>
          ))}
        </div>

        {/* Right: Export Options */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleExportSlide}
            size="sm"
            variant="outline"
            disabled={!presentation}
            data-testid="button-export-slide"
          >
            <Download className="w-4 h-4 mr-1" />
            Export PNG
          </Button>
          
          <Button
            onClick={handleShare}
            size="sm"
            className="bg-accent hover:bg-orange-600"
            data-testid="button-share"
          >
            <Share className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};
