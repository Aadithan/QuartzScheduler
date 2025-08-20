
using Microsoft.AspNetCore.Mvc;
using Quartz;
using Quartz.Impl.Matchers;
using QuartzScheduler.Server.Models;
using QuartzScheduler.Server.Helpers.CronExpressionDescriptor;

namespace QuartzScheduler.Server.Controllers
{ 
    [ApiController]
    [Route("api/[controller]")] 
    public class TriggersController : ControllerBase
    {
        private readonly IScheduler _scheduler;
        private readonly ILogger<TriggersController> _logger;

        public TriggersController(IScheduler scheduler, ILogger<TriggersController> logger)
        {
            _scheduler = scheduler;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetTriggers()
        {
            try
            {

                var keys = (await _scheduler.GetTriggerKeys(GroupMatcher<TriggerKey>.AnyGroup())).OrderBy(x => x.ToString());
                var list = new List<TriggerListItem>();

                foreach (var key in keys)
                {
                    var trigger = await GetTrigger(_scheduler, key);
                    var state = await _scheduler.GetTriggerState(key);

                    var triggerType = GetTriggerType(trigger);
                    list.Add(new TriggerListItem
                    {
                        Type = triggerType,
                        ScheduleType = triggerType, // Set the same value for frontend compatibility
                        TriggerName = trigger.Key.Name,
                        TriggerGroup = trigger.Key.Group,
                        IsPaused = state == TriggerState.Paused,
                        JobKey = trigger.JobKey.ToString(),
                        JobGroup = trigger.JobKey.Group,
                        JobName = trigger.JobKey.Name,
                        ScheduleDescription = GetScheduleDescription(trigger),
                        StartTime = trigger.StartTimeUtc.UtcDateTime.ToString("yyyy-MM-dd HH:mm:ss"),
                        EndTime = trigger.FinalFireTimeUtc?.UtcDateTime.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                        LastFireTime = trigger.GetPreviousFireTimeUtc()?.UtcDateTime.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                        NextFireTime = trigger.GetNextFireTimeUtc()?.UtcDateTime.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                        ClrType = trigger.GetType().Name,
                        Description = trigger.Description,
                        State = state.ToString()
                    });
                }

                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetTriggers exception");
                return Problem(detail: ex.Message, title: "GetTriggers exception", statusCode: 500);
            }
        }

        [HttpGet("{name}/{group}")]
        public async Task<IActionResult> GetTrigger(string name, string group)
        {
            try
            {
                _logger.LogInformation($"GetTrigger called for: {name}/{group}");

                var key = new TriggerKey(name, group);
                _logger.LogInformation($"Created TriggerKey: {key}");
                
                var trigger = await GetTrigger(_scheduler, key);
                _logger.LogInformation($"Retrieved trigger: {trigger?.Key}");

                var model = new TriggerPropertiesViewModel
                {
                    IsNew = false,
                    TriggerName = key.Name,
                    TriggerGroup = key.Group,
                    Job = trigger.JobKey.ToString(),
                    Description = trigger.Description,
                    Priority = trigger.Priority,
                    StartTime = trigger.StartTimeUtc.UtcDateTime,
                    EndTime = trigger.FinalFireTimeUtc?.UtcDateTime,
                    CalendarName = trigger.CalendarName // Include associated calendar
                };

                // Set trigger-specific properties based on trigger type
                if (trigger is ICronTrigger cronTrigger)
                {
                    model.CronExpression = cronTrigger.CronExpressionString;
                }
                else if (trigger is ISimpleTrigger simpleTrigger)
                {
                    model.RepeatCount = simpleTrigger.RepeatCount;
                    model.RepeatInterval = simpleTrigger.RepeatInterval;
                }

                // Add job data map if available
                Console.WriteLine($"Trigger JobDataMap count: {trigger.JobDataMap?.Count ?? 0}"); // Debug log
                if (trigger.JobDataMap != null && trigger.JobDataMap.Count > 0)
                {
                    model.JobDataMap = trigger.JobDataMap.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
                    Console.WriteLine($"Returning JobDataMap with {model.JobDataMap.Count} items"); // Debug log
                    foreach (var kvp in model.JobDataMap)
                    {
                        Console.WriteLine($"  {kvp.Key}: {kvp.Value}"); // Debug log
                    }
                }
                else 
                {
                    Console.WriteLine("No JobDataMap found on trigger"); // Debug log
                }

                return Ok(model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetTrigger exception");
                return Problem(detail: ex.Message, title: "GetTrigger exception", statusCode: 500);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTrigger([FromBody] CreateTriggerRequest model)
        {
            try
            {

                
                // Parse job reference from "JobName.Group" format
                var jobParts = model.Job.Split('.');
                if (jobParts.Length != 2)
                    return BadRequest("Invalid job reference format. Expected: JobName.Group");
                
                var jobName = jobParts[0];
                var jobGroup = jobParts[1];
                var jobKey = new JobKey(jobName, jobGroup);
                var trigger = TriggerBuilder.Create()
                    .ForJob(jobKey)
                    .WithIdentity(model.TriggerName, model.TriggerGroup)
                    .WithDescription(model.Description)
                    .WithPriority(model.Priority ?? 5);

                // Add job data map if provided
                if (model.JobDataMap != null && model.JobDataMap.Count > 0)
                {
                    var jobDataMap = new JobDataMap();
                    foreach (var kvp in model.JobDataMap)
                    {
                        jobDataMap.Add(kvp.Key, kvp.Value);
                    }
                    trigger.UsingJobData(jobDataMap);
                }

                if (model.StartTime.HasValue)
                    trigger.StartAt(model.StartTime.Value);
                if (model.EndTime.HasValue)
                    trigger.EndAt(model.EndTime.Value);

                // Associate calendar if provided
                if (!string.IsNullOrEmpty(model.CalendarName))
                    trigger.ModifiedByCalendar(model.CalendarName);

                if (!string.IsNullOrEmpty(model.CronExpression))
                {
                    trigger.WithCronSchedule(model.CronExpression);
                }
                else if (model.RepeatCount.HasValue && !string.IsNullOrEmpty(model.RepeatInterval))
                {
                    // Parse RepeatInterval string to TimeSpan
                    if (TimeSpan.TryParse(model.RepeatInterval, out var interval))
                    {
                        trigger.WithSimpleSchedule(x => x
                            .WithRepeatCount(model.RepeatCount.Value)
                            .WithInterval(interval));
                    }
                    else
                    {
                        return BadRequest($"Invalid repeat interval format: {model.RepeatInterval}");
                    }
                }
                else
                {
                    trigger.WithSimpleSchedule(x => x.WithRepeatCount(0));
                }

                var builtTrigger = trigger.Build();
                await _scheduler.ScheduleJob(builtTrigger);

                return CreatedAtAction(nameof(GetTrigger), new { name = model.TriggerName, group = model.TriggerGroup }, builtTrigger);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateTrigger exception");
                return Problem(detail: ex.Message, title: "CreateTrigger exception", statusCode: 500);
            }
        }

        [HttpPut("{name}/{group}")]
        public async Task<IActionResult> UpdateTrigger(string name, string group, [FromBody] UpdateTriggerRequest model)
        {
            try
            {

                var oldKey = new TriggerKey(name, group);
                
                // Parse job reference from "JobName.Group" format
                var jobParts = model.Job.Split('.');
                if (jobParts.Length != 2)
                    return BadRequest("Invalid job reference format. Expected: JobName.Group");
                
                var jobName = jobParts[0];
                var jobGroup = jobParts[1];
                var jobKey = new JobKey(jobName, jobGroup);
                
                var trigger = TriggerBuilder.Create()
                    .ForJob(jobKey)
                    .WithIdentity(oldKey)
                    .WithDescription(model.Description)
                    .WithPriority(model.Priority ?? 5);

                // Add job data map if provided
                if (model.JobDataMap != null && model.JobDataMap.Count > 0)
                {
                    var jobDataMap = new JobDataMap();
                    foreach (var kvp in model.JobDataMap)
                    {
                        jobDataMap.Add(kvp.Key, kvp.Value);
                    }
                    trigger.UsingJobData(jobDataMap);
                }

                if (model.StartTime.HasValue)
                    trigger.StartAt(model.StartTime.Value);
                if (model.EndTime.HasValue)
                    trigger.EndAt(model.EndTime.Value);

                // Associate calendar if provided
                if (!string.IsNullOrEmpty(model.CalendarName))
                    trigger.ModifiedByCalendar(model.CalendarName);

                if (!string.IsNullOrEmpty(model.CronExpression))
                {
                    trigger.WithCronSchedule(model.CronExpression);
                }
                else if (model.RepeatCount.HasValue && !string.IsNullOrEmpty(model.RepeatInterval))
                {
                    // Parse RepeatInterval string to TimeSpan
                    if (TimeSpan.TryParse(model.RepeatInterval, out var interval))
                    {
                        trigger.WithSimpleSchedule(x => x
                            .WithRepeatCount(model.RepeatCount.Value)
                            .WithInterval(interval));
                    }
                    else
                    {
                        return BadRequest($"Invalid repeat interval format: {model.RepeatInterval}");
                    }
                }
                else
                {
                    trigger.WithSimpleSchedule(x => x.WithRepeatCount(0));
                }

                var builtTrigger = trigger.Build();
                await _scheduler.RescheduleJob(oldKey, builtTrigger);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateTrigger exception");
                return Problem(detail: ex.Message, title: "UpdateTrigger exception", statusCode: 500);
            }
        }

        [HttpDelete("{name}/{group}")]
        public async Task<IActionResult> DeleteTrigger(string name, string group)
        {
            try
            {

                var key = new TriggerKey(name, group);
                
                if (!await _scheduler.UnscheduleJob(key))
                    return NotFound($"Trigger {key} not found");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeleteTrigger exception");
                return Problem(detail: ex.Message, title: "DeleteTrigger exception", statusCode: 500);
            }
        }

        [HttpPost("{name}/{group}/pause")]
        public async Task<IActionResult> PauseTrigger(string name, string group)
        {
            try
            {

                var key = new TriggerKey(name, group);
                await _scheduler.PauseTrigger(key);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PauseTrigger exception");
                return Problem(detail: ex.Message, title: "PauseTrigger exception", statusCode: 500);
            }
        }

        [HttpPost("{name}/{group}/resume")]
        public async Task<IActionResult> ResumeTrigger(string name, string group)
        {
            try
            {

                var key = new TriggerKey(name, group);
                await _scheduler.ResumeTrigger(key);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ResumeTrigger exception");
                return Problem(detail: ex.Message, title: "ResumeTrigger exception", statusCode: 500);
            }
        } 

        [HttpPost("cron/validate")]
        public async Task<IActionResult> ValidateCronExpression([FromBody] string cronExpression)
        {
            try
            {
                if (string.IsNullOrEmpty(cronExpression))
                    return BadRequest("Cron expression cannot be empty");

                var expression = new CronExpression(cronExpression);
                var next = expression.GetNextValidTimeAfter(DateTime.UtcNow);
                var list = new List<string>();

                for (int i = 0; i < 10 && next != null; i++)
                {
                    list.Add(next.Value.UtcDateTime.ToString("yyyy-MM-dd HH:mm:ss"));
                    next = expression.GetNextValidTimeAfter(next.Value);
                }

                return Ok(new { Success = true, Dates = list });
            }
            catch (Exception ex)
            {
                return Ok(new { Success = false, Error = ex.Message });
            }
        }

        [HttpPost("cron/describe")]
        public IActionResult DescribeCron([FromBody] string cronExpression)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(cronExpression))
                    return Ok(new { Description = "", Next = new string[0] });

                // Get description using a simple pattern matching approach
                var description = GetCronDescription(cronExpression.Trim());

                // Get next fire times
                var nextDates = new List<string>();
                var cron = new CronExpression(cronExpression.Trim());
                var now = DateTimeOffset.Now;
                
                for (int i = 0; i < 10; i++)
                {
                    var next = cron.GetNextValidTimeAfter(now);
                    if (next == null) break;
                    
                    nextDates.Add(next.Value.ToString("yyyy-MM-dd HH:mm:ss"));
                    now = next.Value;
                }

                return Ok(new { Description = description, Next = nextDates });
            }
            catch (Exception ex)
            {
                return Ok(new { Description = "Invalid cron expression", Next = new string[0] });
            }
        }

        private async Task<ITrigger> GetTrigger(IScheduler _, TriggerKey key)
        {
            _logger.LogInformation($"GetTrigger helper called for key: {key}");
            var trigger = await _scheduler.GetTrigger(key);
            _logger.LogInformation($"Scheduler returned trigger: {trigger?.Key} (null={trigger == null})");
            if (trigger == null)
            {
                _logger.LogWarning($"Trigger {key} not found in scheduler");
                throw new InvalidOperationException("Trigger " + key + " not found");
            }
            return trigger;
        }

        private string GetTriggerType(ITrigger trigger)
        {
	        return trigger switch
	        {
		        ICronTrigger => "Cron",
		        ISimpleTrigger => "Simple",
		        IDailyTimeIntervalTrigger => "Daily",
		        ICalendarIntervalTrigger => "Calendar",
		        _ => "Unknown"
	        };
        }

        private string GetScheduleDescription(ITrigger trigger)
        {
            try
            {
	            return "";
            }
            catch
            {
                return trigger.GetType().Name;
            }
        }

        private string GetCronDescription(string cronExpression)
        {
            try
            {
                // Use the proper CronExpressionDescriptor
                return ExpressionDescriptor.GetDescription(cronExpression);
            }
            catch
            {
                return "Invalid cron expression";
            }
        }
    }
} 