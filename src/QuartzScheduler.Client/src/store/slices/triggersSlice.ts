import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  triggersApi, 
  TriggerListItem, 
  TriggerPropertiesViewModel, 
  CreateTriggerRequest, 
  UpdateTriggerRequest,
  CronValidationResponse 
} from '../../services/triggersApi';

// Define the state interface
export interface TriggersState {
  triggers: TriggerListItem[];
  selectedTrigger: TriggerPropertiesViewModel | null;
  loading: {
    list: boolean;
    detail: boolean;
    operation: boolean;
  };
  operationLoading: Record<string, boolean>;
  error: string | null;
  cronValidation: {
    isValid: boolean;
    dates: string[];
    error: string | null;
    loading: boolean;
  };
}

// Initial state
const initialState: TriggersState = {
  triggers: [],
  selectedTrigger: null,
  loading: {
    list: false,
    detail: false,
    operation: false,
  },
  operationLoading: {},
  error: null,
  cronValidation: {
    isValid: false,
    dates: [],
    error: null,
    loading: false,
  },
};

// Async thunks
export const fetchTriggers = createAsyncThunk(
  'triggers/fetchTriggers',
  async (_, { rejectWithValue }) => {
    try {
      return await triggersApi.getTriggers();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch triggers');
    }
  }
);

export const fetchTrigger = createAsyncThunk(
  'triggers/fetchTrigger',
  async ({ name, group }: { name: string; group: string }, { rejectWithValue }) => {
    try {
      return await triggersApi.getTrigger(name, group);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch trigger');
    }
  }
);

export const createTrigger = createAsyncThunk(
  'triggers/createTrigger',
  async (trigger: CreateTriggerRequest, { rejectWithValue }) => {
    try {
      await triggersApi.createTrigger(trigger);
      return trigger;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create trigger');
    }
  }
);

export const updateTrigger = createAsyncThunk(
  'triggers/updateTrigger',
  async ({ name, group, trigger }: { name: string; group: string; trigger: UpdateTriggerRequest }, { rejectWithValue }) => {
    try {
      await triggersApi.updateTrigger(name, group, trigger);
      return { name, group, trigger };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update trigger');
    }
  }
);

export const deleteTrigger = createAsyncThunk(
  'triggers/deleteTrigger',
  async ({ name, group }: { name: string; group: string }, { rejectWithValue }) => {
    try {
      await triggersApi.deleteTrigger(name, group);
      return { name, group };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete trigger');
    }
  }
);

export const pauseTrigger = createAsyncThunk(
  'triggers/pauseTrigger',
  async ({ name, group }: { name: string; group: string }, { rejectWithValue }) => {
    try {
      await triggersApi.pauseTrigger(name, group);
      return { name, group };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to pause trigger');
    }
  }
);

export const resumeTrigger = createAsyncThunk(
  'triggers/resumeTrigger',
  async ({ name, group }: { name: string; group: string }, { rejectWithValue }) => {
    try {
      await triggersApi.resumeTrigger(name, group);
      return { name, group };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to resume trigger');
    }
  }
);

export const validateCronExpression = createAsyncThunk(
  'triggers/validateCronExpression',
  async (cronExpression: string, { rejectWithValue }) => {
    try {
      return await triggersApi.validateCronExpression(cronExpression);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to validate cron expression');
    }
  }
);

export const pauseAllTriggers = createAsyncThunk(
  'triggers/pauseAllTriggers',
  async (_, { rejectWithValue }) => {
    try {
      await triggersApi.pauseAllTriggers();
      return { message: 'All triggers paused successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to pause all triggers');
    }
  }
);

export const resumeAllTriggers = createAsyncThunk(
  'triggers/resumeAllTriggers',
  async (_, { rejectWithValue }) => {
    try {
      await triggersApi.resumeAllTriggers();
      return { message: 'All triggers resumed successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to resume all triggers');
    }
  }
);

export const startScheduler = createAsyncThunk(
  'triggers/startScheduler',
  async (_, { rejectWithValue }) => {
    try {
      await triggersApi.startScheduler();
      return { message: 'Scheduler started successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to start scheduler');
    }
  }
);

export const stopScheduler = createAsyncThunk(
  'triggers/stopScheduler',
  async (_, { rejectWithValue }) => {
    try {
      await triggersApi.stopScheduler();
      return { message: 'Scheduler stopped successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to stop scheduler');
    }
  }
);

// Create the slice
const triggersSlice = createSlice({
  name: 'triggers',
  initialState,
  reducers: {
    clearSelectedTrigger: (state) => {
      state.selectedTrigger = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCronValidation: (state) => {
      state.cronValidation = {
        isValid: false,
        dates: [],
        error: null,
        loading: false,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch triggers
    builder
      .addCase(fetchTriggers.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(fetchTriggers.fulfilled, (state, action: PayloadAction<TriggerListItem[]>) => {
        state.loading.list = false;
        state.triggers = action.payload;
        state.error = null;
      })
      .addCase(fetchTriggers.rejected, (state, action) => {
        state.loading.list = false;
        state.error = action.payload as string;
      });

    // Fetch trigger
    builder
      .addCase(fetchTrigger.pending, (state) => {
        state.loading.detail = true;
        state.error = null;
      })
      .addCase(fetchTrigger.fulfilled, (state, action: PayloadAction<TriggerPropertiesViewModel>) => {
        state.loading.detail = false;
        state.selectedTrigger = action.payload;
        state.error = null;
      })
      .addCase(fetchTrigger.rejected, (state, action) => {
        state.loading.detail = false;
        state.error = action.payload as string;
      });

    // Create trigger
    builder
      .addCase(createTrigger.pending, (state) => {
        state.loading.operation = true;
        state.operationLoading['create'] = true;
        state.error = null;
      })
      .addCase(createTrigger.fulfilled, (state) => {
        state.loading.operation = false;
        state.operationLoading['create'] = false;
        state.error = null;
      })
      .addCase(createTrigger.rejected, (state, action) => {
        state.loading.operation = false;
        state.operationLoading['create'] = false;
        state.error = action.payload as string;
      });

    // Update trigger
    builder
      .addCase(updateTrigger.pending, (state, action) => {
        state.loading.operation = true;
        const key = `update-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(updateTrigger.fulfilled, (state, action) => {
        state.loading.operation = false;
        const key = `update-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = null;
      })
      .addCase(updateTrigger.rejected, (state, action) => {
        state.loading.operation = false;
        const key = `update-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // Delete trigger
    builder
      .addCase(deleteTrigger.pending, (state, action) => {
        const key = `delete-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(deleteTrigger.fulfilled, (state, action) => {
        const key = `delete-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.triggers = state.triggers.filter(
          t => !(t.triggerName === action.payload.name && t.triggerGroup === action.payload.group)
        );
        state.error = null;
      })
      .addCase(deleteTrigger.rejected, (state, action) => {
        const key = `delete-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // Pause trigger
    builder
      .addCase(pauseTrigger.pending, (state, action) => {
        const key = `pause-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(pauseTrigger.fulfilled, (state, action) => {
        const key = `pause-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = null;
      })
      .addCase(pauseTrigger.rejected, (state, action) => {
        const key = `pause-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // Resume trigger
    builder
      .addCase(resumeTrigger.pending, (state, action) => {
        const key = `resume-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(resumeTrigger.fulfilled, (state, action) => {
        const key = `resume-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = null;
      })
      .addCase(resumeTrigger.rejected, (state, action) => {
        const key = `resume-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // Validate cron expression
    builder
      .addCase(validateCronExpression.pending, (state) => {
        state.cronValidation.loading = true;
        state.cronValidation.error = null;
      })
      .addCase(validateCronExpression.fulfilled, (state, action: PayloadAction<CronValidationResponse>) => {
        state.cronValidation.loading = false;
        state.cronValidation.isValid = action.payload.success;
        state.cronValidation.dates = action.payload.dates || [];
        state.cronValidation.error = action.payload.error || null;
      })
      .addCase(validateCronExpression.rejected, (state, action) => {
        state.cronValidation.loading = false;
        state.cronValidation.isValid = false;
        state.cronValidation.dates = [];
        state.cronValidation.error = action.payload as string;
      });

    // Pause all triggers
    builder
      .addCase(pauseAllTriggers.pending, (state) => {
        state.loading.operation = true;
        state.error = null;
      })
      .addCase(pauseAllTriggers.fulfilled, (state) => {
        state.loading.operation = false;
        state.error = null;
      })
      .addCase(pauseAllTriggers.rejected, (state, action) => {
        state.loading.operation = false;
        state.error = action.payload as string;
      });

    // Resume all triggers
    builder
      .addCase(resumeAllTriggers.pending, (state) => {
        state.loading.operation = true;
        state.error = null;
      })
      .addCase(resumeAllTriggers.fulfilled, (state) => {
        state.loading.operation = false;
        state.error = null;
      })
      .addCase(resumeAllTriggers.rejected, (state, action) => {
        state.loading.operation = false;
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

    // Stop scheduler
    builder
      .addCase(stopScheduler.pending, (state) => {
        state.loading.operation = true;
        state.error = null;
      })
      .addCase(stopScheduler.fulfilled, (state) => {
        state.loading.operation = false;
        state.error = null;
      })
      .addCase(stopScheduler.rejected, (state, action) => {
        state.loading.operation = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearSelectedTrigger, clearError, clearCronValidation } = triggersSlice.actions;
export default triggersSlice.reducer;

// Selectors
export const selectTriggers = (state: { triggers: TriggersState }) => state.triggers.triggers;
export const selectSelectedTrigger = (state: { triggers: TriggersState }) => state.triggers.selectedTrigger;
export const selectTriggersLoading = (state: { triggers: TriggersState }) => state.triggers.loading;
export const selectTriggersError = (state: { triggers: TriggersState }) => state.triggers.error;
export const selectCronValidation = (state: { triggers: TriggersState }) => state.triggers.cronValidation;