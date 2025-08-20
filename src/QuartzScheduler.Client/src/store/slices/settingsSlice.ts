import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

const initialState: SettingsState = {
  theme: 'light',
  language: 'en',
  notifications: true,
  autoRefresh: true,
  refreshInterval: 30,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
  },
});

export const { setTheme, setLanguage, setNotifications, setAutoRefresh, setRefreshInterval } = settingsSlice.actions;
export default settingsSlice.reducer; 