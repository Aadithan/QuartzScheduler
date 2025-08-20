import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { calendarsApi, CalendarListItem, CalendarViewModel, CreateCalendarRequest } from '../../services/calendarsApi';

// Interface for calendar state
export interface Calendar extends CalendarListItem {}

// State interface
interface CalendarsState {
  calendars: Calendar[];
  selectedCalendar: CalendarViewModel | null;
  loading: boolean;
  operationLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: CalendarsState = {
  calendars: [],
  selectedCalendar: null,
  loading: false,
  operationLoading: false,
  error: null,
};

// Async thunks
export const fetchCalendars = createAsyncThunk(
  'calendars/fetchCalendars',
  async (_, { rejectWithValue }) => {
    try {
      const calendars = await calendarsApi.getCalendars();
      return calendars;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch calendars');
    }
  }
);

export const fetchCalendar = createAsyncThunk(
  'calendars/fetchCalendar',
  async (name: string, { rejectWithValue }) => {
    try {
      const calendar = await calendarsApi.getCalendar(name);
      return calendar;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch calendar');
    }
  }
);

export const createCalendar = createAsyncThunk(
  'calendars/createCalendar',
  async (calendar: CreateCalendarRequest, { rejectWithValue, dispatch }) => {
    try {
      await calendarsApi.createCalendar(calendar);
      dispatch(fetchCalendars());
      return calendar;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create calendar');
    }
  }
);

export const updateCalendar = createAsyncThunk(
  'calendars/updateCalendar',
  async ({ name, calendar }: { name: string; calendar: CalendarViewModel }, { rejectWithValue, dispatch }) => {
    try {
      await calendarsApi.updateCalendar(name, calendar);
      dispatch(fetchCalendars());
      return { name, calendar };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update calendar');
    }
  }
);

export const deleteCalendar = createAsyncThunk(
  'calendars/deleteCalendar',
  async (name: string, { rejectWithValue, dispatch }) => {
    try {
      await calendarsApi.deleteCalendar(name);
      dispatch(fetchCalendars());
      return name;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete calendar');
    }
  }
);

// Slice
const calendarsSlice = createSlice({
  name: 'calendars',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCalendar: (state) => {
      state.selectedCalendar = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch calendars
      .addCase(fetchCalendars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendars.fulfilled, (state, action) => {
        state.loading = false;
        state.calendars = action.payload;
      })
      .addCase(fetchCalendars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch calendar
      .addCase(fetchCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCalendar = action.payload;
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create calendar
      .addCase(createCalendar.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createCalendar.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(createCalendar.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      
      // Update calendar
      .addCase(updateCalendar.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateCalendar.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(updateCalendar.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete calendar
      .addCase(deleteCalendar.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteCalendar.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(deleteCalendar.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedCalendar } = calendarsSlice.actions;
export default calendarsSlice.reducer;
