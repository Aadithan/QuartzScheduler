namespace QuartzScheduler.Server.Models
{
    public class JobListItem
    {
        public string JobName { get; set; }
        public string Group { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
        public bool Recovery { get; set; }
        public bool Persist { get; set; } // Persist job data
        public bool Concurrent { get; set; }
        public string LastFireTime { get; set; }
        public string NextFireTime { get; set; }
        public string State { get; set; }
    }
} 