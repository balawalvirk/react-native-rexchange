import { configureStore } from '@reduxjs/toolkit';
import walkthroughReducer from './walkthroughSlice';

export const store = configureStore({
  reducer: {
    walkthrough: walkthroughReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
