

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using MySql.Data.MySqlClient;
using Quartz;
using Quartz.AspNetCore;
using Quartz.Impl.AdoJobStore.Common;
using Quartz.Job;
using QuartzScheduler.Server.Listeners;
using QuartzScheduler.Server.Models;
using System.Net;
using System.Security.Authentication;

using Constants = QuartzScheduler.Server.Models.Constants;

namespace QuartzScheduler.Server;

public static class Program
{
	public static async Task Main(string[] args)
	{
		// Configure to run as a Windows service
		var webAppOptions = new WebApplicationOptions
		{
			Args = args,
			ContentRootPath = AppContext.BaseDirectory,
			ApplicationName = System.Diagnostics.Process.GetCurrentProcess().ProcessName
		};
		var builder = WebApplication.CreateBuilder(webAppOptions);
		builder.Host.UseWindowsService();
		
		var appSettingsPath = AppContext.BaseDirectory + $"appsettings.{builder.Environment.EnvironmentName}.json";
		
		// Bind the AppConfiguration section
		var appConfiguration = new AppConfiguration();
		builder.Configuration.GetSection(AppConfiguration.AppConfigurationSectionName).Bind(appConfiguration);
		//Setting the environment name
		appConfiguration.Environment = builder.Environment.EnvironmentName;

		builder.Services.AddSingleton(appConfiguration);
		
			// Configure Kestrel
	ConfigureKestrel(builder, appConfiguration);

			// Authentication disabled
	// ConfigureAuthentication(builder);
	builder.Services.AddControllersWithViews(options =>
	{
		// Configure model validation
		options.ModelValidatorProviders.Clear();
	})
	.ConfigureApiBehaviorOptions(options =>
	{
		// Disable automatic model validation
		options.SuppressModelStateInvalidFilter = true;
	});
	builder.Services.AddEndpointsApiExplorer();

		ConfigureSwagger(builder);
		ConfigureQuartz(builder, appConfiguration);

		// Add CORS services
		builder.Services.AddCors();

		// Custom services removed - using only JobsController with Quartz scheduler

		var app = builder.Build();

		// Configure the HTTP request pipeline.
		//if (app.Environment.IsDevelopment())
		//{
		//	ConfigureSwaggerUI(app, builder);
		//}
		ConfigureSwaggerUi(app, builder);
		app.UseHttpsRedirection();
		app.UseStaticFiles();
		app.UseRouting();
		
		// CORS must be configured before Authentication and Authorization
		app.UseCors(cors => cors
			.AllowAnyMethod()
			.AllowAnyHeader()
			.SetIsOriginAllowed(_ => true)
			.AllowCredentials()
		);
		
		// Authentication and Authorization disabled
		// app.UseAuthentication();
		// app.UseAuthorization();
		app.MapControllers();
		
		await app.RunAsync();
	}

	// Removed EnsureBuiltInJobsExist - causing timing issues with DI
	// The Quartz configurator will handle built-in jobs properly

	private static void ConfigureAuthentication(WebApplicationBuilder builder)
	{
		builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
			.AddMicrosoftIdentityWebApi(jwtBearerOptions =>
				{
					builder.Configuration.Bind(Constants.AzureAdSectionName, jwtBearerOptions);
				},
				identityOptions =>
				{
					builder.Configuration.Bind(Constants.AzureAdSectionName, identityOptions);
				})
			.EnableTokenAcquisitionToCallDownstreamApi(options =>
			{
				builder.Configuration.Bind(Constants.AzureAdSectionName, options);
			})
			.AddInMemoryTokenCaches();
	}

	private static void ConfigureQuartz(WebApplicationBuilder builder, AppConfiguration appConfiguration)
	{
		DbProvider.RegisterDbMetadata("mysql-custom", new DbMetadata
		{
			AssemblyName = "MySql.Data",
			ConnectionType = typeof(MySqlConnection),
			CommandType = typeof(MySqlCommand),
			ParameterType = typeof(MySqlParameter),
			ParameterDbType = typeof(MySqlDbType),
			ParameterDbTypePropertyName = "MySqlDbType",
			ParameterNamePrefix = "@",
			ExceptionType = typeof(MySqlException),
			BindByName = true
		});

		builder.Services.AddQuartz(configurator =>
		{
			configurator.AddJobListener<JobListener>(); 

			// Note: Built-in jobs will be checked and only added if they don't exist
			// This will be handled in the scheduler startup logic to preserve job data
			configurator.AddJob<Jobs.FileWriterJob>(jobConfigurator =>
			{
			    jobConfigurator.WithIdentity("FILE_WRITER", "DEFAULT");
			    jobConfigurator.StoreDurably();
			    jobConfigurator.PersistJobDataAfterExecution(true);
			    jobConfigurator.WithDescription("FileWriter job for writing content to files");
			});

			configurator.AddJob<Jobs.AppRunnerJob>(jobConfigurator =>
			{
				jobConfigurator.WithIdentity("APP_RUNNER", "DEFAULT");
				jobConfigurator.StoreDurably();
				jobConfigurator.PersistJobDataAfterExecution(true);
				jobConfigurator.WithDescription("AppRunner job for executing external applications");
			});

			configurator.UsePersistentStore(options =>
			{
				// Basic job store configuration
				options.Properties["quartz.jobStore.type"] = "Quartz.Impl.AdoJobStore.JobStoreTX, Quartz"; 
				options.Properties["quartz.jobStore.dataSource"] = "default";
				options.Properties["quartz.jobStore.tablePrefix"] = "QRTZ_";
				options.Properties["quartz.jobStore.driverDelegateType"] = "Quartz.Impl.AdoJobStore.MySQLDelegate, Quartz";
				options.Properties["quartz.dataSource.default.provider"] = "mysql-custom";
				options.Properties["quartz.dataSource.default.connectionString"] = $"{appConfiguration.ConnectionString}";
				options.Properties["quartz.jobStore.lockHandler.type"] = "Quartz.Impl.AdoJobStore.UpdateLockRowSemaphore, Quartz";
				// SERIALIZATION: Use System.Text.Json (BinaryFormatter is disabled in .NET 8+)
				options.Properties["quartz.serializer.type"] = "stj";
				
				// Thread pool configuration
				options.Properties["quartz.threadPool.threadCount"] = appConfiguration.QuartzThreadCount;
				
				// Scheduler instance configuration (CRITICAL for SCHEDULER_STATE table)
				options.Properties["quartz.scheduler.instanceName"] = "QuartzSchedulerInstance";
				options.Properties["quartz.scheduler.instanceId"] = Environment.MachineName + "-" + Environment.ProcessId;
				
				// Scheduler state management (enables QRTZ_SCHEDULER_STATE updates and FIRED_TRIGGERS)
				// Enable clustering for proper FIRED_TRIGGERS population and state management
				options.Properties["quartz.jobStore.clustered"] = "true";
				options.Properties["quartz.jobStore.clusterCheckinInterval"] = "20000"; // 20 seconds
				options.Properties["quartz.jobStore.maxMisfiresToHandleAtATime"] = "1";
				options.Properties["quartz.jobStore.misfireThreshold"] = "60000"; // 60 seconds
				
				// Plugin configuration
				options.Properties["quartz.plugin.triggHistory.type"] = "Quartz.Plugin.History.LoggingTriggerHistoryPlugin, Quartz.Plugins";
				options.Properties["quartz.plugin.triggHistory.triggerFiredMessage"] = "Trigger {1}.{0} fired job {6}.{5} at: {4:HH:mm:ss MM/dd/yyyy}";
				options.Properties["quartz.plugin.triggHistory.triggerCompleteMessage"] = "Trigger {1}.{0} completed firing job {6}.{5} at {4:HH:mm:ss MM/dd/yyyy} with resulting trigger instruction code: {9}";
				options.Properties["quartz.plugin.jobHistory.type"] = "Quartz.Plugin.History.LoggingJobHistoryPlugin, Quartz.Plugins";
			});
		});
		// Remove AddQuartzServer to prevent auto-restart behavior
		// builder.Services.AddQuartzServer(quartzOptions => { quartzOptions.WaitForJobsToComplete = true; });
		// We'll manage scheduler lifecycle manually like Quartzmin does
		
		// Register scheduler instance as singleton (Quartzmin approach)
		// Don't auto-start - let the API handle starting
		builder.Services.AddSingleton<IScheduler>(provider =>
		{
			var factory = provider.GetRequiredService<ISchedulerFactory>();
			return factory.GetScheduler().Result;
		});
	}



	private static void ConfigureKestrel(WebApplicationBuilder builder, AppConfiguration appConfiguration)
	{
		if (!builder.Environment.IsDevelopment())
		{
			builder.WebHost.ConfigureKestrel(options =>
			{
				// Listen on any IP and configured port with HTTPS
				options.Listen(IPAddress.Any, appConfiguration.Port,
					listenOptions =>
					{
						// Use default HTTPS configuration (will use development certificate in dev, or configure manually for production)
						listenOptions.UseHttps();
					});

				// Only support TLS version 1.2 and 1.3
				options.ConfigureHttpsDefaults(adapterOptions =>
				{
					adapterOptions.SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13;
				});
			}); 
		}
	}



	private static void ConfigureSwagger(WebApplicationBuilder builder)
	{
		builder.Services.AddSwaggerGen(genOptions =>
		{
			// Authentication removed - no security schemes needed
		});
	}

	private static void ConfigureSwaggerUi(WebApplication app, WebApplicationBuilder builder)
	{
		app.UseSwagger();
		app.UseSwaggerUI(uiOptions =>
		{
			// Authentication removed - no OAuth configuration needed
		});
	}
}