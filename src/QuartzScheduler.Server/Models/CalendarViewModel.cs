using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuartzScheduler.Server.Models
{
    public class CalendarViewModel
    {
        [Required]
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;
        
        [JsonPropertyName("description")]
        public string? Description { get; set; }
        
        [JsonPropertyName("timeZone")]
        public string? TimeZone { get; set; }
        
        [JsonPropertyName("cronExpression")]
        public string? CronExpression { get; set; }
        
        [JsonPropertyName("invertTimeRange")]
        public bool? InvertTimeRange { get; set; }
        
        [JsonPropertyName("startingTime")]
        public string? StartingTime { get; set; }
        
        [JsonPropertyName("endingTime")]
        public string? EndingTime { get; set; }
        
        [JsonPropertyName("days")]
        public List<string>? Days { get; set; }
        
        [JsonPropertyName("dates")]
        public List<string>? Dates { get; set; }
        
        [JsonPropertyName("daysExcluded")]
        public bool[]? DaysExcluded { get; set; }
    }
} 