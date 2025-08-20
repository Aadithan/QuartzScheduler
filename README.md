# Quartz Scheduler

<p align="center">
  <img width="150" height="150" alt="QuartzIcon" src="https://github.com/user-attachments/assets/5dceea5b-0ac3-4a28-827d-997ab543798d" />
</p>

---

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![.NET](https://img.shields.io/badge/.NET-8.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)

**QuartzScheduler UI** is a modern, powerful web-based management interface for [Quartz.NET](https://www.quartz-scheduler.net) built with **ASP.NET Core** and **React**. 

Inspired by [Quartzmin](https://github.com/jlucansky/Quartzmin), this project provides a complete rewrite with modern technologies, offering an intuitive and feature-rich interface for managing your Quartz.NET job schedulers.

> [Quartz.NET](https://www.quartz-scheduler.net) is a full-featured, open source job scheduling system that can be used from smallest apps to large scale enterprise systems. This project serves as a frontend management tool for [Quartz Scheduler](https://github.com/quartz-scheduler/quartz).

![QuartzScheduler](https://github.com/user-attachments/assets/5d569b21-ee91-4adb-ab5f-d41a67aa7ada)

## ✨ Key Features

### 📋 Job Management
- ✅ **Create, Edit & Delete Jobs** - Full CRUD operations with intuitive forms
- ✅ **Job Data Map Editor** - Strongly typed parameter management (String, Number, Boolean)
- ✅ **Manual Job Triggering** - Execute jobs on-demand with custom parameters
- ✅ **Job State Management** - Pause, resume, and monitor job status
- ✅ **Real-time Execution Logs** - View detailed job execution history with duration tracking
- ✅ **Running Jobs Monitor** - See currently executing jobs in real-time

### ⏰ Trigger Management  
- ✅ **Multiple Trigger Types** - Cron, Simple, Daily Time Interval, Calendar Interval
- ✅ **Visual Cron Editor** - User-friendly cron expression builder with live preview
- ✅ **Timezone Support** - CST/12-hour format display with UTC backend storage
- ✅ **Calendar Integration** - Associate triggers with custom calendars
- ✅ **Misfire Handling** - Configure misfire instructions and priorities
- ✅ **Trigger State Controls** - Individual pause/resume/delete operations

### 📅 Calendar Management
- ✅ **Calendar Types** - Support for Annual, Cron, Daily, Holiday, Monthly, Weekly calendars  
- ✅ **Dynamic Calendar Editor** - Type-specific controls that adapt based on calendar type
- ✅ **Calendar Association** - Link calendars to triggers for advanced scheduling

### 🎛️ Scheduler Controls
- ✅ **Scheduler State Management** - Start, standby, pause all, resume all operations
- ✅ **Clustering Support** - Works with clustered Quartz.NET environments
- ✅ **Real-time Statistics** - Job counts, execution metrics, and system status
- ✅ **Job & Trigger Groups** - Organize and manage related jobs and triggers

### 💾 Data Persistence
- ✅ **Database Integration** - MySQL support with ADO.NET job store
- ✅ **Job Data Persistence** - Jobs survive application restarts
- ✅ **Execution History** - Complete audit trail stored in database
- ✅ **FIRED_TRIGGERS Tracking** - Monitor trigger firing in clustered environments

### 🎨 Modern UI/UX
- ✅ **React 18 + TypeScript** - Modern, type-safe frontend
- ✅ **Ant Design Components** - Professional, accessible UI components  
- ✅ **Redux Toolkit** - Predictable state management
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Advanced Filtering** - Search and filter across all data grids
- ✅ **Real-time Updates** - Live data refresh and notifications

## 🏗️ Technology Stack

### Backend
- **ASP.NET Core 8.0** - Modern web API framework
- **Quartz.NET 3.x** - Job scheduling engine  
- **MySQL** - Database for job persistence
- **Dapper** - Lightweight ORM for data access
- **System.Text.Json** - JSON serialization

### Frontend  
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Ant Design** - Enterprise UI components
- **Redux Toolkit** - State management
- **Day.js** - Date/time manipulation
- **Axios** - HTTP client

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm
- MySQL Server 8.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/QuartzScheduler.git
   cd QuartzScheduler
   ```

2. **Setup Database**
   ```sql
   CREATE DATABASE quartzscheduler;
   -- Import the provided mysql_schema.sql file
   mysql -u root -p quartzscheduler < src/QuartzScheduler.Server/mysql_schema.sql
   ```

3. **Configure Backend**
   ```bash
   cd src/QuartzScheduler.Server
   # Update appsettings.json with your MySQL connection string
   ```

4. **Configure Frontend**
   ```bash
   cd src/QuartzScheduler.Client
   npm install
   ```

5. **Run the Application**
   
   Terminal 1 (Backend):
   ```bash
   cd src/QuartzScheduler.Server
   dotnet run
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd src/QuartzScheduler.Client
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: https://localhost:7057

### Configuration

Update `appsettings.json` in the server project:

```json
{
  "ConnectionString": "server=localhost;database=quartzscheduler;uid=root;pwd=yourpassword;",
  "JobLogTableName": "JOB_LOG_TABLE",
  "Quartz": {
    "quartz.scheduler.instanceName": "QuartzScheduler",
    "quartz.scheduler.instanceId": "AUTO",
    "quartz.jobStore.type": "Quartz.Impl.AdoJobStore.JobStoreTX, Quartz",
    "quartz.jobStore.dataSource": "default",
    "quartz.jobStore.tablePrefix": "QRTZ_",
    "quartz.dataSource.default.connectionString": "your-connection-string",
    "quartz.dataSource.default.provider": "MySql",
    "quartz.serializer.type": "stj"
  }
}
```

## 📖 Usage

### Creating Jobs
1. Navigate to **Jobs** tab
2. Click **"Add Job"** button  
3. Fill in job details (name, group, class, description)
4. Configure job data map parameters
5. Set persistence and durability options
6. Click **"Create"**

### Setting Up Triggers
1. Go to **Triggers** tab
2. Click **"Add Trigger"** 
3. Select trigger type (Cron, Simple, etc.)
4. Configure schedule parameters
5. Set start/end dates in CST format
6. Associate with calendars if needed
7. Click **"Create"**

### Managing Scheduler
- Use the **Dashboard** to view overall system status
- **Start/Stop** scheduler from the control panel
- **Pause All/Resume All** for bulk operations
- Monitor **Job Groups** and **Trigger Groups**

### Viewing Execution History
- **Execution Logs** tab shows completed job runs
- **Running Jobs** tab displays currently executing jobs
- Filter by job name, trigger, status, or date range
- View execution duration in HH:MM:SS format

## 🗺️ Roadmap

### Long Term (v2.0)
- [ ] **Email Notifications** - Job failure/success email alerts 
- [ ] **Docker Support** - Containerized deployment options
- [ ] **Job Import/Export** - Backup and restore job configurations
- [ ] **Multi-Scheduler Support** - Manage multiple Quartz instances

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Reporting Issues
- Use the [GitHub Issues](https://github.com/yourusername/QuartzScheduler/issues) page
- Provide detailed steps to reproduce
- Include system information and logs
- Use issue templates when available

### Code Standards
- Follow existing code style and conventions
- Update README.md if needed

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Quartzmin](https://github.com/jlucansky/Quartzmin) - Original inspiration for this project
- [Quartz.NET](https://github.com/quartznet/quartznet) - The powerful job scheduling engine
- [Ant Design](https://ant.design/) - Beautiful and functional UI components
- [React](https://reactjs.org/) - The library for building user interfaces

## 🔗 Links

- [Quartz.NET Documentation](https://www.quartz-scheduler.net/documentation/)
- [Quartz Scheduler (Java)](https://github.com/quartz-scheduler/quartz) 
- [Quartzmin (Original)](https://github.com/jlucansky/Quartzmin)
- [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/)
- [React Documentation](https://reactjs.org/docs/)

---

**Made with ❤️ for the Quartz.NET community**
