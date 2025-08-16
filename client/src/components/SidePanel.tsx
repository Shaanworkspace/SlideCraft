import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addSlide, deleteSlide, setActiveSlide } from '@/store/presentationSlice';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SidePanel: React.FC = () => {
  const dispatch = useDispatch();
  const { presentation } = useSelector((state: RootState) => state.presentation);

  if (!presentation) return null;

  const handleAddSlide = () => {
    dispatch(addSlide());
  };

  const handleDeleteSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (presentation.slides.length > 1) {
      dispatch(deleteSlide(slideId));
    }
  };

  const handleSelectSlide = (slideId: string) => {
    dispatch(setActiveSlide(slideId));
  };

  return (
    <div className="w-60 bg-surface border-r border-border flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Slides</h2>
          <Button
            onClick={handleAddSlide}
            size="sm"
            className="w-8 h-8 p-0 bg-primary hover:bg-primary-dark"
            data-testid="button-add-slide"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-text-secondary">
          {presentation.slides.length} slide{presentation.slides.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Slide Thumbnails */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {presentation.slides.map((slide, index) => (
          <div key={slide.id} className="group relative">
            <div
              className={cn(
                "rounded-lg p-2 cursor-pointer transition-colors border-2",
                slide.id === presentation.activeSlideId
                  ? "bg-primary/10 border-primary"
                  : "border-dashed border-border hover:bg-gray-50"
              )}
              onClick={() => handleSelectSlide(slide.id)}
              data-testid={`slide-thumbnail-${slide.id}`}
            >
              {/* Slide Preview */}
              <div className="aspect-video bg-white border border-border rounded shadow-sm mb-2 relative overflow-hidden">
                <div className="absolute inset-2">
                  {/* Mock slide content preview */}
                  <div className="w-full h-2 bg-text-primary rounded mb-1"></div>
                  <div className="w-3/4 h-1.5 bg-text-secondary rounded mb-2"></div>
                  <div className="w-16 h-8 bg-accent/20 border border-accent/30 rounded"></div>
                </div>
              </div>
              <div className="text-xs text-text-secondary text-center">
                {slide.title}
              </div>
            </div>
            
            {/* Delete Button */}
            {presentation.slides.length > 1 && (
              <Button
                onClick={(e) => handleDeleteSlide(slide.id, e)}
                size="sm"
                variant="destructive"
                className="absolute -top-1 -right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                data-testid={`button-delete-slide-${slide.id}`}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
