namespace QuartzScheduler.Server.Models
{
    public class JobPropertiesViewModel
    {
        public bool IsNew { get; set; }
        public string JobName { get; set; } = default!;
        public string Group { get; set; } = default!;
		public string Type { get; set; } = default!;
		public string? Description { get; set; }
        public bool Recovery { get; set; }
        public bool Persist { get; set; }
        public bool Concurrent { get; set; }
        public bool Durable { get; set; }
        public Dictionary<string, object> JobDataMap { get; set; } = new();
    }
} 