
using Microsoft.AspNetCore.Mvc;
using Quartz;
using Quartz.Impl.Matchers;
using QuartzScheduler.Server.Models;

namespace QuartzScheduler.Server.Controllers
{ 
        [ApiController]
    [Route("api/[controller]")]
    public class SchedulerController : ControllerBase
    {
        private readonly IScheduler _scheduler;
        private readonly ILogger<SchedulerController> _logger;

        public SchedulerController(IScheduler scheduler, ILogger<SchedulerController> logger)
        {
            _scheduler = scheduler;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetInfo()
        {
            try
            {
                // Always return basic scheduler state info, even when shutdown
                var schedulerInfo = new SchedulerInfo
                {
                    IsStarted = _scheduler.IsStarted,
                    IsShutdown = _scheduler.IsShutdown,
                    InStandbyMode = _scheduler.InStandbyMode,
                    MachineName = Environment.MachineName,
                    Application = "QuartzScheduler"
                };

                // Only try to get detailed info if scheduler is started (not shutdown or in standby)
                if (_scheduler.IsStarted && !_scheduler.InStandbyMode)
                {
                    try
                    {
                        var metadata = await _scheduler.GetMetaData();
                        var jobKeys = await _scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup());
                        var triggerKeys = await _scheduler.GetTriggerKeys(GroupMatcher<TriggerKey>.AnyGroup());
                        var currentlyExecutingJobs = await _scheduler.GetCurrentlyExecutingJobs();

                        // Update with detailed info
                        schedulerInfo.Name = metadata.SchedulerName;
                        schedulerInfo.InstanceId = metadata.SchedulerInstanceId;
                        schedulerInfo.Type = metadata.SchedulerType.Name;
                        schedulerInfo.RunningSince = metadata.RunningSince?.UtcDateTime;
                        schedulerInfo.JobsCount = jobKeys?.Count ?? 0;
                        schedulerInfo.TriggerCount = triggerKeys?.Count ?? 0;
                        schedulerInfo.ExecutingJobs = currentlyExecutingJobs?.Count ?? 0;
                        schedulerInfo.ExecutedJobs = metadata.NumberOfJobsExecuted;

                        // Process job groups
                        if (jobKeys != null)
                        {
                            var jobGroups = jobKeys.GroupBy(x => x.Group);
                            foreach (var group in jobGroups)
                            {
                                bool isPaused = false;
                                try
                                {
                                    isPaused = await _scheduler.IsJobGroupPaused(group.Key);
                                }
                                catch (NotImplementedException)
                                {
                                    // Method not implemented in this scheduler, default to false
                                    isPaused = false;
                                }
                                
                                schedulerInfo.JobGroups.Add(new GroupInfo
                                {
                                    Name = group.Key,
                                    Count = group.Count(),
                                    IsPaused = isPaused
                                });
                            }
                        }

                        // Process trigger groups
                        if (triggerKeys != null && triggerKeys.Any())
                        {
                            _logger.LogInformation($"Found {triggerKeys.Count()} trigger keys");
                            var triggerGroups = triggerKeys.GroupBy(x => x.Group);
                            foreach (var group in triggerGroups)
                            {
                                _logger.LogInformation($"Processing trigger group: {group.Key} with {group.Count()} triggers");
                                bool isPaused = false;
                                try
                                {
                                    isPaused = await _scheduler.IsTriggerGroupPaused(group.Key);
                                }
                                catch (NotImplementedException ex)
                                {
                                    // Method not implemented in this scheduler, default to false
                                    _logger.LogWarning($"IsTriggerGroupPaused not implemented for group {group.Key}: {ex.Message}");
                                    isPaused = false;
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex, $"Error checking if trigger group {group.Key} is paused");
                                    isPaused = false;
                                }
                                
                                schedulerInfo.TriggerGroups.Add(new GroupInfo
                                {
                                    Name = group.Key,
                                    Count = group.Count(),
                                    IsPaused = isPaused
                                });
                            }
                        }
                        else
                        {
                            _logger.LogWarning("No trigger keys found or triggerKeys is null");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get detailed scheduler info (scheduler may be shutting down), returning basic info");
                        // Continue with basic info only
                    }
                }
                else
                {
                    // Scheduler is in standby or shutdown - provide minimal safe defaults
                    var stateDescription = _scheduler.IsShutdown ? "Shutdown" : 
                                         _scheduler.InStandbyMode ? "Standby" : "Stopped";
                    schedulerInfo.Name = $"QuartzScheduler ({stateDescription})";
                    schedulerInfo.InstanceId = stateDescription.ToLower();
                    schedulerInfo.Type = stateDescription;
                    schedulerInfo.RunningSince = null;
                    schedulerInfo.JobsCount = 0;
                    schedulerInfo.TriggerCount = 0;
                    schedulerInfo.ExecutingJobs = 0;
                    schedulerInfo.ExecutedJobs = 0;
                    _logger.LogInformation($"Scheduler is {stateDescription}, returning minimal info");
                }

                return Ok(schedulerInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetSchedulerInfo exception");
                return Problem(detail: ex.Message, title: "GetSchedulerInfo exception", statusCode: 500);
            }
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start()
        {
            try
            {
                _logger.LogInformation($"Scheduler State Before Start - IsStarted: {_scheduler.IsStarted}, IsShutdown: {_scheduler.IsShutdown}, InStandbyMode: {_scheduler.InStandbyMode}");
                
                if (_scheduler.IsShutdown)
                {
                    _logger.LogError("Cannot start scheduler: it has been shutdown. Please restart the application to get a new scheduler instance.");
                    return BadRequest("Scheduler is shutdown and cannot be restarted. Please restart the application to get a new scheduler instance.");
                }
                else if (!_scheduler.IsStarted || _scheduler.InStandbyMode)
                {
                    _logger.LogInformation("Starting/resuming scheduler...");
                    await _scheduler.Start();
                    _logger.LogInformation($"Scheduler started - New state: IsStarted: {_scheduler.IsStarted}, IsShutdown: {_scheduler.IsShutdown}, InStandbyMode: {_scheduler.InStandbyMode}");
                }
                else
                {
                    _logger.LogInformation("Scheduler is already started");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "StartScheduler exception");
                return Problem(detail: ex.Message, title: "StartScheduler exception", statusCode: 500);
            }
        }



        [HttpPost("standby")]
        public async Task<IActionResult> Standby()
        {
            try
            {
                _logger.LogInformation($"Scheduler State Before Standby - IsStarted: {_scheduler.IsStarted}, IsShutdown: {_scheduler.IsShutdown}, InStandbyMode: {_scheduler.InStandbyMode}");
                
                if (!_scheduler.InStandbyMode)
                {
                    _logger.LogInformation("Putting scheduler in standby mode...");
                    await _scheduler.Standby();
                    _logger.LogInformation($"Scheduler standby completed - New state: IsStarted: {_scheduler.IsStarted}, IsShutdown: {_scheduler.IsShutdown}, InStandbyMode: {_scheduler.InStandbyMode}");
                }
                else
                {
                    _logger.LogInformation("Scheduler is already in standby mode");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "StandbyScheduler exception");
                return Problem(detail: ex.Message, title: "StandbyScheduler exception", statusCode: 500);
            }
        }

        [HttpPost("pause-all")]
        public async Task<IActionResult> PauseAll()
        {
            try
            {
                await _scheduler.PauseAll();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PauseAllScheduler exception");
                return Problem(detail: ex.Message, title: "PauseAllScheduler exception", statusCode: 500);
            }
        }

        [HttpPost("resume-all")]
        public async Task<IActionResult> ResumeAll()
        {
            try
            {
                await _scheduler.ResumeAll();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ResumeAllScheduler exception");
                return Problem(detail: ex.Message, title: "ResumeAllScheduler exception", statusCode: 500);
            }
        }

        [HttpPost("clear")]
        public async Task<IActionResult> Clear()
        {
            try
            {
                await _scheduler.Clear();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ClearScheduler exception");
                return Problem(detail: ex.Message, title: "ClearScheduler exception", statusCode: 500);
            }
        }

        [HttpPost("job-groups/{groupName}/pause")]
        public async Task<IActionResult> PauseJobGroup(string groupName)
        {
            try
            {
                await _scheduler.PauseJobs(GroupMatcher<JobKey>.GroupEquals(groupName));
                return Ok(new { Message = $"Job group '{groupName}' paused successfully", GroupName = groupName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PauseJobGroup {GroupName} exception", groupName);
                return Problem(detail: ex.Message, title: "PauseJobGroup exception", statusCode: 500);
            }
        }

        [HttpPost("job-groups/{groupName}/resume")]
        public async Task<IActionResult> ResumeJobGroup(string groupName)
        {
            try
            {
                await _scheduler.ResumeJobs(GroupMatcher<JobKey>.GroupEquals(groupName));
                return Ok(new { Message = $"Job group '{groupName}' resumed successfully", GroupName = groupName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ResumeJobGroup {GroupName} exception", groupName);
                return Problem(detail: ex.Message, title: "ResumeJobGroup exception", statusCode: 500);
            }
        }

        [HttpPost("trigger-groups/{groupName}/pause")]
        public async Task<IActionResult> PauseTriggerGroup(string groupName)
        {
            try
            {
                await _scheduler.PauseTriggers(GroupMatcher<TriggerKey>.GroupEquals(groupName));
                return Ok(new { Message = $"Trigger group '{groupName}' paused successfully", GroupName = groupName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PauseTriggerGroup {GroupName} exception", groupName);
                return Problem(detail: ex.Message, title: "PauseTriggerGroup exception", statusCode: 500);
            }
        }

        [HttpPost("trigger-groups/{groupName}/resume")]
        public async Task<IActionResult> ResumeTriggerGroup(string groupName)
        {
            try
            {
                await _scheduler.ResumeTriggers(GroupMatcher<TriggerKey>.GroupEquals(groupName));
                return Ok(new { Message = $"Trigger group '{groupName}' resumed successfully", GroupName = groupName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ResumeTriggerGroup {GroupName} exception", groupName);
                return Problem(detail: ex.Message, title: "ResumeTriggerGroup exception", statusCode: 500);
            }
        }
    }
} 