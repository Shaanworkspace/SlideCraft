import { configureStore } from '@reduxjs/toolkit';
import presentationReducer from './presentationSlice';

export const store = configureStore({
  reducer: {
    presentation: presentationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore fabric.js objects and Date objects in the state
        ignoredActions: ['presentation/updateCanvasState', 'presentation/createNewPresentation', 'presentation/loadPresentation'],
        ignoredActionsPaths: ['payload.canvasState', 'payload.createdAt', 'payload.updatedAt'],
        ignoredPaths: [
          'presentation.slides.canvasState',
          'presentation.presentation.createdAt',
          'presentation.presentation.updatedAt',
          'presentation.history.past',
          'presentation.history.future'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
