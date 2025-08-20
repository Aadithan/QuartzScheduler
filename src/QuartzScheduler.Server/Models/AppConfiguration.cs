namespace QuartzScheduler.Server.Models;

public class AppConfiguration
{
    public const string AppConfigurationSectionName = "AppConfiguration"; 
    public int Port { get; init; }
    public string TestAppRunnerWorkingDirectory { get; init; } = string.Empty;
    public string ConnectionString { get; init; } = string.Empty;
    public string JobLogTableName { get; init; } = string.Empty; 
    public string Environment { get; set; } = string.Empty;
    public string QuartzThreadCount { get; set; } = string.Empty;
}