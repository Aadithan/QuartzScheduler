import api from './api';

// Types matching the API models
export interface ReportJobLog {
  id: string;
  account: string;
  database: string;
  schema: string;
  downloadQueueId: number;
  environment: string;
  started?: string;
  ended?: string;
  result?: number;
  status: string;
  duration?: string;
  isCompleted: boolean;
  isFailed: boolean;
  isRunning: boolean;
  triggerName?: string; // Added for proper trigger name support
}

// Removed ExecutionLogItem - using ReportJobLog directly from JOB_LOG_TABLE

export interface RunningJobItem {
  jobName: string;
  trigger: string;
  scheduledFireTime: string;
  actualFireTime: string;
  runTime: string;
}

// New interface matching backend ExecutionListItem
export interface ExecutionListItem {
  id: string;
  jobGroup: string;
  jobName: string;
  triggerGroup: string;
  triggerName: string;
  scheduledFireTime: string;
  actualFireTime: string;
  runTime: string;
  state: string;
}

export interface JobStatistics {
  completedJobs: number;
  failedJobs: number;
  currentlyRunningJobs: number;
  totalJobs: number;
}

export interface JobGroupItem {
  name: string;
  count: number;
}

export interface JobTypeItem {
  type: string;
  count: number;
}

export interface JobWithLogs {
  jobName: string;
  group: string;
  type: string;
  description?: string;
  recovery: boolean;
  persist: boolean;
  concurrent: boolean;
  durable: boolean;
  lastFireTime?: string;
  nextFireTime?: string;
  state: string;
  jobDataMap?: Record<string, any>;
  executionHistory: ReportJobLog[];
  latestExecution?: ReportJobLog;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  runningExecutions: number;
  successRate: number;
  averageExecutionTime?: string;
}

// Keep for backward compatibility
export interface JobListItem extends JobWithLogs {}

export interface JobPropertiesViewModel {
  isNew: boolean;
  jobName: string;
  group: string;
  type: string;
  description: string;
  recovery: boolean;
  persist: boolean;
  concurrent: boolean;
  durable: boolean;
  jobDataMap?: Record<string, any>;
}

export interface CreateJobRequest {
  jobName: string;
  group: string;
  type: string;
  description: string;
  recovery: boolean;
  persist: boolean;
  concurrent: boolean;
  durable: boolean;
  jobDataMap?: Record<string, any>;
}

export interface UpdateJobRequest {
  type: string;
  description: string;
  recovery: boolean;
  persist: boolean;
  concurrent: boolean;
  durable: boolean;
  jobDataMap?: Record<string, any>;
}

export interface TriggerJobRequest {
  jobDataMap?: Record<string, any>;
}

export interface JobLogsParams {
  account?: string;
  environment?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

// Jobs API service
export const jobsApi = {
  // Get all jobs
  getJobs: async (): Promise<JobWithLogs[]> => {
    const response = await api.get<JobWithLogs[]>('/jobs');
    return response.data;
  },

  // Get specific job
  getJob: async (name: string, group: string): Promise<JobPropertiesViewModel> => {
    const response = await api.get<JobPropertiesViewModel>(`/jobs/${encodeURIComponent(name)}/${encodeURIComponent(group)}`);
    return response.data;
  },

  // Create new job
  createJob: async (job: CreateJobRequest): Promise<void> => {
    await api.post('/jobs', job);
  },

  // Update existing job
  updateJob: async (name: string, group: string, job: UpdateJobRequest): Promise<void> => {
    await api.put(`/jobs/${encodeURIComponent(name)}/${encodeURIComponent(group)}`, job);
  },

  // Delete job
  deleteJob: async (name: string, group: string): Promise<void> => {
    await api.delete(`/jobs/${encodeURIComponent(name)}/${encodeURIComponent(group)}`);
  },

  // Pause job
  pauseJob: async (name: string, group: string): Promise<void> => {
    await api.post(`/jobs/${encodeURIComponent(name)}/${encodeURIComponent(group)}/pause`);
  },

  // Resume job
  resumeJob: async (name: string, group: string): Promise<void> => {
    await api.post(`/jobs/${encodeURIComponent(name)}/${encodeURIComponent(group)}/resume`);
  },

  // Trigger job
  triggerJob: async (name: string, group: string, request?: TriggerJobRequest): Promise<void> => {
    await api.post(`/jobs/${encodeURIComponent(name)}/${encodeURIComponent(group)}/trigger`, request?.jobDataMap || {});
  },

  // Get job logs
  getJobLogs: async (params?: JobLogsParams): Promise<ReportJobLog[]> => {
    const queryParams = new URLSearchParams();
    if (params?.account) queryParams.append('account', params.account);
    if (params?.environment) queryParams.append('environment', params.environment);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    
    const url = `/jobs/logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ReportJobLog[]>(url);
    return response.data;
  },

  // Get specific job log
  getJobLog: async (id: string): Promise<ReportJobLog> => {
    const response = await api.get<ReportJobLog>(`/jobs/logs/${encodeURIComponent(id)}`);
    return response.data;
  },

  // Get running jobs
  getRunningJobs: async (): Promise<ReportJobLog[]> => {
    const response = await api.get<ReportJobLog[]>('/jobs/logs/running');
    return response.data;
  },

  // Get job statistics (legacy)
  getJobStatistics: async (): Promise<Record<string, number>> => {
    const response = await api.get<Record<string, number>>('/jobs/statistics');
    return response.data;
  },

  // Get job history
  getJobHistory: async (name: string, group: string): Promise<JobWithLogs> => {
    const response = await api.get<JobWithLogs>(`/jobs/${encodeURIComponent(name)}/${encodeURIComponent(group)}/history`);
    return response.data;
  },

  // New Quartzmin-style API endpoints (using existing backend APIs)
  getExecutionLogs: async (): Promise<ReportJobLog[]> => {
    // Directly return real data from JOB_LOG_TABLE without fallback logic
    const response = await api.get<ReportJobLog[]>('/jobs/logs');
    return response.data || [];
  },

  getRunningJobsNew: async (): Promise<RunningJobItem[]> => {
    try {
      // Use new merged executions endpoint from JobsController
      const response = await api.get<ExecutionListItem[]>('/jobs/executions');
      const executions = response.data || [];
      
      // Transform ExecutionListItem format to RunningJobItem format
      const transformedJobs: RunningJobItem[] = executions.map(execution => ({
        jobName: execution.jobName,
        trigger: execution.triggerName,
        scheduledFireTime: execution.scheduledFireTime,
        actualFireTime: execution.actualFireTime,
        runTime: execution.runTime
      }));
      
      return transformedJobs;
    } catch (error: any) {
      console.warn('Failed to fetch running jobs from /jobs/executions:', error?.response?.status, error?.message);
      
      // Fallback: Try the old endpoint as backup
      try {
        const fallbackResponse = await api.get<ReportJobLog[]>('/jobs/logs/running');
        const runningJobs = fallbackResponse.data || [];
        
        const fallbackTransformedJobs: RunningJobItem[] = runningJobs
          .filter(job => job && job.isRunning)
          .map(job => ({
            jobName: job.database || `Job-${job.id?.substring(0, 8) || 'unknown'}`,
            trigger: job.triggerName || job.schema || `Trigger-${job.environment || 'default'}`,
            scheduledFireTime: job.started || '-',
            actualFireTime: job.started || '-',
            runTime: 'Running...'
          }));
        
        return fallbackTransformedJobs;
      } catch (fallbackError: any) {
        console.warn('Fallback endpoint also failed:', fallbackError?.response?.status, fallbackError?.message);
        
        // Final fallback: Return empty array
        return [];
      }
    }
  },

  // Get executions with full data (for advanced operations like interrupting)
  getExecutions: async (): Promise<ExecutionListItem[]> => {
    try {
      const response = await api.get<ExecutionListItem[]>('/jobs/executions');
      return response.data || [];
    } catch (error: any) {
      console.warn('Failed to fetch executions from /jobs/executions:', error?.response?.status, error?.message);
      return [];
    }
  },

  // Get specific execution by ID
  getExecution: async (id: string): Promise<ExecutionListItem | null> => {
    try {
      const response = await api.get<ExecutionListItem>(`/jobs/executions/${encodeURIComponent(id)}`);
      return response.data;
    } catch (error: any) {
      console.warn(`Failed to fetch execution ${id} from /jobs/executions/${id}:`, error?.response?.status, error?.message);
      return null;
    }
  },

  // Interrupt execution
  interruptExecution: async (id: string): Promise<boolean> => {
    try {
      await api.post(`/jobs/executions/${encodeURIComponent(id)}/interrupt`);
      return true;
    } catch (error: any) {
      console.warn(`Failed to interrupt execution ${id}:`, error?.response?.status, error?.message);
      return false;
    }
  },

  // Get executions for specific job
  getJobExecutions: async (jobName: string, jobGroup: string): Promise<ExecutionListItem[]> => {
    try {
      const response = await api.get<ExecutionListItem[]>(`/jobs/executions/job/${encodeURIComponent(jobName)}/${encodeURIComponent(jobGroup)}`);
      return response.data || [];
    } catch (error: any) {
      console.warn(`Failed to fetch executions for job ${jobName}/${jobGroup}:`, error?.response?.status, error?.message);
      return [];
    }
  },

  getJobStatisticsNew: async (): Promise<JobStatistics> => {
    try {
      // Use existing statistics endpoint
      const response = await api.get<Record<string, number>>('/jobs/statistics');
      const stats = response.data || {};
      
      // Transform to new JobStatistics format - now using correct field names
      const completedJobs = stats['Completed'] || 0;
      const failedJobs = stats['Failed'] || 0;
      const runningJobs = stats['Started'] || stats['Running'] || 0;
      const totalJobs = stats['TotalJobs'] || (completedJobs + failedJobs + runningJobs);
      
      const jobStatistics: JobStatistics = {
        completedJobs,
        failedJobs,
        currentlyRunningJobs: runningJobs,
        totalJobs
      };
      
      return jobStatistics;
    } catch (error: any) {
      console.warn('Failed to fetch job statistics from /jobs/statistics:', error?.response?.status, error?.message);
      
      // Fallback: Try to get basic counts from jobs endpoint
      try {
        const jobsResponse = await api.get<JobWithLogs[]>('/jobs');
        const jobs = jobsResponse.data || [];
        
        // Get running jobs count from executions endpoint
        const executionsResponse = await api.get<ExecutionListItem[]>('/jobs/executions');
        const runningCount = executionsResponse.data?.length || 0;
        
        return {
          completedJobs: 0, // Can't determine from jobs endpoint
          failedJobs: 0,    // Can't determine from jobs endpoint
          currentlyRunningJobs: runningCount,
          totalJobs: jobs.length
        };
      } catch (fallbackError) {
        console.warn('Fallback statistics fetch also failed:', fallbackError);
        return {
          completedJobs: 0,
          failedJobs: 0,
          currentlyRunningJobs: 0,
          totalJobs: 0
        };
      }
    }
  },

  getJobGroups: async (): Promise<JobGroupItem[]> => {
    try {
      // Use existing jobs endpoint and extract groups
      const response = await api.get<JobWithLogs[]>('/jobs');
      const jobs = response.data;
      
      // Group jobs by group and count them
      const groupCounts = jobs.reduce((acc, job) => {
        acc[job.group] = (acc[job.group] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const jobGroups: JobGroupItem[] = Object.entries(groupCounts).map(([name, count]) => ({
        name,
        count
      }));
      
      return jobGroups;
    } catch (error) {
      console.warn('Failed to fetch job groups, returning empty array:', error);
      return [];
    }
  },

  getJobTypes: async (): Promise<JobTypeItem[]> => {
    try {
      // Use existing jobs endpoint and extract types
      const response = await api.get<JobWithLogs[]>('/jobs');
      const jobs = response.data;
      
      // Group jobs by type and count them
      const typeCounts = jobs.reduce((acc, job) => {
        acc[job.type] = (acc[job.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const jobTypes: JobTypeItem[] = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count
      }));
      
      return jobTypes;
    } catch (error) {
      console.warn('Failed to fetch job types, returning empty array:', error);
      return [];
    }
  },
};