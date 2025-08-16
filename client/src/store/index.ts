import { configureStore } from '@reduxjs/toolkit';
import presentationReducer from './presentationSlice';

export const store = configureStore({
  reducer: {
    presentation: presentationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore fabric.js objects in the state
        ignoredActions: ['presentation/updateCanvasState'],
        ignoredActionsPaths: ['payload.canvasState'],
        ignoredPaths: ['presentation.slides.canvasState'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
