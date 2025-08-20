namespace QuartzScheduler.Server.Models;

public enum TriggerType
{
	Unknown = 0,
	Cron,
	Simple,
	Daily,
	Calendar,
}