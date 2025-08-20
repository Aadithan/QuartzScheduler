namespace QuartzScheduler.Server.Models
{
    public class CreateTriggerRequest
    {
        public string TriggerName { get; set; } = default!;
        public string TriggerGroup { get; set; } = default!;
        public string Job { get; set; } = default!;
        public string? Description { get; set; }
        public int? Priority { get; set; }
        public string? CronExpression { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int? RepeatCount { get; set; }
        public string? RepeatInterval { get; set; } // Will be converted to TimeSpan
        public string? CalendarName { get; set; } // Associated calendar
        public Dictionary<string, object>? JobDataMap { get; set; }
    }
}
