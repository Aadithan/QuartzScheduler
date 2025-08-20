using Microsoft.AspNetCore.Mvc;
using Quartz;
using Quartz.Impl.Calendar;
using QuartzScheduler.Server.Models;

namespace QuartzScheduler.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarsController : ControllerBase
    {
        private readonly IScheduler _scheduler;

        public CalendarsController(IScheduler scheduler)
        {
            _scheduler = scheduler;
        }

        /// <summary>
        /// Get all calendars
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCalendars()
        {
            try
            {
                var calendarNames = await _scheduler.GetCalendarNames();

                var calendars = new List<CalendarListItem>();

                foreach (string name in calendarNames)
                {
                    var calendar = await _scheduler.GetCalendar(name);
                    calendars.Add(new CalendarListItem
                    {
                        Name = name,
                        Description = calendar?.Description ?? "",
                        Type = calendar?.GetType().Name ?? "Unknown"
                    });
                }

                return Ok(calendars);
            }
            catch (Exception ex)
            {

                return Problem("Failed to get calendars", statusCode: 500);
            }
        }

        /// <summary>
        /// Get a specific calendar by name
        /// </summary>
        [HttpGet("{name}")]
        public async Task<IActionResult> GetCalendar(string name)
        {
            try
            {
                var calendar = await _scheduler.GetCalendar(name);

                if (calendar == null)
                    return NotFound($"Calendar '{name}' not found");

                var calendarViewModel = ConvertToViewModel(calendar, name);
                return Ok(calendarViewModel);
            }
            catch (Exception ex)
            {

                return Problem("Failed to get calendar", statusCode: 500);
            }
        }

        /// <summary>
        /// Create a new calendar
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateCalendar([FromBody] CalendarViewModel calendarModel)
        {
            try
            {
                if (calendarModel == null)
                    return BadRequest("Calendar model is null");

                if (string.IsNullOrEmpty(calendarModel.Name))
                    return BadRequest("Calendar name is required");

                if (string.IsNullOrEmpty(calendarModel.Type))
                    return BadRequest("Calendar type is required");
                
                // Check if calendar already exists
                if (await _scheduler.GetCalendar(calendarModel.Name) != null)
                    return Conflict($"Calendar '{calendarModel.Name}' already exists");

                var calendar = CreateCalendarFromModel(calendarModel);
                await _scheduler.AddCalendar(calendarModel.Name, calendar, false, false);

                return CreatedAtAction(nameof(GetCalendar), new { name = calendarModel.Name }, calendarModel);
            }
            catch (Exception ex)
            {

                return Problem("Failed to create calendar", statusCode: 500);
            }
        }

        /// <summary>
        /// Update an existing calendar
        /// </summary>
        [HttpPut("{name}")]
        public async Task<IActionResult> UpdateCalendar(string name, [FromBody] CalendarViewModel calendarModel)
        {
            try
            {
                
                // Check if calendar exists
                if (await _scheduler.GetCalendar(name) == null)
                    return NotFound($"Calendar '{name}' not found");

                var calendar = CreateCalendarFromModel(calendarModel);
                await _scheduler.AddCalendar(name, calendar, true, false);

                return Ok(calendarModel);
            }
            catch (Exception ex)
            {

                return Problem("Failed to update calendar", statusCode: 500);
            }
        }

        /// <summary>
        /// Delete a calendar
        /// </summary>
        [HttpDelete("{name}")]
        public async Task<IActionResult> DeleteCalendar(string name)
        {
            try
            {
                
                if (!await _scheduler.DeleteCalendar(name))
                    return NotFound($"Calendar '{name}' not found or could not be deleted");

                return NoContent();
            }
            catch (Exception ex)
            {

                return Problem("Failed to delete calendar", statusCode: 500);
            }
        }

        private CalendarViewModel ConvertToViewModel(ICalendar calendar, string name)
        {
            var viewModel = new CalendarViewModel
            {
                Name = name,
                Description = calendar?.Description ?? "",
                Type = calendar?.GetType().Name ?? "Unknown",
                TimeZone = GetCalendarTimeZone(calendar)
            };

            // Convert specific calendar types
            if (calendar is CronCalendar cronCalendar)
            {
                viewModel.Type = "Cron";
                viewModel.CronExpression = cronCalendar.CronExpression?.CronExpressionString;
            }
            else if (calendar is DailyCalendar dailyCalendar)
            {
                viewModel.Type = "Daily";
                viewModel.StartingTime = dailyCalendar.RangeStartingTime?.ToString() ?? "00:00:00";
                viewModel.EndingTime = dailyCalendar.RangeEndingTime?.ToString() ?? "23:59:59";
                viewModel.InvertTimeRange = dailyCalendar.InvertTimeRange;
            }
            else if (calendar is HolidayCalendar holidayCalendar)
            {
                viewModel.Type = "Holiday";
                viewModel.Dates = holidayCalendar.ExcludedDates?.Select(d => d.ToString("yyyy-MM-dd")).ToList();
            }
            else if (calendar is MonthlyCalendar monthlyCalendar)
            {
                viewModel.Type = "Monthly";
                viewModel.DaysExcluded = monthlyCalendar.DaysExcluded;
            }
            else if (calendar is WeeklyCalendar weeklyCalendar)
            {
                viewModel.Type = "Weekly";
                viewModel.DaysExcluded = weeklyCalendar.DaysExcluded;
            }
            else if (calendar is AnnualCalendar annualCalendar)
            {
                viewModel.Type = "Annual";
                viewModel.Days = annualCalendar.DaysExcluded?.Select(d => d.ToString("MMMM d")).ToList();
            }
            else if (calendar is BaseCalendar)
            {
                viewModel.Type = "Base";
            }

            return viewModel;
        }

        private ICalendar CreateCalendarFromModel(CalendarViewModel model)
        {
            ICalendar calendar;
            TimeZoneInfo timeZone = TimeZoneInfo.Local;

            // Parse timezone
            if (!string.IsNullOrEmpty(model.TimeZone))
            {
                try
                {
                    timeZone = TimeZoneInfo.FindSystemTimeZoneById(model.TimeZone);
                }
                catch
                {
                    // Use local timezone if specified timezone is invalid
                    timeZone = TimeZoneInfo.Local;
                }
            }

            // Create specific calendar types based on model.Type
            switch (model.Type?.ToLower())
            {
                case "cron":
                case "croncalendar":
                    if (string.IsNullOrEmpty(model.CronExpression))
                        throw new ArgumentException("Cron expression is required for Cron calendar");
                    
                    calendar = new CronCalendar(model.CronExpression)
                    {
                        Description = model.Description ?? string.Empty
                    };
                    SetCalendarTimeZone(calendar, timeZone);
                    break;

                case "daily":
                case "dailycalendar":
                    var startTime = model.StartingTime ?? "00:00:00";
                    var endTime = model.EndingTime ?? "23:59:59";
                    
                    calendar = new DailyCalendar(startTime, endTime)
                    {
                        Description = model.Description ?? string.Empty,
                        InvertTimeRange = model.InvertTimeRange ?? false
                    };
                    SetCalendarTimeZone(calendar, timeZone);
                    break;

                case "weekly":
                case "weeklycalendar":
                    calendar = new WeeklyCalendar()
                    {
                        Description = model.Description ?? string.Empty
                    };
                    SetCalendarTimeZone(calendar, timeZone);
                    
                    if (model.DaysExcluded != null && model.DaysExcluded.Any(d => d))
                    {
                        for (int i = 0; i < model.DaysExcluded.Length && i < 7; i++)
                        {
                            if (model.DaysExcluded[i])
                            {
                                ((WeeklyCalendar)calendar).SetDayExcluded((DayOfWeek)i, true);
                            }
                        }
                    }
                    break;

                case "monthly":
                case "monthlycalendar":
                    calendar = new MonthlyCalendar()
                    {
                        Description = model.Description ?? string.Empty
                    };
                    SetCalendarTimeZone(calendar, timeZone);
                    
                    if (model.DaysExcluded != null && model.DaysExcluded.Any(d => d))
                    {
                        for (int i = 0; i < model.DaysExcluded.Length && i < 31; i++)
                        {
                            if (model.DaysExcluded[i])
                            {
                                ((MonthlyCalendar)calendar).SetDayExcluded(i + 1, true);
                            }
                        }
                    }
                    break;

                case "annual":
                case "annualcalendar":
                    calendar = new AnnualCalendar()
                    {
                        Description = model.Description ?? string.Empty
                    };
                    SetCalendarTimeZone(calendar, timeZone);
                    
                    if (model.Days != null && model.Days.Any())
                    {
                        foreach (var dayString in model.Days)
                        {
                            if (DateTime.TryParse(dayString, out var date))
                            {
                                ((AnnualCalendar)calendar).SetDayExcluded(date, true);
                            }
                        }
                    }
                    break;

                case "holiday":
                case "holidaycalendar":
                    calendar = new HolidayCalendar()
                    {
                        Description = model.Description ?? string.Empty
                    };
                    SetCalendarTimeZone(calendar, timeZone);
                    
                    if (model.Dates != null && model.Dates.Any())
                    {
                        foreach (var dateString in model.Dates)
                        {
                            if (DateTime.TryParse(dateString, out var date))
                            {
                                ((HolidayCalendar)calendar).AddExcludedDate(date);
                            }
                        }
                    }
                    break;

                default:
                    // Fallback to BaseCalendar
                    calendar = new BaseCalendar()
                    {
                        Description = model.Description ?? string.Empty
                    };
                    SetCalendarTimeZone(calendar, timeZone);
                    break;
            }

            return calendar;
        }

        private string GetCalendarTimeZone(ICalendar calendar)
        {
            try
            {
                // Try to get timezone from specific calendar types
                return calendar switch
                {
                    CronCalendar cronCalendar => cronCalendar.TimeZone?.Id ?? TimeZoneInfo.Local.Id,
                    DailyCalendar dailyCalendar => dailyCalendar.TimeZone?.Id ?? TimeZoneInfo.Local.Id,
                    WeeklyCalendar weeklyCalendar => weeklyCalendar.TimeZone?.Id ?? TimeZoneInfo.Local.Id,
                    MonthlyCalendar monthlyCalendar => monthlyCalendar.TimeZone?.Id ?? TimeZoneInfo.Local.Id,
                    AnnualCalendar annualCalendar => annualCalendar.TimeZone?.Id ?? TimeZoneInfo.Local.Id,
                    HolidayCalendar holidayCalendar => holidayCalendar.TimeZone?.Id ?? TimeZoneInfo.Local.Id,
                    BaseCalendar baseCalendar => baseCalendar.TimeZone?.Id ?? TimeZoneInfo.Local.Id,
                    _ => TimeZoneInfo.Local.Id
                };
            }
            catch
            {
                return TimeZoneInfo.Local.Id;
            }
        }

        private void SetCalendarTimeZone(ICalendar calendar, TimeZoneInfo timeZone)
        {
            try
            {
                // Set timezone on specific calendar types
                switch (calendar)
                {
                    case CronCalendar cronCalendar:
                        cronCalendar.TimeZone = timeZone;
                        break;
                    case DailyCalendar dailyCalendar:
                        dailyCalendar.TimeZone = timeZone;
                        break;
                    case WeeklyCalendar weeklyCalendar:
                        weeklyCalendar.TimeZone = timeZone;
                        break;
                    case MonthlyCalendar monthlyCalendar:
                        monthlyCalendar.TimeZone = timeZone;
                        break;
                    case AnnualCalendar annualCalendar:
                        annualCalendar.TimeZone = timeZone;
                        break;
                    case HolidayCalendar holidayCalendar:
                        holidayCalendar.TimeZone = timeZone;
                        break;
                    case BaseCalendar baseCalendar:
                        baseCalendar.TimeZone = timeZone;
                        break;
                }
            }
            catch
            {
                // Ignore if timezone setting fails
            }
        }
    } 