import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const StatusBar: React.FC = () => {
  const { presentation, ui } = useSelector((state: RootState) => state.presentation);

  if (!presentation) return null;

  const activeSlide = presentation.slides.find(s => s.id === presentation.activeSlideId);
  const elementCount = activeSlide?.elements.length || 0;
  const hasSelection = ui.selectedElementId !== null;

  return (
    <div className="bg-surface border-t border-border px-4 py-2 flex items-center justify-between text-xs text-text-secondary">
      <div className="flex items-center space-x-4">
        <span data-testid="status-presentation-title">
          {presentation.title}
        </span>
        <span className="flex items-center space-x-1" data-testid="status-save-status">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Saved</span>
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span data-testid="status-element-count">
          {elementCount} element{elementCount !== 1 ? 's' : ''}
        </span>
        <span data-testid="status-selection">
          {hasSelection ? '1 selected' : 'None selected'}
        </span>
        <span data-testid="status-zoom">
          {Math.round(ui.zoom * 100)}%
        </span>
      </div>
    </div>
  );
};
