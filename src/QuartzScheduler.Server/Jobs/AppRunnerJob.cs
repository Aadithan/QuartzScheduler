using Quartz;
using System.Diagnostics;
using QuartzScheduler.Server.Models;

namespace QuartzScheduler.Server.Jobs;

public class AppRunnerJob : IJob
{
	//POST /api/jobs/APP_RUNNER/DEFAULT/trigger 
	//{
	//	"exePath": "QuartzScheduler.Tests.exe",
	//	"workingDirectory": "D:\\Workspace\\DNA\\QuartzScheduler\\src\\QuartzScheduler.Tests\\bin\\Debug\\net8.0",
	//	"waitForExit": false,
	//	"timeoutSeconds": 60
	//} 

    private readonly AppConfiguration _appConfiguration;
    private string DefaultExeName => "QuartzScheduler.Tests.exe";

    public AppRunnerJob(AppConfiguration appConfiguration)
    {
        _appConfiguration = appConfiguration;
    }

	public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            var dataMap = context.MergedJobDataMap; 
            var appParams = ExtractAppParameters(dataMap);
              
            if (!Directory.Exists(appParams.WorkingDirectory))
            {
                throw new JobExecutionException($"Working directory not found: {appParams.WorkingDirectory}");
            }

            if (!File.Exists(appParams.ExePath))
            {
	            throw new JobExecutionException($"Application executable not found: {appParams.ExePath}");
            }

			await ExecuteTestApp(appParams.ExePath, appParams.Arguments, appParams.WorkingDirectory, 
                               appParams.WaitForExit, appParams.TimeoutSeconds);
        }
        catch (Exception ex)
        {
            throw new JobExecutionException($"AppRunnerJob failed: {ex.Message}", ex);
        }
    }

	private static async Task ExecuteTestApp(string exePath, string arguments, string workingDirectory, bool waitForExit, int timeoutSeconds)
	{
		try
		{
			var processStartInfo = new ProcessStartInfo
			{
				FileName = exePath,
				Arguments = arguments,
				WorkingDirectory = workingDirectory,
				UseShellExecute = false,
				CreateNoWindow = true
			};

			using var process = new Process { StartInfo = processStartInfo };

			process.Start();

			if (waitForExit)
			{
				var completed = await Task.Run(() => process.WaitForExit(timeoutSeconds * 1000));

				if (!completed)
				{
					process.Kill(true);
					throw new JobExecutionException($"Process timed out after {timeoutSeconds} seconds and was killed");
				}
			}
		}
		catch (Exception ex)
		{
			throw new JobExecutionException($"Failed to execute test application: {ex.Message}", ex);
		}
	}

	private AppRunnerParameters ExtractAppParameters(JobDataMap dataMap)
    { 
        var workingDirectory = GetWorkingDirectory(dataMap); 
        return new AppRunnerParameters
        {
            ExePath = GetExePath(dataMap, workingDirectory),
            Arguments = GetStringParameter(dataMap, "arguments", ""),
            WorkingDirectory = workingDirectory,
            WaitForExit = GetBooleanParameter(dataMap, "waitForExit", true),
            TimeoutSeconds = GetIntParameter(dataMap, "timeoutSeconds", 30)
        };
    }
    
    private string GetWorkingDirectory(JobDataMap dataMap)
    { 
        if (dataMap.ContainsKey("workingDirectory"))
        {
            var value = dataMap.GetString("workingDirectory");
            if (!string.IsNullOrEmpty(value))
                return value;
        } 
		return _appConfiguration.TestAppRunnerWorkingDirectory;
	}
    
    private string GetExePath(JobDataMap dataMap, string workingDirectory)
    { 
        if (dataMap.ContainsKey("exePath"))
        {
            var value = dataMap.GetString("exePath");
            if (!string.IsNullOrEmpty(value))
            {
                // If it's already a full path, use as-is
                if (Path.IsPathRooted(value))
                    return value;
                
                // Otherwise, combine with working directory
                return Path.Combine(workingDirectory, value);
            }
        }
        
        // default exe name
        return Path.Combine(workingDirectory, DefaultExeName); 
    }
    
    private string GetStringParameter(JobDataMap dataMap, string key, string defaultValue)
    {
        return dataMap.ContainsKey(key) ? dataMap.GetString(key) ?? defaultValue : defaultValue;
    }
    
    private bool GetBooleanParameter(JobDataMap dataMap, string key, bool defaultValue)
    {
        if (!dataMap.ContainsKey(key)) return defaultValue;
        
        var value = dataMap[key];
        
        // Handle different value types
        return value switch
        {
            bool boolValue => boolValue,
            string stringValue => bool.TryParse(stringValue, out var result) ? result : defaultValue,
            _ => bool.TryParse(value?.ToString(), out var result) ? result : defaultValue
        };
    }
    
    private int GetIntParameter(JobDataMap dataMap, string key, int defaultValue)
    {
        if (!dataMap.ContainsKey(key)) return defaultValue;
        
        var value = dataMap[key];
        
        // Handle different value types
        return value switch
        {
            int intValue => intValue,
            string stringValue => int.TryParse(stringValue, out var result) ? result : defaultValue,
            _ => int.TryParse(value?.ToString(), out var result) ? result : defaultValue
        };
    } 
}