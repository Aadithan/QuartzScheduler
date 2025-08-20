import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Tag, Typography, Space, message, Modal, Dropdown, MenuProps, Tabs, Tooltip, Input } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, MoreOutlined, ExclamationCircleOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchJobs, 
  deleteJob, 
  pauseJob, 
  resumeJob, 
  triggerJob, 
  fetchJobLogs,
  fetchRunningJobs,
  fetchExecutionLogs,
  fetchRunningJobsNew,

  Job 
} from '../store/slices/jobsSlice';
import { fetchSchedulerInfo } from '../store/slices/schedulerSlice';
import JobForm from '../components/JobForm';

const { Title } = Typography;
const { confirm } = Modal;

const Jobs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, executionLogs, runningJobsNew, loading, error, operationLoading } = useSelector((state: RootState) => state.jobs);
  const { schedulerInfo } = useSelector((state: RootState) => state.scheduler);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobDataVisible, setJobDataVisible] = useState(false);
  const [selectedJobData, setSelectedJobData] = useState<any>(null);
  const [selectedJobName, setSelectedJobName] = useState<string>('');
  const searchInput = useRef<any>(null);

  // Filter helper functions
  const getColumnSearchProps = (dataIndex: string, placeholder: string = 'Search') => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${placeholder}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const getUniqueValues = (data: any[], key: string) => {
    const values = Array.from(new Set(data.map(item => item[key]).filter(Boolean)));
    return values.map(value => ({ text: value, value }));
  };

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchJobLogs(undefined));
    dispatch(fetchRunningJobs());
    dispatch(fetchSchedulerInfo()); // Fetch scheduler info to validate state
    // Fetch execution logs directly
    dispatch(fetchExecutionLogs());
    dispatch(fetchRunningJobsNew());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleDelete = (job: Job) => {
    confirm({
      title: 'Delete Job',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete job "${job.jobName}" in group "${job.group}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        dispatch(deleteJob({ name: job.jobName, group: job.group }))
          .unwrap()
          .then(() => {
            message.success('Job deleted successfully');
          })
          .catch((error) => {
            message.error(`Failed to delete job: ${error}`);
          });
      },
    });
  };

  const handlePause = (job: Job) => {
    dispatch(pauseJob({ name: job.jobName, group: job.group }))
      .unwrap()
      .then(() => {
        message.success('Job paused successfully');
      })
      .catch((error) => {
        message.error(`Failed to pause job: ${error}`);
      });
  };

  const handleResume = (job: Job) => {
    dispatch(resumeJob({ name: job.jobName, group: job.group }))
      .unwrap()
      .then(() => {
        message.success('Job resumed successfully');
      })
      .catch((error) => {
        message.error(`Failed to resume job: ${error}`);
      });
  };

  const handleTrigger = (job: Job) => {
    // Check if scheduler is in standby mode
    if (schedulerInfo?.inStandbyMode) {
      message.error('Cannot trigger job: Scheduler is in standby mode. Please start the scheduler first.');
      return;
    }

    // Check if scheduler is not started
    if (!schedulerInfo?.isStarted) {
      message.error('Cannot trigger job: Scheduler is not started. Please start the scheduler first.');
      return;
    }

    dispatch(triggerJob({ name: job.jobName, group: job.group }))
      .unwrap()
      .then(() => {
        message.success('Job triggered successfully');
      })
      .catch((error) => {
        message.error(`Failed to trigger job: ${error}`);
      });
  };

  const handleRefresh = () => {
    dispatch(fetchJobs());
    dispatch(fetchSchedulerInfo()); // Refresh scheduler state
    if (activeTab === 'execution-logs') {
      dispatch(fetchJobLogs(undefined));
      dispatch(fetchExecutionLogs());
    }
    if (activeTab === 'running-jobs') {
      dispatch(fetchRunningJobs());
      dispatch(fetchRunningJobsNew());
    }

  };



  const handleViewJobData = (job: Job) => {
    setSelectedJobData({
      jobName: job.jobName,
      group: job.group,
      type: job.type,
      jobDataMap: job.jobDataMap || {}
    });
    setSelectedJobName(`${job.jobName} (${job.group})`);
    setJobDataVisible(true);
  };

  const handleCloseJobData = () => {
    setJobDataVisible(false);
    setSelectedJobData(null);
    setSelectedJobName('');
  };

  const handleCreateJob = () => {
    setEditingJob(undefined);
    setShowJobForm(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleCloseJobForm = () => {
    setShowJobForm(false);
    setEditingJob(undefined);
  };

  const handleJobFormSuccess = () => {
    // Refresh all data when a job is successfully created/updated
    dispatch(fetchJobs());
    dispatch(fetchJobLogs(undefined));
    dispatch(fetchRunningJobs());
    // Refresh execution logs and running jobs
    dispatch(fetchExecutionLogs());
    dispatch(fetchRunningJobsNew());
    message.success('Job list refreshed successfully!');
  };

  const getJobActions = (job: Job): MenuProps['items'] => {
    const isPaused = job.state === 'Paused';
    const deleteKey = `delete-${job.jobName}-${job.group}`;
    const pauseKey = `pause-${job.jobName}-${job.group}`;
    const resumeKey = `resume-${job.jobName}-${job.group}`;
    const triggerKey = `trigger-${job.jobName}-${job.group}`;
    
    // Check if scheduler is available for job operations
    const isSchedulerDown = schedulerInfo?.inStandbyMode || !schedulerInfo?.isStarted;

    return [
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined />,
        onClick: () => handleEditJob(job),
      },

      {
        key: 'trigger',
        label: isSchedulerDown ? 'Trigger Now (Scheduler Standby)' : 'Trigger Now',
        icon: <PlayCircleOutlined />,
        onClick: () => handleTrigger(job),
        disabled: operationLoading[triggerKey] || isSchedulerDown,
      },
      {
        key: isPaused ? 'resume' : 'pause',
        label: isPaused ? 'Resume' : 'Pause',
        icon: isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />,
        onClick: () => isPaused ? handleResume(job) : handlePause(job),
        disabled: operationLoading[pauseKey] || operationLoading[resumeKey] || isSchedulerDown,
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(job),
        disabled: operationLoading[deleteKey],
      },
    ];
  };

  const columns = [
    {
      title: 'Job Name',
      dataIndex: 'jobName',
      key: 'jobName',
      width: 200,
      ...getColumnSearchProps('jobName', 'job name'),
      render: (name: string) => (
        <div style={{ fontWeight: 'bold' }}>{name}</div>
      ),
    },
    {
      title: 'Group',
      dataIndex: 'group',
      key: 'group',
      width: 120,
      filters: getUniqueValues(jobs, 'group'),
      onFilter: (value: any, record: any) => record.group === value,
      render: (group: string) => (
        <Tag color="blue">{group}</Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      filters: getUniqueValues(jobs, 'type').map(item => ({
        text: item.text.split('.').pop()?.replace('Job', '') || item.text,
        value: item.value
      })),
      onFilter: (value: any, record: any) => record.type === value,
      render: (type: string) => {
        const shortType = type?.split('.').pop()?.replace('Job', '') || type;
        return <span title={type}>{shortType}</span>;
      },
    },
    {
      title: 'Class',
      dataIndex: 'type',
      key: 'class',
      width: 200,
      render: (type: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '11px' }} title={type}>
          {type}
        </span>
      ),
    },
    {
      title: 'Flags',
      key: 'flags',
      width: 120,
      render: (_: any, record: Job) => (
        <div style={{ display: 'flex', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          <Tooltip title={record.recovery ? "Requests Recovery" : "No Recovery"}>
            <span style={{ 
              color: record.recovery ? '#52c41a' : '#d9d9d9',
              cursor: 'pointer'
            }}>
              R
            </span>
          </Tooltip>
          <Tooltip title={record.concurrent ? "Allows Concurrent Execution" : "Disallows Concurrent Execution"}>
            <span style={{ 
              color: record.concurrent ? '#1890ff' : '#f5222d',
              cursor: 'pointer'
            }}>
              C
            </span>
          </Tooltip>
          <Tooltip title={record.persist ? "Persist Job Data After Execution" : "No Data Persistence"}>
            <span style={{ 
              color: record.persist ? '#722ed1' : '#d9d9d9',
              cursor: 'pointer'
            }}>
              P
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Job Data',
      key: 'jobData',
      width: 100,
      render: (_: any, record: Job) => {
        const hasJobData = record.jobDataMap && Object.keys(record.jobDataMap).length > 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasJobData ? (
              <>
                <Tag color="green">{Object.keys(record.jobDataMap || {}).length} params</Tag>
                <Button
                  size="small"
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewJobData(record)}
                />
              </>
            ) : (
              <Tag color="default">No data</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Last Fire Time',
      dataIndex: 'lastFireTime',
      key: 'lastFireTime',
      width: 150,
      render: (time: string) => time || '-',
    },
    {
      title: 'Next Fire Time',
      dataIndex: 'nextFireTime',
      key: 'nextFireTime',
      width: 150,
      render: (time: string) => time || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: Job) => (
        <Dropdown
          menu={{ items: getJobActions(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            size="small"
          />
        </Dropdown>
      ),
    },
  ];



  // Execution logs columns mapped to JOB_LOG_TABLE data
  const executionLogColumns = [
    {
      title: 'Job Name',
      dataIndex: 'database', // Maps to JOB_NAME from database
      key: 'database',
      width: 200,
      ...getColumnSearchProps('database', 'job name'),
    },
    {
      title: 'Trigger',
      dataIndex: 'triggerName', // Maps to TRIGGER_NAME from database
      key: 'triggerName',
      width: 180,
      filters: getUniqueValues(executionLogs.filter(log => log.triggerName), 'triggerName'),
      onFilter: (value: any, record: any) => record.triggerName === value,
    },
    {
      title: 'Started',
      dataIndex: 'started',
      key: 'started',
      width: 180,
      render: (time: string) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: 'Ended',
      dataIndex: 'ended',
      key: 'ended',
      width: 180,
      render: (time: string) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 120,
      render: (_: any, record: any) => {
        if (!record.started || !record.ended) return '-';
        const start = new Date(record.started);
        const end = new Date(record.ended);
        const totalSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Completed', value: 'Completed' },
        { text: 'Failed', value: 'Failed' },
        { text: 'Started', value: 'Started' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => {
        const color = {
          'Completed': 'success',
          'Failed': 'error',
          'Started': 'processing',
        }[status] || 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  // New Quartzmin-style running jobs columns
  const runningJobColumns = [
    {
      title: 'Job Name',
      dataIndex: 'jobName',
      key: 'jobName',
      width: 200,
      ...getColumnSearchProps('jobName', 'job name'),
      render: (name: string) => (
        <div style={{ fontWeight: 'bold' }}>{name}</div>
      ),
    },
    {
      title: 'Trigger',
      dataIndex: 'trigger',
      key: 'trigger',
      width: 200,
      filters: getUniqueValues(runningJobsNew.filter(job => job.trigger), 'trigger'),
      onFilter: (value: any, record: any) => record.trigger === value,
    },
    {
      title: 'Scheduled Fire Time',
      dataIndex: 'scheduledFireTime',
      key: 'scheduledFireTime',
      width: 180,
      render: (time: string) => time || '-',
    },
    {
      title: 'Actual Fire Time',
      dataIndex: 'actualFireTime',
      key: 'actualFireTime',
      width: 180,
    },
    {
      title: 'Duration',
      dataIndex: 'runTime',
      key: 'runTime',
      width: 120,
      render: (runTime: string) => {
        // Backend already provides duration in HH:MM:SS format
        return runTime || '00:00:00';
      },
    },
  ];

  const tabItems = [
    {
      key: 'jobs',
      label: 'Scheduled Jobs',
      children: (
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey={(record) => `${record.jobName}-${record.group}`}
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} jobs`,
          }}
          scroll={{ x: 1200 }}
        />
      ),
    },
    {
      key: 'execution-logs',
      label: 'Execution Logs',
      children: (
        <Table
          columns={executionLogColumns}
          dataSource={executionLogs}
          rowKey={(record) => `execution-${record.id}`}
          loading={operationLoading['fetchExecutionLogs']}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} execution logs`,
          }}
          scroll={{ x: 1200 }}
        />
      ),
    },
    {
      key: 'running-jobs',
      label: `Running Jobs (${runningJobsNew.length})`,
      children: (
        <Table
          columns={runningJobColumns}
          dataSource={runningJobsNew}
          rowKey={(record) => `running-${record.jobName}-${record.trigger}-${record.actualFireTime}-${record.scheduledFireTime}`}
          loading={operationLoading['fetchRunningJobsNew']}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} running jobs`,
          }}
          scroll={{ x: 1200 }}
        />
      ),
    },

  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Job Management</Title>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          {activeTab === 'jobs' && (
            <Button type="primary" onClick={handleCreateJob}>
              Create Job
            </Button>
          )}
        </Space>
      </div>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
      />
      
      <JobForm
        visible={showJobForm}
        onCancel={handleCloseJobForm}
        editingJob={editingJob}
        onSuccess={handleJobFormSuccess}
      />

      <Modal
        title={`Job Data - ${selectedJobName}`}
        open={jobDataVisible}
        onCancel={handleCloseJobData}
        footer={[
          <Button key="close" onClick={handleCloseJobData}>
            Close
          </Button>
        ]}
        width={800}
      >
        <div style={{ maxHeight: '500px', overflow: 'auto' }}>
          {selectedJobData?.jobDataMap && Object.keys(selectedJobData.jobDataMap).length > 0 ? (
            <div>
              <h4>Job Data Map:</h4>
              <pre style={{ 
                backgroundColor: '#f6f8fa', 
                padding: '16px', 
                borderRadius: '6px', 
                fontSize: '12px',
                lineHeight: '1.5',
                margin: 0
              }}>
                {JSON.stringify(selectedJobData.jobDataMap, null, 2)}
              </pre>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              padding: '40px',
              backgroundColor: '#f6f8fa',
              borderRadius: '6px'
            }}>
              <p>No job data parameters configured for this job.</p>
              <p>Job data parameters can be added when creating or editing the job.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Jobs;
