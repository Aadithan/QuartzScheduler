import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './slices/jobsSlice';
import settingsReducer from './slices/settingsSlice';
import triggersReducer from './slices/triggersSlice';
import schedulerReducer from './slices/schedulerSlice';
import calendarsReducer from './slices/calendarsSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    settings: settingsReducer,
    triggers: triggersReducer,
    scheduler: schedulerReducer,
    calendars: calendarsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 