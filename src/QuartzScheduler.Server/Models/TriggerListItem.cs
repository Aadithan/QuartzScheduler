namespace QuartzScheduler.Server.Models
{
    public class TriggerListItem
    {
        public string JobKey { get; set; }
        public string JobName { get; set; }
        public string JobGroup { get; set; }
        public string TriggerName { get; set; }
        public string TriggerGroup { get; set; }
        public bool IsPaused { get; set; }
        public string Type { get; set; }
        public string ScheduleType { get; set; } // Added for frontend compatibility
        public string ClrType { get; set; }
        public string Description { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string LastFireTime { get; set; }
        public string NextFireTime { get; set; }
        public string ScheduleDescription { get; set; }
        public string State { get; set; }
    }
} 