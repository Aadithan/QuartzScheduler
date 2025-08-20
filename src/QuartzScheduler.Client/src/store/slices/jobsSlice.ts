import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jobsApi, JobWithLogs, ReportJobLog, CreateJobRequest, UpdateJobRequest, TriggerJobRequest, JobLogsParams, RunningJobItem, JobStatistics, JobGroupItem, JobTypeItem, ExecutionListItem } from '../../services/jobsApi';

// Updated Job interface to match API response
export interface Job extends JobWithLogs {}

// Keep for backward compatibility
export interface JobListItem extends JobWithLogs {}

interface JobsState {
  jobs: Job[];
  jobLogs: ReportJobLog[];
  runningJobs: ReportJobLog[];
  jobStatistics: Record<string, number>;
  // New Quartzmin-style data
  executionLogs: ReportJobLog[];
  runningJobsNew: RunningJobItem[];
  executions: ExecutionListItem[]; // Full execution data for advanced operations
  jobStatisticsNew: JobStatistics;
  jobGroups: JobGroupItem[];
  jobTypes: JobTypeItem[];
  loading: boolean;
  error: string | null;
  operationLoading: { [key: string]: boolean }; // For tracking individual operations
}

const initialState: JobsState = {
  jobs: [],
  jobLogs: [],
  runningJobs: [],
  jobStatistics: {},
  // New Quartzmin-style data
  executionLogs: [],
  runningJobsNew: [],
  executions: [],
  jobStatisticsNew: {
    completedJobs: 0,
    failedJobs: 0,
    currentlyRunningJobs: 0,
    totalJobs: 0,
  },
  jobGroups: [],
  jobTypes: [],
  loading: false,
  error: null,
  operationLoading: {},
};

// Async thunks for API operations
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const jobs = await jobsApi.getJobs();
      return jobs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch jobs');
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (job: CreateJobRequest, { rejectWithValue }) => {
    try {
      await jobsApi.createJob(job);
      return job;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create job');
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ name, group, job }: { name: string; group: string; job: UpdateJobRequest }, { rejectWithValue }) => {
    try {
      await jobsApi.updateJob(name, group, job);
      return { name, group, job };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update job');
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async ({ name, group }: { name: string; group: string }, { rejectWithValue }) => {
    try {
      await jobsApi.deleteJob(name, group);
      return { name, group };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete job');
    }
  }
);

export const pauseJob = createAsyncThunk(
  'jobs/pauseJob',
  async ({ name, group }: { name: string; group: string }, { rejectWithValue }) => {
    try {
      await jobsApi.pauseJob(name, group);
      return { name, group };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to pause job');
    }
  }
);

export const resumeJob = createAsyncThunk(
  'jobs/resumeJob',
  async ({ name, group }: { name: string; group: string }, { rejectWithValue }) => {
    try {
      await jobsApi.resumeJob(name, group);
      return { name, group };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to resume job');
    }
  }
);

export const triggerJob = createAsyncThunk(
  'jobs/triggerJob',
  async ({ name, group, request }: { name: string; group: string; request?: TriggerJobRequest }, { rejectWithValue }) => {
    try {
      await jobsApi.triggerJob(name, group, request);
      return { name, group };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to trigger job');
    }
  }
);

export const fetchJobLogs = createAsyncThunk(
  'jobs/fetchJobLogs',
  async (params: JobLogsParams | undefined, { rejectWithValue }) => {
    try {
      const logs = await jobsApi.getJobLogs(params);
      return logs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch job logs');
    }
  }
);

export const fetchRunningJobs = createAsyncThunk(
  'jobs/fetchRunningJobs',
  async (_, { rejectWithValue }) => {
    try {
      const runningJobs = await jobsApi.getRunningJobs();
      return runningJobs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch running jobs');
    }
  }
);

export const fetchJobStatistics = createAsyncThunk(
  'jobs/fetchJobStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const statistics = await jobsApi.getJobStatistics();
      return statistics;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch job statistics');
    }
  }
);

export const fetchJobHistory = createAsyncThunk(
  'jobs/fetchJobHistory',
  async ({ name, group }: { name: string; group: string }, { rejectWithValue }) => {
    try {
      const jobWithHistory = await jobsApi.getJobHistory(name, group);
      return jobWithHistory;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch job history');
    }
  }
);

// New Quartzmin-style async thunks
export const fetchExecutionLogs = createAsyncThunk(
  'jobs/fetchExecutionLogs',
  async (_, { rejectWithValue }) => {
    try {
      const logs = await jobsApi.getExecutionLogs();
      return logs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch execution logs');
    }
  }
);

export const fetchRunningJobsNew = createAsyncThunk(
  'jobs/fetchRunningJobsNew',
  async (_, { rejectWithValue }) => {
    try {
      const runningJobs = await jobsApi.getRunningJobsNew();
      return runningJobs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch running jobs');
    }
  }
);

export const fetchJobStatisticsNew = createAsyncThunk(
  'jobs/fetchJobStatisticsNew',
  async (_, { rejectWithValue }) => {
    try {
      const statistics = await jobsApi.getJobStatisticsNew();
      return statistics;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch job statistics');
    }
  }
);

export const fetchJobGroups = createAsyncThunk(
  'jobs/fetchJobGroups',
  async (_, { rejectWithValue }) => {
    try {
      const groups = await jobsApi.getJobGroups();
      return groups;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch job groups');
    }
  }
);

export const fetchJobTypes = createAsyncThunk(
  'jobs/fetchJobTypes',
  async (_, { rejectWithValue }) => {
    try {
      const types = await jobsApi.getJobTypes();
      return types;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch job types');
    }
  }
);

// New execution-related thunks
export const fetchExecutions = createAsyncThunk(
  'jobs/fetchExecutions',
  async (_, { rejectWithValue }) => {
    try {
      const executions = await jobsApi.getExecutions();
      return executions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch executions');
    }
  }
);

export const fetchExecution = createAsyncThunk(
  'jobs/fetchExecution',
  async (id: string, { rejectWithValue }) => {
    try {
      const execution = await jobsApi.getExecution(id);
      return execution;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch execution');
    }
  }
);

export const interruptExecution = createAsyncThunk(
  'jobs/interruptExecution',
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await jobsApi.interruptExecution(id);
      if (!success) {
        throw new Error('Failed to interrupt execution');
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to interrupt execution');
    }
  }
);

export const fetchJobExecutions = createAsyncThunk(
  'jobs/fetchJobExecutions',
  async ({ jobName, jobGroup }: { jobName: string; jobGroup: string }, { rejectWithValue }) => {
    try {
      const executions = await jobsApi.getJobExecutions(jobName, jobGroup);
      return executions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch job executions');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOperationLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.operationLoading[action.payload.key] = action.payload.loading;
    },
  },
  extraReducers: (builder) => {
    // Fetch jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create job
    builder
      .addCase(createJob.pending, (state) => {
        state.operationLoading['create'] = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state) => {
        state.operationLoading['create'] = false;
        // Refresh jobs list after creation would be handled by calling fetchJobs
      })
      .addCase(createJob.rejected, (state, action) => {
        state.operationLoading['create'] = false;
        state.error = action.payload as string;
      });

    // Update job
    builder
      .addCase(updateJob.pending, (state, action) => {
        const key = `update-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const key = `update-${action.payload.name}-${action.payload.group}`;
        state.operationLoading[key] = false;
        // Refresh jobs list after update would be handled by calling fetchJobs
      })
      .addCase(updateJob.rejected, (state, action) => {
        const key = `update-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // Delete job
    builder
      .addCase(deleteJob.pending, (state, action) => {
        const key = `delete-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        const key = `delete-${action.payload.name}-${action.payload.group}`;
        state.operationLoading[key] = false;
        // Remove job from state
        state.jobs = state.jobs.filter(
          job => !(job.jobName === action.payload.name && job.group === action.payload.group)
        );
      })
      .addCase(deleteJob.rejected, (state, action) => {
        const key = `delete-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // Pause job
    builder
      .addCase(pauseJob.pending, (state, action) => {
        const key = `pause-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(pauseJob.fulfilled, (state, action) => {
        const key = `pause-${action.payload.name}-${action.payload.group}`;
        state.operationLoading[key] = false;
        // Update job state to paused
        const job = state.jobs.find(j => j.jobName === action.payload.name && j.group === action.payload.group);
        if (job) {
          job.state = 'Paused';
        }
      })
      .addCase(pauseJob.rejected, (state, action) => {
        const key = `pause-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // Resume job
    builder
      .addCase(resumeJob.pending, (state, action) => {
        const key = `resume-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(resumeJob.fulfilled, (state, action) => {
        const key = `resume-${action.payload.name}-${action.payload.group}`;
        state.operationLoading[key] = false;
        // Update job state to normal
        const job = state.jobs.find(j => j.jobName === action.payload.name && j.group === action.payload.group);
        if (job) {
          job.state = 'Normal';
        }
      })
      .addCase(resumeJob.rejected, (state, action) => {
        const key = `resume-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // Trigger job
    builder
      .addCase(triggerJob.pending, (state, action) => {
        const key = `trigger-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(triggerJob.fulfilled, (state, action) => {
        const key = `trigger-${action.payload.name}-${action.payload.group}`;
        state.operationLoading[key] = false;
      })
      .addCase(triggerJob.rejected, (state, action) => {
        const key = `trigger-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // Fetch job logs
    builder
      .addCase(fetchJobLogs.pending, (state) => {
        state.operationLoading['fetchLogs'] = true;
        state.error = null;
      })
      .addCase(fetchJobLogs.fulfilled, (state, action) => {
        state.operationLoading['fetchLogs'] = false;
        state.jobLogs = action.payload;
      })
      .addCase(fetchJobLogs.rejected, (state, action) => {
        state.operationLoading['fetchLogs'] = false;
        state.error = action.payload as string;
      });

    // Fetch running jobs
    builder
      .addCase(fetchRunningJobs.pending, (state) => {
        state.operationLoading['fetchRunning'] = true;
        state.error = null;
      })
      .addCase(fetchRunningJobs.fulfilled, (state, action) => {
        state.operationLoading['fetchRunning'] = false;
        state.runningJobs = action.payload;
      })
      .addCase(fetchRunningJobs.rejected, (state, action) => {
        state.operationLoading['fetchRunning'] = false;
        state.error = action.payload as string;
      });

    // Fetch job statistics
    builder
      .addCase(fetchJobStatistics.pending, (state) => {
        state.operationLoading['fetchStats'] = true;
        state.error = null;
      })
      .addCase(fetchJobStatistics.fulfilled, (state, action) => {
        state.operationLoading['fetchStats'] = false;
        state.jobStatistics = action.payload;
      })
      .addCase(fetchJobStatistics.rejected, (state, action) => {
        state.operationLoading['fetchStats'] = false;
        state.error = action.payload as string;
      });

    // Fetch job history
    builder
      .addCase(fetchJobHistory.pending, (state, action) => {
        const key = `history-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = true;
        state.error = null;
      })
      .addCase(fetchJobHistory.fulfilled, (state, action) => {
        const key = `history-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        
        // Update the job in the jobs array with the history data
        const jobIndex = state.jobs.findIndex(
          job => job.jobName === action.meta.arg.name && job.group === action.meta.arg.group
        );
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = action.payload;
        }
      })
      .addCase(fetchJobHistory.rejected, (state, action) => {
        const key = `history-${action.meta.arg.name}-${action.meta.arg.group}`;
        state.operationLoading[key] = false;
        state.error = action.payload as string;
      });

    // New Quartzmin-style reducers
    // Fetch execution logs
    builder
      .addCase(fetchExecutionLogs.pending, (state) => {
        state.operationLoading['fetchExecutionLogs'] = true;
        state.error = null;
      })
      .addCase(fetchExecutionLogs.fulfilled, (state, action) => {
        state.operationLoading['fetchExecutionLogs'] = false;
        state.executionLogs = action.payload;
      })
      .addCase(fetchExecutionLogs.rejected, (state, action) => {
        state.operationLoading['fetchExecutionLogs'] = false;
        state.error = action.payload as string;
      });

    // Fetch running jobs new
    builder
      .addCase(fetchRunningJobsNew.pending, (state) => {
        state.operationLoading['fetchRunningJobsNew'] = true;
        state.error = null;
      })
      .addCase(fetchRunningJobsNew.fulfilled, (state, action) => {
        state.operationLoading['fetchRunningJobsNew'] = false;
        state.runningJobsNew = action.payload;
      })
      .addCase(fetchRunningJobsNew.rejected, (state, action) => {
        state.operationLoading['fetchRunningJobsNew'] = false;
        state.error = action.payload as string;
      });

    // Fetch job statistics new
    builder
      .addCase(fetchJobStatisticsNew.pending, (state) => {
        state.operationLoading['fetchJobStatisticsNew'] = true;
        state.error = null;
      })
      .addCase(fetchJobStatisticsNew.fulfilled, (state, action) => {
        state.operationLoading['fetchJobStatisticsNew'] = false;
        state.jobStatisticsNew = action.payload;
      })
      .addCase(fetchJobStatisticsNew.rejected, (state, action) => {
        state.operationLoading['fetchJobStatisticsNew'] = false;
        state.error = action.payload as string;
      });

    // Fetch job groups
    builder
      .addCase(fetchJobGroups.pending, (state) => {
        state.operationLoading['fetchJobGroups'] = true;
        state.error = null;
      })
      .addCase(fetchJobGroups.fulfilled, (state, action) => {
        state.operationLoading['fetchJobGroups'] = false;
        state.jobGroups = action.payload;
      })
      .addCase(fetchJobGroups.rejected, (state, action) => {
        state.operationLoading['fetchJobGroups'] = false;
        state.error = action.payload as string;
      });

    // Fetch job types
    builder
      .addCase(fetchJobTypes.pending, (state) => {
        state.operationLoading['fetchJobTypes'] = true;
        state.error = null;
      })
      .addCase(fetchJobTypes.fulfilled, (state, action) => {
        state.operationLoading['fetchJobTypes'] = false;
        state.jobTypes = action.payload;
      })
      .addCase(fetchJobTypes.rejected, (state, action) => {
        state.operationLoading['fetchJobTypes'] = false;
        state.error = action.payload as string;
      });

    // Fetch executions
    builder
      .addCase(fetchExecutions.pending, (state) => {
        state.operationLoading['fetchExecutions'] = true;
        state.error = null;
      })
      .addCase(fetchExecutions.fulfilled, (state, action) => {
        state.operationLoading['fetchExecutions'] = false;
        state.executions = action.payload;
      })
      .addCase(fetchExecutions.rejected, (state, action) => {
        state.operationLoading['fetchExecutions'] = false;
        state.error = action.payload as string;
      });

    // Fetch execution
    builder
      .addCase(fetchExecution.pending, (state) => {
        state.operationLoading['fetchExecution'] = true;
        state.error = null;
      })
      .addCase(fetchExecution.fulfilled, (state, action) => {
        state.operationLoading['fetchExecution'] = false;
        // Update execution in the list if it exists
        if (action.payload) {
          const index = state.executions.findIndex(exec => exec.id === action.payload?.id);
          if (index !== -1) {
            state.executions[index] = action.payload;
          } else {
            state.executions.push(action.payload);
          }
        }
      })
      .addCase(fetchExecution.rejected, (state, action) => {
        state.operationLoading['fetchExecution'] = false;
        state.error = action.payload as string;
      });

    // Interrupt execution
    builder
      .addCase(interruptExecution.pending, (state) => {
        state.operationLoading['interruptExecution'] = true;
        state.error = null;
      })
      .addCase(interruptExecution.fulfilled, (state, action) => {
        state.operationLoading['interruptExecution'] = false;
        // Remove interrupted execution from the list
        state.executions = state.executions.filter(exec => exec.id !== action.payload);
      })
      .addCase(interruptExecution.rejected, (state, action) => {
        state.operationLoading['interruptExecution'] = false;
        state.error = action.payload as string;
      });

    // Fetch job executions
    builder
      .addCase(fetchJobExecutions.pending, (state) => {
        state.operationLoading['fetchJobExecutions'] = true;
        state.error = null;
      })
      .addCase(fetchJobExecutions.fulfilled, (state, action) => {
        state.operationLoading['fetchJobExecutions'] = false;
        // Store job-specific executions (could be used for detailed views)
        state.executions = action.payload;
      })
      .addCase(fetchJobExecutions.rejected, (state, action) => {
        state.operationLoading['fetchJobExecutions'] = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setOperationLoading } = jobsSlice.actions;
export default jobsSlice.reducer; 