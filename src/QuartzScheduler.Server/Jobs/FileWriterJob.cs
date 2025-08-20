using Quartz;

namespace QuartzScheduler.Server.Jobs;

public class FileWriterJob : IJob
{
	//POST /api/jobs/FILE_WRITER/DEFAULT/trigger

	public async Task Execute(IJobExecutionContext context)
    {
        var jobName = context.JobDetail.Key.ToString();
        var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        
        try
        {
            // Read JobDataMap
            var dataMap = context.MergedJobDataMap;
            
            // Get basic parameters with defaults
            var filePath = dataMap.ContainsKey("filePath") ? dataMap.GetString("filePath") : "C:\\temp\\filewriter.txt"; 
            
            // Create directory if needed
            var directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            
            // Build file content with all information
            var content = BuildFileContent(jobName, timestamp, dataMap);
            
            // Write to file
            await File.WriteAllTextAsync(filePath, content);
        }
        catch (Exception ex)
        {
            throw new JobExecutionException($"FileWriterJob failed: {ex.Message}", ex);
        }
    }
    
    private static string BuildFileContent(string jobName, string timestamp, JobDataMap dataMap)
    {
        var content = new System.Text.StringBuilder();
        
        // Header
        content.AppendLine("=====================================");
        content.AppendLine("    QUARTZ FILEWRITER JOB EXECUTION");
        content.AppendLine("=====================================");
        content.AppendLine($"Execution Time: {timestamp}");
        content.AppendLine($"Job Name: {jobName}");
        content.AppendLine($"Execution ID: {Guid.NewGuid().ToString("N")[..8]}");
        content.AppendLine();
        
        // JobDataMap contents
        content.AppendLine("--- JOB DATA MAP ---");
        content.AppendLine($"Total entries: {dataMap.Count}");
        content.AppendLine();
        
        if (dataMap.Count > 0)
        {
            foreach (var key in dataMap.Keys)
            {
                content.AppendLine($"Key: {key}");
                content.AppendLine($"Value: {dataMap[key]}");
                content.AppendLine($"Type: {dataMap[key]?.GetType().Name ?? "null"}");
                content.AppendLine();
            }
        }
        else
        {
            content.AppendLine("No job data parameters provided.");
            content.AppendLine();
        } 

        // Footer
        content.AppendLine("--- END OF EXECUTION ---");
        content.AppendLine($"File generated at: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        content.AppendLine("=====================================");
        
        return content.ToString();
    }
}