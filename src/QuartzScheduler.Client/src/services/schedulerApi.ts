import api from './api';

// Types matching the API models
export interface SchedulerInfo {
  name: string;
  instanceId: string;
  type: string;
  isStarted: boolean;
  isShutdown: boolean;
  inStandbyMode: boolean;
  runningSince?: string;
  jobsCount: number;
  triggerCount: number;
  executingJobs: number;
  failedJobs: number;
  executedJobs: number;
  machineName: string;
  application: string;
  jobGroups: GroupInfo[];
  triggerGroups: GroupInfo[];
}

export interface GroupInfo {
  name: string;
  count: number;
  isPaused: boolean;
}

// Scheduler API service
export const schedulerApi = {
  // Get scheduler status and info
  getSchedulerInfo: async (): Promise<SchedulerInfo> => {
    const response = await api.get<SchedulerInfo>('/scheduler');
    return response.data;
  },

  // Start scheduler
  startScheduler: async (): Promise<void> => {
    await api.post('/scheduler/start');
  },



  // Put scheduler in standby mode
  standbyScheduler: async (): Promise<void> => {
    await api.post('/scheduler/standby');
  },

  // Pause all jobs and triggers
  pauseAll: async (): Promise<void> => {
    await api.post('/scheduler/pause-all');
  },

  // Resume all jobs and triggers
  resumeAll: async (): Promise<void> => {
    await api.post('/scheduler/resume-all');
  },

  // Clear all jobs and triggers
  clearScheduler: async (): Promise<void> => {
    await api.post('/scheduler/clear');
  },

  // Pause specific job group
  pauseJobGroup: async (groupName: string): Promise<{ message: string; groupName: string }> => {
    const response = await api.post<{ message: string; groupName: string }>(`/scheduler/job-groups/${encodeURIComponent(groupName)}/pause`);
    return response.data;
  },

  // Resume specific job group
  resumeJobGroup: async (groupName: string): Promise<{ message: string; groupName: string }> => {
    const response = await api.post<{ message: string; groupName: string }>(`/scheduler/job-groups/${encodeURIComponent(groupName)}/resume`);
    return response.data;
  },

  // Pause specific trigger group
  pauseTriggerGroup: async (groupName: string): Promise<{ message: string; groupName: string }> => {
    const response = await api.post<{ message: string; groupName: string }>(`/scheduler/trigger-groups/${encodeURIComponent(groupName)}/pause`);
    return response.data;
  },

  // Resume specific trigger group
  resumeTriggerGroup: async (groupName: string): Promise<{ message: string; groupName: string }> => {
    const response = await api.post<{ message: string; groupName: string }>(`/scheduler/trigger-groups/${encodeURIComponent(groupName)}/resume`);
    return response.data;
  },
};