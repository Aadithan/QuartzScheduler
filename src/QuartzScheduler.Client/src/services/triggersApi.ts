import api from './api';

// Types matching the API models
export interface TriggerListItem {
  type: string;
  triggerName: string;
  triggerGroup: string;
  isPaused: boolean;
  jobKey: string;
  jobGroup: string;
  jobName: string;
  scheduleDescription: string;
  startTime?: string;
  endTime?: string;
  lastFireTime?: string;
  nextFireTime?: string;
  clrType: string;
  description?: string;
  state: string;
}

export interface TriggerPropertiesViewModel {
  isNew: boolean;
  triggerName: string;
  triggerGroup: string;
  job: string;
  description?: string;
  priority?: number;
  cronExpression?: string;
  startTime?: Date;
  endTime?: Date;
  repeatCount?: number;
  repeatInterval?: string; // Will be converted to TimeSpan on backend
  calendarName?: string; // Associated calendar
  jobDataMap?: Record<string, any>;
}

export interface CreateTriggerRequest {
  triggerName: string;
  triggerGroup: string;
  job: string;
  description?: string;
  priority?: number;
  cronExpression?: string;
  startTime?: Date;
  endTime?: Date;
  repeatCount?: number;
  repeatInterval?: string;
  calendarName?: string; // Associated calendar
  jobDataMap?: Record<string, any>;
}

export interface UpdateTriggerRequest {
  job: string;
  description?: string;
  priority?: number;
  cronExpression?: string;
  startTime?: Date;
  endTime?: Date;
  repeatCount?: number;
  repeatInterval?: string;
  calendarName?: string; // Associated calendar
  jobDataMap?: Record<string, any>;
}

export interface CronValidationResponse {
  success: boolean;
  dates?: string[];
  error?: string;
}

// Triggers API service
export const triggersApi = {
  // Get all triggers
  getTriggers: async (): Promise<TriggerListItem[]> => {
    const response = await api.get<TriggerListItem[]>('/triggers');
    return response.data;
  },

  // Get specific trigger
  getTrigger: async (name: string, group: string): Promise<TriggerPropertiesViewModel> => {
    const response = await api.get<TriggerPropertiesViewModel>(`/triggers/${encodeURIComponent(name)}/${encodeURIComponent(group)}`);
    return response.data;
  },

  // Create new trigger
  createTrigger: async (trigger: CreateTriggerRequest): Promise<void> => {
    await api.post('/triggers', trigger);
  },

  // Update existing trigger
  updateTrigger: async (name: string, group: string, trigger: UpdateTriggerRequest): Promise<void> => {
    await api.put(`/triggers/${encodeURIComponent(name)}/${encodeURIComponent(group)}`, trigger);
  },

  // Delete trigger
  deleteTrigger: async (name: string, group: string): Promise<void> => {
    await api.delete(`/triggers/${encodeURIComponent(name)}/${encodeURIComponent(group)}`);
  },

  // Pause trigger
  pauseTrigger: async (name: string, group: string): Promise<void> => {
    await api.post(`/triggers/${encodeURIComponent(name)}/${encodeURIComponent(group)}/pause`);
  },

  // Resume trigger
  resumeTrigger: async (name: string, group: string): Promise<void> => {
    await api.post(`/triggers/${encodeURIComponent(name)}/${encodeURIComponent(group)}/resume`);
  },

  // Pause all (scheduler-wide operation)
  pauseAllTriggers: async (): Promise<void> => {
    await api.post('/scheduler/pause-all');
  },

  // Resume all (scheduler-wide operation)
  resumeAllTriggers: async (): Promise<void> => {
    await api.post('/scheduler/resume-all');
  },

  // Start scheduler
  startScheduler: async (): Promise<void> => {
    await api.post('/scheduler/start');
  },

  // Stop scheduler
  stopScheduler: async (): Promise<void> => {
    await api.post('/scheduler/shutdown');
  },

  // Validate cron expression
  validateCronExpression: async (cronExpression: string): Promise<CronValidationResponse> => {
    const response = await api.post<CronValidationResponse>('/triggers/cron/validate', cronExpression);
    return response.data;
  },

  // Describe cron expression
  describeCronExpression: async (cronExpression: string): Promise<{description: string, next: string[]}> => {
    const response = await api.post<{description: string, next: string[]}>('/triggers/cron/describe', cronExpression);
    return response.data;
  },
};