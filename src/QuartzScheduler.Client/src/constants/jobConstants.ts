// Job Groups
export const JOB_GROUPS = [
  { value: 'DEFAULT', label: 'DEFAULT' },
  { value: 'Report', label: 'Report' }
] as const;

// Job Classes/Types
export const JOB_CLASSES = [
  { value: 'Quartz.Job.NativeJob, Quartz', label: 'NativeJob' },
  { value: 'Quartz.Jobs.NoOpJob, Quartz', label: 'NoOpJob' },
  { value: 'QuartzScheduler.Server.Jobs.FileWriterJob, QuartzScheduler.Server', label: 'FileWriter' }
] as const;

// Job Flags
export const JOB_FLAGS = {
  REQUESTS_RECOVERY: 'Requests Recovery',
  PERSIST_DATA: 'Persist Job Data After Execution',
  DISALLOW_CONCURRENT: 'Disallow Concurrent Execution',
  DURABLE: 'Durable',
} as const;

// Default values
export const DEFAULT_JOB_GROUP = 'DEFAULT';
export const DEFAULT_JOB_CLASS = 'Quartz.Job.NativeJob, Quartz';

export type JobGroup = typeof JOB_GROUPS[number]['value'];
export type JobClass = typeof JOB_CLASSES[number]['value'];
