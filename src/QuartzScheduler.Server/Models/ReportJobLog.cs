using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuartzScheduler.Server.Models;

[Table("REPORT_JOB_LOG_TABLE")]
public class ReportJobLog
{
    [Key]
    [Column("ID")]
    public string Id { get; set; } = default!;

    [Column("CUST_ACCOUNT")]
    [Required]
    [MaxLength(100)]
    public string Account { get; set; } = default!;

    [Column("CUST_DATABASE")]
    [Required]
    [MaxLength(50)]
    public string Database { get; set; } = default!;

    [Column("CUST_SCHEMA")]
    [Required]
    [MaxLength(20)]
    public string Schema { get; set; } = default!;

    [Column("DOWNLOADQUEUEID")]
    public int DownloadQueueId { get; set; }

    [Column("ENVIRONMENT")]
    [Required]
    [MaxLength(15)]
    public string Environment { get; set; } = default!;

    [Column("STARTED")]
    public DateTime? Started { get; set; }

    [Column("ENDED")]
    public DateTime? Ended { get; set; }

    [Column("RESULT")]
    public int? Result { get; set; }

    [Column("STATUS")]
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = default!;

    // Computed properties
    [NotMapped]
    public TimeSpan? Duration => Ended.HasValue && Started.HasValue 
        ? Ended.Value - Started.Value 
        : null;

    [NotMapped]
    public bool IsCompleted => Status == "Completed";

    [NotMapped]
    public bool IsFailed => Status == "Failed";

    [NotMapped]
    public bool IsRunning => Status == "Started" && !Ended.HasValue;

    // Additional property for trigger name (not mapped to database)
    [NotMapped]
    public string? TriggerName { get; set; }
}