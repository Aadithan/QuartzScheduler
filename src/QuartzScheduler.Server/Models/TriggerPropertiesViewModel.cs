namespace QuartzScheduler.Server.Models
{
    public class TriggerPropertiesViewModel
    {
        public bool IsNew { get; set; }
        public string TriggerName { get; set; }
        public string TriggerGroup { get; set; }
        public string Job { get; set; }
        public string Description { get; set; }
        public int? Priority { get; set; }
        public string CronExpression { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int? RepeatCount { get; set; }
        public TimeSpan? RepeatInterval { get; set; }
        public string? CalendarName { get; set; } // Associated calendar
        public Dictionary<string, object>? JobDataMap { get; set; }
    }
} 