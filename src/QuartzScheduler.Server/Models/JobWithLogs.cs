namespace QuartzScheduler.Server.Models;

/// <summary>
/// Combined model showing Quartz job details with execution log history
/// </summary>
public class JobWithLogs
{
    // Quartz Job Details
    public string JobName { get; set; } = default!;
    public string Group { get; set; } = default!;
    public string? Type { get; set; } = default!;
    public string? Description { get; set; }
    public bool Recovery { get; set; }
    public bool Persist { get; set; }
    public bool Concurrent { get; set; }
    public bool Durable { get; set; }
    public string? LastFireTime { get; set; }
    public string? NextFireTime { get; set; }
    public string State { get; set; } = default!;
    public Dictionary<string, object> JobDataMap { get; set; } = new();

    // Execution History from REPORT_JOB_LOG_TABLE
    public List<ReportJobLog> ExecutionHistory { get; set; } = new();

    // Latest execution details
    public ReportJobLog? LatestExecution => ExecutionHistory.MaxBy(x => x.Started);

    // Statistics
    public int TotalExecutions => ExecutionHistory.Count;
    public int SuccessfulExecutions => ExecutionHistory.Count(x => x.IsCompleted);
    public int FailedExecutions => ExecutionHistory.Count(x => x.IsFailed);
    public int RunningExecutions => ExecutionHistory.Count(x => x.IsRunning);
    
    public double SuccessRate => TotalExecutions > 0 
        ? (double)SuccessfulExecutions / TotalExecutions * 100 
        : 0;

    public TimeSpan? AverageExecutionTime
    {
        get
        {
            var completedJobs = ExecutionHistory
                .Where(x => x.Duration.HasValue)
                .ToList();
                
            if (!completedJobs.Any()) return null;
            
            var totalTicks = completedJobs.Sum(x => x.Duration!.Value.Ticks);
            return new TimeSpan(totalTicks / completedJobs.Count);
        }
    }
}