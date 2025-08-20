using System.Data;
using Dapper;
using MySql.Data.MySqlClient;
using Quartz;
using QuartzScheduler.Server.Models;

namespace QuartzScheduler.Server.Listeners;

public class JobListener : IJobListener
{
	private readonly AppConfiguration _appConfiguration;
	private const string IdParameter = "id";
	private const string JobNameProperty = "jobname"; 
	private const string TriggerNameParameter = "triggername";
	private const string StartedParameter = "started";
	private const string EndedParameter = "ended";
	private const string StatusParameter = "status";
	private const string ResultParameter = "result";

	private const string StartedStatus = "Started";
	private const string CompletedStatus = "Completed";
	private const string FailedStatus = "Failed";

	public string Name => "JobListener";

	public JobListener(AppConfiguration appConfiguration)
	{
		_appConfiguration = appConfiguration;
	}

	public async Task JobToBeExecuted(IJobExecutionContext context, CancellationToken cancellationToken = new())
	{
		try
		{
			if (context.Recovering)
			{
				return;
			}

			await using var conn = new MySqlConnection(_appConfiguration.ConnectionString);
			await conn.OpenAsync(cancellationToken);

			// Get job ID safely - use from JobDataMap if available, otherwise generate
			var jobId = context.MergedJobDataMap.ContainsKey(Constants.JobIdProperty) 
				? context.MergedJobDataMap[Constants.JobIdProperty]?.ToString()
				: $"{context.JobDetail.Key.Group}-{context.JobDetail.Key.Name}-{context.FireInstanceId}";

			// Get job name safely - use from JobDataMap if available, otherwise use actual job name
			var jobName = context.MergedJobDataMap.ContainsKey(Constants.JobNameProperty)
				? context.MergedJobDataMap[Constants.JobNameProperty]?.ToString()
				: context.JobDetail.Key.Name;

			// Get trigger name from the context
			var triggerName = context.Trigger?.Key?.Name ?? "";

			var parms = new DynamicParameters();
			parms.Add(IdParameter, jobId, DbType.String, ParameterDirection.Input);
			parms.Add(JobNameProperty, jobName, DbType.String, ParameterDirection.Input); 
			parms.Add(TriggerNameParameter, triggerName, DbType.String, ParameterDirection.Input);
			parms.Add(StartedParameter, DateTime.UtcNow, DbType.DateTime, ParameterDirection.Input);
			parms.Add(EndedParameter, DateTime.UtcNow, DbType.DateTime, ParameterDirection.Input);
			parms.Add(StatusParameter, StartedStatus, DbType.String, ParameterDirection.Input);

			var sql = $"""
			INSERT INTO {_appConfiguration.JobLogTableName} (ID, JOB_NAME, TRIGGER_NAME, STARTED, ENDED, STATUS) 
			VALUES (@{IdParameter}, @{JobNameProperty}, @{TriggerNameParameter}, @{StartedParameter}, @{EndedParameter}, @{StatusParameter})
			""";

			await conn.ExecuteAsync(sql, parms);
		}
		catch (Exception e)
		{
			Console.WriteLine(e);
			throw;
		}

	}

	public async Task JobExecutionVetoed(IJobExecutionContext context, CancellationToken cancellationToken = new())
	{
		await Task.CompletedTask;
	}

	public async Task JobWasExecuted(IJobExecutionContext context, JobExecutionException? jobException, CancellationToken cancellationToken = new())
	{
		try
		{
			await using var conn = new MySqlConnection(_appConfiguration.ConnectionString);
			await conn.OpenAsync(cancellationToken);

			// Determine status - consider exception as well as result
			var status = jobException != null ? FailedStatus : context.Result switch
			{
				0 => CompletedStatus,
				> 0 => FailedStatus,
				_ => CompletedStatus // Default to completed for unexpected results
			};

			// Get job ID safely - use same logic as JobToBeExecuted
			var jobId = context.MergedJobDataMap.ContainsKey(Constants.JobIdProperty) 
				? context.MergedJobDataMap[Constants.JobIdProperty]?.ToString()
				: $"{context.JobDetail.Key.Group}-{context.JobDetail.Key.Name}-{context.FireInstanceId}";

			var parms = new DynamicParameters();
			parms.Add(IdParameter, jobId, DbType.String, ParameterDirection.Input);
			parms.Add(EndedParameter, DateTime.UtcNow, DbType.DateTime, ParameterDirection.Input);
			parms.Add(StatusParameter, status, DbType.String, ParameterDirection.Input);
			parms.Add(ResultParameter, context.Result, DbType.Int32, ParameterDirection.Input);

			var sql = $"""
			UPDATE {_appConfiguration.JobLogTableName}
			SET ENDED = @{EndedParameter},
			STATUS = @{StatusParameter},
			RESULT = @{ResultParameter}
			WHERE ID = @{IdParameter} 
			""";

			await conn.ExecuteAsync(sql, parms);
		}
		catch (Exception e)
		{
			Console.WriteLine(e);
			throw;
		}
	}
}