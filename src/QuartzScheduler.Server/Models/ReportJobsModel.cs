namespace QuartzScheduler.Server.Models;

public class ReportJobsModel : ReportJobRequestModel
{
    public string JobId { get; init; } = default!; 
    public string JobRunTime { get; init; } = default!;   
}