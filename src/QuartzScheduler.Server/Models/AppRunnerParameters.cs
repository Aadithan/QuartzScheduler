namespace QuartzScheduler.Server.Models;

public class AppRunnerParameters
{
	public string ExePath { get; set; } = string.Empty;
	public string Arguments { get; set; } = string.Empty;
	public string WorkingDirectory { get; set; } = string.Empty;
	public bool WaitForExit { get; set; } = true;
	public int TimeoutSeconds { get; set; } = 30;
}