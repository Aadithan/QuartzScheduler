namespace QuartzScheduler.Server.Models
{
	public class ReportJobRequestModel
	{
		public string Account { get; set; } = default!;
		public string Database { get; set; } = default!;
		public string Schema { get; set; } = default!;
		public int DownloadQueueId { get; set; } = default!; 
		public string Environment { get; set; } = default!;
	}
}
