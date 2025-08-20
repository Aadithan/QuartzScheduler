namespace QuartzScheduler.Server.Helpers.CronExpressionDescriptor
{
    /// <summary>
    /// Options for parsing and describing a Cron Expression
    /// </summary>
    public class Options
    {
        public Options()
        {
            this.ThrowExceptionOnParseError = false; // Changed to false for better UX
            this.Verbose = false;
            this.DayOfWeekStartIndexZero = true;
            this.Use24HourTimeFormat = true;
            this.Locale = "en-US"; // Set default locale
        }

        public bool ThrowExceptionOnParseError { get; set; }
        public bool Verbose { get; set; }
        public bool DayOfWeekStartIndexZero { get; set; }
        public bool? Use24HourTimeFormat { get; set; }
        public string Locale { get; set; } = "en-US"; // Initialize with default
    }
}
