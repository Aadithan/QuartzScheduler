import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { schedulerApi, SchedulerInfo } from '../../services/schedulerApi';

// Define the state interface
export interface SchedulerState {
  schedulerInfo: SchedulerInfo | null;
  loading: {
    info: boolean;
    operation: boolean;
    groupOperations: { [groupName: string]: boolean };
  };
  error: string | null;
}

// Initial state
const initialState: SchedulerState = {
  schedulerInfo: null,
  loading: {
    info: false,
    operation: false,
    groupOperations: {},
  },
  error: null,
};

// Async thunks
export const fetchSchedulerInfo = createAsyncThunk(
  'scheduler/fetchSchedulerInfo',
  async (_, { rejectWithValue }) => {
    try {
      return await schedulerApi.getSchedulerInfo();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch scheduler info');
    }
  }
);

export const startScheduler = createAsyncThunk(
  'scheduler/startScheduler',
  async (_, { rejectWithValue }) => {
    try {
      await schedulerApi.startScheduler();
      return 'Scheduler started successfully';
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to start scheduler');
    }
  }
);



export const standbyScheduler = createAsyncThunk(
  'scheduler/standbyScheduler',
  async (_, { rejectWithValue }) => {
    try {
      await schedulerApi.standbyScheduler();
      return 'Scheduler put in standby mode';
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to put scheduler in standby');
    }
  }
);

export const pauseAll = createAsyncThunk(
  'scheduler/pauseAll',
  async (_, { rejectWithValue }) => {
    try {
      await schedulerApi.pauseAll();
      return 'All jobs and triggers paused';
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to pause all');
    }
  }
);

export const resumeAll = createAsyncThunk(
  'scheduler/resumeAll',
  async (_, { rejectWithValue }) => {
    try {
      await schedulerApi.resumeAll();
      return 'All jobs and triggers resumed';
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to resume all');
    }
  }
);

export const clearScheduler = createAsyncThunk(
  'scheduler/clearScheduler',
  async (_, { rejectWithValue }) => {
    try {
      await schedulerApi.clearScheduler();
      return 'Scheduler cleared successfully';
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to clear scheduler');
    }
  }
);

export const pauseJobGroup = createAsyncThunk(
  'scheduler/pauseJobGroup',
  async (groupName: string, { rejectWithValue }) => {
    try {
      const result = await schedulerApi.pauseJobGroup(groupName);
      return { groupName, message: result.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || `Failed to pause job group ${groupName}`);
    }
  }
);

export const resumeJobGroup = createAsyncThunk(
  'scheduler/resumeJobGroup',
  async (groupName: string, { rejectWithValue }) => {
    try {
      const result = await schedulerApi.resumeJobGroup(groupName);
      return { groupName, message: result.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || `Failed to resume job group ${groupName}`);
    }
  }
);

export const pauseTriggerGroup = createAsyncThunk(
  'scheduler/pauseTriggerGroup',
  async (groupName: string, { rejectWithValue }) => {
    try {
      const result = await schedulerApi.pauseTriggerGroup(groupName);
      return { groupName, message: result.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || `Failed to pause trigger group ${groupName}`);
    }
  }
);

export const resumeTriggerGroup = createAsyncThunk(
  'scheduler/resumeTriggerGroup',
  async (groupName: string, { rejectWithValue }) => {
    try {
      const result = await schedulerApi.resumeTriggerGroup(groupName);
      return { groupName, message: result.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || `Failed to resume trigger group ${groupName}`);
    }
  }
);

// Create the slice
const schedulerSlice = createSlice({
  name: 'scheduler',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch scheduler info
    builder
      .addCase(fetchSchedulerInfo.pending, (state) => {
        state.loading.info = true;
        state.error = null;
      })
      .addCase(fetchSchedulerInfo.fulfilled, (state, action) => {
        state.loading.info = false;
        state.schedulerInfo = action.payload;
        state.error = null;
      })
      .addCase(fetchSchedulerInfo.rejected, (state, action) => {
        state.loading.info = false;
        state.error = action.payload as string;
      });

    // Start scheduler
    builder
      .addCase(startScheduler.pending, (state) => {
        state.loading.operation = true;
        state.error = null;
      })
      .addCase(startScheduler.fulfilled, (state) => {
        state.loading.operation = false;
        state.error = null;
      })
      .addCase(startScheduler.rejected, (state, action) => {
        state.loading.operation = false;
        state.error = action.payload as string;
      });



    // Standby scheduler
    builder
      .addCase(standbyScheduler.pending, (state) => {
        state.loading.operation = true;
        state.error = null;
      })
      .addCase(standbyScheduler.fulfilled, (state) => {
        state.loading.operation = false;
        state.error = null;
      })
      .addCase(standbyScheduler.rejected, (state, action) => {
        state.loading.operation = false;
        state.error = action.payload as string;
      });

    // Pause all
    builder
      .addCase(pauseAll.pending, (state) => {
        state.loading.operation = true;
        state.error = null;
      })
      .addCase(pauseAll.fulfilled, (state) => {
        state.loading.operation = false;
        state.error = null;
      })
      .addCase(pauseAll.rejected, (state, action) => {
        state.loading.operation = false;
        state.error = action.payload as string;
      });

    // Resume all
    builder
      .addCase(resumeAll.pending, (state) => {
        state.loading.operation = true;
        state.error = null;
      })
      .addCase(resumeAll.fulfilled, (state) => {
        state.loading.operation = false;
        state.error = null;
      })
      .addCase(resumeAll.rejected, (state, action) => {
        state.loading.operation = false;
        state.error = action.payload as string;
      });

    // Clear scheduler
    builder
      .addCase(clearScheduler.pending, (state) => {
        state.loading.operation = true;
        state.error = null;
      })
      .addCase(clearScheduler.fulfilled, (state) => {
        state.loading.operation = false;
        state.error = null;
      })
      .addCase(clearScheduler.rejected, (state, action) => {
        state.loading.operation = false;
        state.error = action.payload as string;
      });

    // Job group operations
    builder
      .addCase(pauseJobGroup.pending, (state, action) => {
        const groupName = action.meta.arg;
        state.loading.groupOperations[groupName] = true;
        state.error = null;
      })
      .addCase(pauseJobGroup.fulfilled, (state, action) => {
        const groupName = action.payload.groupName;
        state.loading.groupOperations[groupName] = false;
        state.error = null;
        // Optimistically update the paused state
        if (state.schedulerInfo?.jobGroups) {
          const group = state.schedulerInfo.jobGroups.find(g => g.name === groupName);
          if (group) {
            group.isPaused = true;
          }
        }
      })
      .addCase(pauseJobGroup.rejected, (state, action) => {
        const groupName = action.meta.arg;
        state.loading.groupOperations[groupName] = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(resumeJobGroup.pending, (state, action) => {
        const groupName = action.meta.arg;
        state.loading.groupOperations[groupName] = true;
        state.error = null;
      })
      .addCase(resumeJobGroup.fulfilled, (state, action) => {
        const groupName = action.payload.groupName;
        state.loading.groupOperations[groupName] = false;
        state.error = null;
        // Optimistically update the paused state
        if (state.schedulerInfo?.jobGroups) {
          const group = state.schedulerInfo.jobGroups.find(g => g.name === groupName);
          if (group) {
            group.isPaused = false;
          }
        }
      })
      .addCase(resumeJobGroup.rejected, (state, action) => {
        const groupName = action.meta.arg;
        state.loading.groupOperations[groupName] = false;
        state.error = action.payload as string;
      });

    // Trigger group operations
    builder
      .addCase(pauseTriggerGroup.pending, (state, action) => {
        const groupName = action.meta.arg;
        state.loading.groupOperations[groupName] = true;
        state.error = null;
      })
      .addCase(pauseTriggerGroup.fulfilled, (state, action) => {
        const groupName = action.payload.groupName;
        state.loading.groupOperations[groupName] = false;
        state.error = null;
        // Optimistically update the paused state
        if (state.schedulerInfo?.triggerGroups) {
          const group = state.schedulerInfo.triggerGroups.find(g => g.name === groupName);
          if (group) {
            group.isPaused = true;
          }
        }
      })
      .addCase(pauseTriggerGroup.rejected, (state, action) => {
        const groupName = action.meta.arg;
        state.loading.groupOperations[groupName] = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(resumeTriggerGroup.pending, (state, action) => {
        const groupName = action.meta.arg;
        state.loading.groupOperations[groupName] = true;
        state.error = null;
      })
      .addCase(resumeTriggerGroup.fulfilled, (state, action) => {
        const groupName = action.payload.groupName;
        state.loading.groupOperations[groupName] = false;
        state.error = null;
        // Optimistically update the paused state
        if (state.schedulerInfo?.triggerGroups) {
          const group = state.schedulerInfo.triggerGroups.find(g => g.name === groupName);
          if (group) {
            group.isPaused = false;
          }
        }
      })
      .addCase(resumeTriggerGroup.rejected, (state, action) => {
        const groupName = action.meta.arg;
        state.loading.groupOperations[groupName] = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearError } = schedulerSlice.actions;
export default schedulerSlice.reducer; 

// Selectors
export const selectSchedulerInfo = (state: { scheduler: SchedulerState }) => state.scheduler.schedulerInfo;
export const selectSchedulerLoading = (state: { scheduler: SchedulerState }) => state.scheduler.loading;
export const selectSchedulerError = (state: { scheduler: SchedulerState }) => state.scheduler.error;