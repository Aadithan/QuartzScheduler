# ReportScheduler API Documentation

This document describes the new APIs created for the ReportScheduler project to manage Quartz.NET jobs, triggers, executions, and scheduler operations.

## Authentication

All APIs require authentication and authorization. The APIs use Azure AD authentication with the following attributes:
- `[Authorize]` - Requires authentication
- `[RequiredScope(RequiredScopesConfigurationKey = "AzureAd:Scopes")]` - Requires specific Azure AD scopes

## Base URL

All APIs are prefixed with `/api/` and follow RESTful conventions.

## Controllers

### 1. CalendarsController (`/api/calendars`)

Manages Quartz.NET calendars.

#### GET `/api/calendars`
- **Description**: Get all calendars
- **Response**: Array of `CalendarListItem` objects

#### GET `/api/calendars/{name}`
- **Description**: Get a specific calendar by name
- **Parameters**: 
  - `name`: Calendar name
- **Response**: `CalendarViewModel` object

#### POST `/api/calendars`
- **Description**: Create a new calendar
- **Body**: `CalendarViewModel` object
- **Response**: 201 Created with calendar details

#### PUT `/api/calendars/{name}`
- **Description**: Update an existing calendar
- **Parameters**: 
  - `name`: Calendar name
- **Body**: `CalendarViewModel` object
- **Response**: 200 OK with updated calendar

#### DELETE `/api/calendars/{name}`
- **Description**: Delete a calendar
- **Parameters**: 
  - `name`: Calendar name
- **Response**: 204 No Content

### 2. SchedulerController (`/api/scheduler`)

Manages the Quartz.NET scheduler operations.

#### GET `/api/scheduler`
- **Description**: Get scheduler information and statistics
- **Response**: `SchedulerInfo` object with scheduler details, job/trigger counts, and group information

#### POST `/api/scheduler/start`
- **Description**: Start the scheduler
- **Response**: 204 No Content

#### POST `/api/scheduler/shutdown`
- **Description**: Shutdown the scheduler
- **Response**: 204 No Content

#### POST `/api/scheduler/standby`
- **Description**: Put scheduler in standby mode
- **Response**: 204 No Content

#### POST `/api/scheduler/pause-all`
- **Description**: Pause all jobs and triggers
- **Response**: 204 No Content

#### POST `/api/scheduler/resume-all`
- **Description**: Resume all jobs and triggers
- **Response**: 204 No Content

#### POST `/api/scheduler/clear`
- **Description**: Clear all jobs and triggers
- **Response**: 204 No Content

### 2. JobsController (`/api/jobs`)

Manages Quartz.NET jobs.

#### GET `/api/jobs`
- **Description**: Get all jobs
- **Response**: Array of `JobListItem` objects

#### GET `/api/jobs/{name}/{group}`
- **Description**: Get specific job details
- **Parameters**: 
  - `name`: Job name
  - `group`: Job group
- **Response**: `JobPropertiesViewModel` object

#### POST `/api/jobs`
- **Description**: Create a new job
- **Body**: `JobPropertiesViewModel` object
- **Response**: 201 Created with job details

#### PUT `/api/jobs/{name}/{group}`
- **Description**: Update an existing job
- **Parameters**: 
  - `name`: Job name
  - `group`: Job group
- **Body**: `JobPropertiesViewModel` object
- **Response**: 204 No Content

#### DELETE `/api/jobs/{name}/{group}`
- **Description**: Delete a job
- **Parameters**: 
  - `name`: Job name
  - `group`: Job group
- **Response**: 204 No Content

#### POST `/api/jobs/{name}/{group}/pause`
- **Description**: Pause a specific job
- **Parameters**: 
  - `name`: Job name
  - `group`: Job group
- **Response**: 204 No Content

#### POST `/api/jobs/{name}/{group}/resume`
- **Description**: Resume a specific job
- **Parameters**: 
  - `name`: Job name
  - `group`: Job group
- **Response**: 204 No Content

#### POST `/api/jobs/{name}/{group}/trigger`
- **Description**: Trigger a job immediately
- **Parameters**: 
  - `name`: Job name
  - `group`: Job group
- **Body**: Optional `Dictionary<string, object>` for job data map
- **Response**: 204 No Content

### 3. TriggersController (`/api/triggers`)

Manages Quartz.NET triggers.

#### GET `/api/triggers`
- **Description**: Get all triggers
- **Response**: Array of `TriggerListItem` objects

#### GET `/api/triggers/{name}/{group}`
- **Description**: Get specific trigger details
- **Parameters**: 
  - `name`: Trigger name
  - `group`: Trigger group
- **Response**: `TriggerPropertiesViewModel` object

#### POST `/api/triggers`
- **Description**: Create a new trigger
- **Body**: `TriggerPropertiesViewModel` object
- **Response**: 201 Created with trigger details

#### PUT `/api/triggers/{name}/{group}`
- **Description**: Update an existing trigger
- **Parameters**: 
  - `name`: Trigger name
  - `group`: Trigger group
- **Body**: `TriggerPropertiesViewModel` object
- **Response**: 204 No Content

#### DELETE `/api/triggers/{name}/{group}`
- **Description**: Delete a trigger
- **Parameters**: 
  - `name`: Trigger name
  - `group`: Trigger group
- **Response**: 204 No Content

#### POST `/api/triggers/{name}/{group}/pause`
- **Description**: Pause a specific trigger
- **Parameters**: 
  - `name`: Trigger name
  - `group`: Trigger group
- **Response**: 204 No Content

#### POST `/api/triggers/{name}/{group}/resume`
- **Description**: Resume a specific trigger
- **Parameters**: 
  - `name`: Trigger name
  - `group`: Trigger group
- **Response**: 204 No Content

#### POST `/api/triggers/cron/validate`
- **Description**: Validate a cron expression
- **Body**: Cron expression string
- **Response**: Object with success status and next 10 fire times

### 4. ExecutionsController (`/api/executions`)

Manages currently executing jobs.

#### GET `/api/executions`
- **Description**: Get all currently executing jobs
- **Response**: Array of `ExecutionListItem` objects

#### GET `/api/executions/{id}`
- **Description**: Get specific execution details
- **Parameters**: 
  - `id`: Execution ID (FireInstanceId)
- **Response**: `ExecutionListItem` object

#### POST `/api/executions/{id}/interrupt`
- **Description**: Interrupt a running job execution
- **Parameters**: 
  - `id`: Execution ID (FireInstanceId)
- **Response**: 204 No Content

#### GET `/api/executions/job/{jobName}/{jobGroup}`
- **Description**: Get executions for a specific job
- **Parameters**: 
  - `jobName`: Job name
  - `jobGroup`: Job group
- **Response**: Array of `ExecutionListItem` objects

### 5. HistoryController (`/api/history`)

Provides execution history and statistics.

#### GET `/api/history`
- **Description**: Get basic execution history
- **Response**: Object with execution statistics

#### GET `/api/history/job/{jobName}/{jobGroup}`
- **Description**: Get history for a specific job
- **Parameters**: 
  - `jobName`: Job name
  - `jobGroup`: Job group
- **Response**: Object with job history and trigger information

#### GET `/api/history/trigger/{triggerName}/{triggerGroup}`
- **Description**: Get history for a specific trigger
- **Parameters**: 
  - `triggerName`: Trigger name
  - `triggerGroup`: Trigger group
- **Response**: Object with trigger history

#### GET `/api/history/statistics`
- **Description**: Get scheduler statistics
- **Response**: Object with scheduler statistics

## Data Models

### JobListItem
```json
{
  "jobName": "string",
  "group": "string",
  "type": "string",
  "description": "string",
  "recovery": "boolean",
  "persist": "boolean",
  "concurrent": "boolean",
  "lastFireTime": "string",
  "nextFireTime": "string",
  "state": "string"
}
```

### TriggerListItem
```json
{
  "jobKey": "string",
  "jobName": "string",
  "jobGroup": "string",
  "triggerName": "string",
  "triggerGroup": "string",
  "isPaused": "boolean",
  "type": "string",
  "clrType": "string",
  "description": "string",
  "startTime": "string",
  "endTime": "string",
  "lastFireTime": "string",
  "nextFireTime": "string",
  "scheduleDescription": "string",
  "state": "string"
}
```

### ExecutionListItem
```json
{
  "id": "string",
  "jobGroup": "string",
  "jobName": "string",
  "triggerGroup": "string",
  "triggerName": "string",
  "scheduledFireTime": "string",
  "actualFireTime": "string",
  "runTime": "string",
  "state": "string"
}
```

### SchedulerInfo
```json
{
  "name": "string",
  "instanceId": "string",
  "type": "string",
  "isStarted": "boolean",
  "isShutdown": "boolean",
  "inStandbyMode": "boolean",
  "runningSince": "string",
  "jobsCount": "number",
  "triggerCount": "number",
  "executingJobs": "number",
  "failedJobs": "number",
  "executedJobs": "number",
  "machineName": "string",
  "application": "string",
  "jobGroups": "array",
  "triggerGroups": "array"
}
```

### CalendarListItem
```json
{
  "name": "string",
  "description": "string",
  "type": "string"
}
```

### CalendarViewModel
```json
{
  "name": "string",
  "type": "string",
  "description": "string",
  "timeZone": "string",
  "cronExpression": "string",
  "invertTimeRange": "boolean",
  "startingTime": "string",
  "endingTime": "string",
  "days": ["string"],
  "dates": ["string"],
  "daysExcluded": ["boolean"]
}
```

## Error Handling

All APIs return appropriate HTTP status codes:
- `200 OK`: Successful GET operations
- `201 Created`: Successful POST operations that create resources
- `204 No Content`: Successful operations that don't return content
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

Error responses include:
- `detail`: Error message
- `title`: Error title
- `statusCode`: HTTP status code

## Logging

All APIs use standard .NET ILogger for error tracking and debugging.

## Notes

1. **History Tracking**: The current implementation provides basic history. For full execution history tracking, consider implementing a custom job listener or using Quartz's execution history plugin.

2. **State Management**: Some state information (like pause states for groups) may require additional implementation depending on your Quartz configuration.

3. **Job Data Maps**: The trigger job API supports passing job data maps for immediate job execution.

4. **Cron Validation**: The cron validation endpoint helps validate cron expressions and shows the next 10 fire times.

5. **Authentication**: All APIs require Azure AD authentication and proper scopes configuration. 