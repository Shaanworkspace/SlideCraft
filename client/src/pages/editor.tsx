import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { SidePanel } from '@/components/SidePanel';
import { TopToolbar } from '@/components/TopToolbar';
import { CanvasArea } from '@/components/CanvasArea';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { StatusBar } from '@/components/StatusBar';
import { exportSlideAsImage } from '@/utils/fileOperations';
import { useToast } from '@/hooks/use-toast';

const EditorContent: React.FC = () => {
  const { toast } = useToast();

  const handleExportSlide = (dataUrl: string) => {
    try {
      exportSlideAsImage(dataUrl, 'slide');
      toast({
        title: "Slide exported",
        description: "Your slide has been exported as PNG successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <SidePanel />
      
      <div className="flex-1 flex flex-col">
        <TopToolbar onExportSlide={() => {}} />
        
        <div className="flex-1 flex">
          <CanvasArea onExportSlide={handleExportSlide} />
          <PropertiesPanel />
        </div>
        
        <StatusBar />
      </div>
    </div>
  );
};

export default function Editor() {
  return (
    <Provider store={store}>
      <EditorContent />
    </Provider>
  );
}
