import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Presentation, Slide, SlideElement, ToolType, UIState } from '@shared/schema';
import { nanoid } from 'nanoid';

interface PresentationState {
  presentation: Presentation | null;
  ui: UIState;
  history: {
    past: Presentation[];
    future: Presentation[];
  };
}

const initialState: PresentationState = {
  presentation: null,
  ui: {
    selectedTool: 'select',
    selectedElementId: null,
    showPropertiesPanel: false,
    zoom: 1,
    canvasSize: { width: 1280, height: 720 },
  },
  history: {
    past: [],
    future: [],
  },
};

const presentationSlice = createSlice({
  name: 'presentation',
  initialState,
  reducers: {
    // Presentation operations
    createNewPresentation: (state) => {
      const newSlide: Slide = {
        id: nanoid(),
        title: 'Slide 1',
        elements: [],
      };

      const newPresentation: Presentation = {
        id: nanoid(),
        title: 'Untitled Presentation',
        slides: [newSlide],
        activeSlideId: newSlide.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      state.presentation = newPresentation;
      state.ui.selectedElementId = null;
      state.history.past = [];
      state.history.future = [];
    },

    loadPresentation: (state, action: PayloadAction<Presentation>) => {
      state.presentation = action.payload;
      state.ui.selectedElementId = null;
      state.history.past = [];
      state.history.future = [];
    },

    updatePresentationTitle: (state, action: PayloadAction<string>) => {
      if (state.presentation) {
        state.presentation.title = action.payload;
        state.presentation.updatedAt = new Date();
      }
    },

    // Slide operations
    addSlide: (state) => {
      if (!state.presentation) return;

      const newSlide: Slide = {
        id: nanoid(),
        title: `Slide ${state.presentation.slides.length + 1}`,
        elements: [],
      };

      state.presentation.slides.push(newSlide);
      state.presentation.activeSlideId = newSlide.id;
      state.presentation.updatedAt = new Date();
    },

    deleteSlide: (state, action: PayloadAction<string>) => {
      if (!state.presentation) return;

      const slideIndex = state.presentation.slides.findIndex(s => s.id === action.payload);
      if (slideIndex === -1) return;

      state.presentation.slides.splice(slideIndex, 1);

      // If we deleted the active slide, select another one
      if (state.presentation.activeSlideId === action.payload) {
        if (state.presentation.slides.length > 0) {
          const newActiveIndex = Math.min(slideIndex, state.presentation.slides.length - 1);
          state.presentation.activeSlideId = state.presentation.slides[newActiveIndex].id;
        } else {
          // No slides left, create a new one
          const newSlide: Slide = {
            id: nanoid(),
            title: 'Slide 1',
            elements: [],
          };
          state.presentation.slides.push(newSlide);
          state.presentation.activeSlideId = newSlide.id;
        }
      }

      state.presentation.updatedAt = new Date();
    },

    setActiveSlide: (state, action: PayloadAction<string>) => {
      if (state.presentation) {
        state.presentation.activeSlideId = action.payload;
        state.ui.selectedElementId = null;
      }
    },

    updateSlideTitle: (state, action: PayloadAction<{ slideId: string; title: string }>) => {
      if (!state.presentation) return;

      const slide = state.presentation.slides.find(s => s.id === action.payload.slideId);
      if (slide) {
        slide.title = action.payload.title;
        state.presentation.updatedAt = new Date();
      }
    },

    // Element operations
    addElement: (state, action: PayloadAction<SlideElement>) => {
      if (!state.presentation) return;

      const activeSlide = state.presentation.slides.find(s => s.id === state.presentation!.activeSlideId);
      if (activeSlide) {
        activeSlide.elements.push(action.payload);
        state.ui.selectedElementId = action.payload.id;
        state.presentation.updatedAt = new Date();
      }
    },

    updateElement: (state, action: PayloadAction<{ elementId: string; updates: Partial<SlideElement> }>) => {
      if (!state.presentation) return;

      const activeSlide = state.presentation.slides.find(s => s.id === state.presentation!.activeSlideId);
      if (activeSlide) {
        const elementIndex = activeSlide.elements.findIndex(e => e.id === action.payload.elementId);
        if (elementIndex !== -1) {
          activeSlide.elements[elementIndex] = { ...activeSlide.elements[elementIndex], ...action.payload.updates } as SlideElement;
          state.presentation.updatedAt = new Date();
        }
      }
    },

    deleteElement: (state, action: PayloadAction<string>) => {
      if (!state.presentation) return;

      const activeSlide = state.presentation.slides.find(s => s.id === state.presentation!.activeSlideId);
      if (activeSlide) {
        const elementIndex = activeSlide.elements.findIndex(e => e.id === action.payload);
        if (elementIndex !== -1) {
          activeSlide.elements.splice(elementIndex, 1);
          if (state.ui.selectedElementId === action.payload) {
            state.ui.selectedElementId = null;
          }
          state.presentation.updatedAt = new Date();
        }
      }
    },

    duplicateElement: (state, action: PayloadAction<string>) => {
      if (!state.presentation) return;

      const activeSlide = state.presentation.slides.find(s => s.id === state.presentation!.activeSlideId);
      if (activeSlide) {
        const element = activeSlide.elements.find(e => e.id === action.payload);
        if (element) {
          const duplicatedElement = {
            ...element,
            id: nanoid(),
            x: element.x + 20,
            y: element.y + 20,
          };
          activeSlide.elements.push(duplicatedElement);
          state.ui.selectedElementId = duplicatedElement.id;
          state.presentation.updatedAt = new Date();
        }
      }
    },

    // UI operations
    setSelectedTool: (state, action: PayloadAction<ToolType>) => {
      state.ui.selectedTool = action.payload;
    },

    setSelectedElement: (state, action: PayloadAction<string | null>) => {
      state.ui.selectedElementId = action.payload;
      state.ui.showPropertiesPanel = action.payload !== null;
    },

    setZoom: (state, action: PayloadAction<number>) => {
      state.ui.zoom = Math.max(0.1, Math.min(5, action.payload));
    },

    togglePropertiesPanel: (state) => {
      state.ui.showPropertiesPanel = !state.ui.showPropertiesPanel;
    },

    // Canvas state management
    updateCanvasState: (state, action: PayloadAction<{ slideId: string; canvasState: any }>) => {
      if (!state.presentation) return;

      const slide = state.presentation.slides.find(s => s.id === action.payload.slideId);
      if (slide) {
        slide.canvasState = action.payload.canvasState;
      }
    },

    // Undo/Redo operations
    saveToHistory: (state) => {
      if (state.presentation) {
        state.history.past.push(JSON.parse(JSON.stringify(state.presentation)));
        state.history.future = [];
        
        // Limit history size
        if (state.history.past.length > 50) {
          state.history.past.shift();
        }
      }
    },

    undo: (state) => {
      if (state.history.past.length > 0 && state.presentation) {
        state.history.future.unshift(JSON.parse(JSON.stringify(state.presentation)));
        state.presentation = state.history.past.pop()!;
        
        // Limit future history size
        if (state.history.future.length > 50) {
          state.history.future.pop();
        }
      }
    },

    redo: (state) => {
      if (state.history.future.length > 0) {
        if (state.presentation) {
          state.history.past.push(JSON.parse(JSON.stringify(state.presentation)));
        }
        state.presentation = state.history.future.shift()!;
      }
    },
  },
});

export const {
  createNewPresentation,
  loadPresentation,
  updatePresentationTitle,
  addSlide,
  deleteSlide,
  setActiveSlide,
  updateSlideTitle,
  addElement,
  updateElement,
  deleteElement,
  duplicateElement,
  setSelectedTool,
  setSelectedElement,
  setZoom,
  togglePropertiesPanel,
  updateCanvasState,
  saveToHistory,
  undo,
  redo,
} = presentationSlice.actions;

export default presentationSlice.reducer;
