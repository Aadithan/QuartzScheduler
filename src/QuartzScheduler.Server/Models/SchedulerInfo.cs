namespace QuartzScheduler.Server.Models
{
    public class SchedulerInfo
    {
        public string Name { get; set; }
        public string InstanceId { get; set; }
        public string Type { get; set; }
        public bool IsStarted { get; set; }
        public bool IsShutdown { get; set; }
        public bool InStandbyMode { get; set; }
        public DateTime? RunningSince { get; set; }
        public int JobsCount { get; set; }
        public int TriggerCount { get; set; }
        public int ExecutingJobs { get; set; }
        public int FailedJobs { get; set; }
        public int ExecutedJobs { get; set; }
        public string MachineName { get; set; }
        public string Application { get; set; }
        public List<GroupInfo> JobGroups { get; set; } = new List<GroupInfo>();
        public List<GroupInfo> TriggerGroups { get; set; } = new List<GroupInfo>();
    }

    public class GroupInfo
    {
        public string Name { get; set; }
        public int Count { get; set; }
        public bool IsPaused { get; set; }
    }
} 