namespace QuartzScheduler.Server.Models
{
    public class ExecutionListItem
    {
        public string Id { get; set; }
        public string JobGroup { get; set; }
        public string JobName { get; set; }
        public string TriggerGroup { get; set; }
        public string TriggerName { get; set; }
        public string ScheduledFireTime { get; set; }
        public string ActualFireTime { get; set; }
        public string RunTime { get; set; }
        public string State { get; set; }
    }
} 