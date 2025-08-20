import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Button, Space, message, Modal } from 'antd';
import { 
  BarChartOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchJobs, fetchJobStatisticsNew } from '../store/slices/jobsSlice';
import {
  fetchSchedulerInfo,
  startScheduler,
  standbyScheduler,
  pauseAll,
  resumeAll,
  pauseJobGroup,
  resumeJobGroup,
  pauseTriggerGroup,
  resumeTriggerGroup
} from '../store/slices/schedulerSlice';

const { Text } = Typography;

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, jobStatisticsNew, loading } = useSelector((state: RootState) => state.jobs);
  const { schedulerInfo, loading: schedulerLoading } = useSelector((state: RootState) => state.scheduler);
  const { theme } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchJobStatisticsNew());
    dispatch(fetchSchedulerInfo());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchSchedulerInfo());
    message.success('Scheduler info refreshed');
  };

  const handleStartScheduler = () => {
    Modal.confirm({
      title: 'Start Scheduler',
      content: 'Are you sure you want to start the scheduler?',
      okText: 'Start',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk() {
        dispatch(startScheduler())
          .unwrap()
          .then(() => {
            message.success('Scheduler started successfully');
            dispatch(fetchSchedulerInfo()); // Refresh status
          })
          .catch((error) => {
            message.error(`Failed to start scheduler: ${error}`);
          });
      },
    });
  };

  const handleStandbyScheduler = () => {
    Modal.confirm({
      title: 'Put Scheduler in Standby',
      content: 'Are you sure you want to put the scheduler in standby mode? This will stop all job executions but can be resumed.',
      okText: 'Standby',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        dispatch(standbyScheduler())
          .unwrap()
          .then(() => {
            message.success('Scheduler put in standby mode successfully');
            dispatch(fetchSchedulerInfo()); // Refresh status
          })
          .catch((error) => {
            message.error(`Failed to put scheduler in standby: ${error}`);
          });
      },
    });
  };

  const handlePauseAll = () => {
    Modal.confirm({
      title: 'Pause All',
      content: 'Are you sure you want to pause all jobs and triggers?',
      okText: 'Pause All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        dispatch(pauseAll())
          .unwrap()
          .then(() => {
            message.success('All jobs and triggers paused');
            dispatch(fetchSchedulerInfo()); // Refresh status
          })
          .catch((error) => {
            message.error(`Failed to pause all: ${error}`);
          });
      },
    });
  };

  const handleResumeAll = () => {
    Modal.confirm({
      title: 'Resume All',
      content: 'Are you sure you want to resume all jobs and triggers?',
      okText: 'Resume All',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk() {
        dispatch(resumeAll())
          .unwrap()
          .then(() => {
            message.success('All jobs and triggers resumed');
            dispatch(fetchSchedulerInfo()); // Refresh status
          })
          .catch((error) => {
            message.error(`Failed to resume all: ${error}`);
          });
      },
    });
  };

  const handleJobGroupAction = (groupName: string, isPaused: boolean) => {
    const action = isPaused ? resumeJobGroup : pauseJobGroup;
    const actionText = isPaused ? 'resume' : 'pause';
    
    dispatch(action(groupName))
      .unwrap()
      .then(() => {
        // Button will change immediately due to optimistic update
        // Refresh status in background to ensure consistency
        dispatch(fetchSchedulerInfo());
      })
      .catch((error) => {
        message.error(`Failed to ${actionText} job group '${groupName}': ${error}`);
        // Refresh status in case of error to ensure correct state
        dispatch(fetchSchedulerInfo());
      });
  };

  const handleTriggerGroupAction = (groupName: string, isPaused: boolean) => {
    const action = isPaused ? resumeTriggerGroup : pauseTriggerGroup;
    const actionText = isPaused ? 'resume' : 'pause';
    
    dispatch(action(groupName))
      .unwrap()
      .then(() => {
        // Button will change immediately due to optimistic update
        // Refresh status in background to ensure consistency
        dispatch(fetchSchedulerInfo());
      })
      .catch((error) => {
        message.error(`Failed to ${actionText} trigger group '${groupName}': ${error}`);
        // Refresh status in case of error to ensure correct state
        dispatch(fetchSchedulerInfo());
      });
  };



  // Recent jobs table columns
  const recentJobColumns = [
    {
      title: 'Job Name',
      dataIndex: 'jobName',
      key: 'jobName',
      render: (name: string) => (
        <div style={{ fontWeight: 'bold' }}>{name}</div>
      ),
    },
    {
      title: 'Group',
      dataIndex: 'group',
      key: 'group',
      render: (group: string) => (
        <Tag color="blue">{group}</Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const shortType = type?.split('.').pop()?.replace('Job', '') || type;
        return <span title={type}>{shortType}</span>;
      },
    },
    {
      title: 'Next Fire Time',
      dataIndex: 'nextFireTime',
      key: 'nextFireTime',
      render: (time: string) => time || '-',
    },
  ];

  return (
    <div>
      {/* Job Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card style={{ 
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #162312 0%, #274916 100%)' 
              : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
            border: `1px solid ${theme === 'dark' ? '#389e0d' : '#b7eb8f'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <Statistic
              title="Completed Jobs"
              value={jobStatisticsNew.completedJobs}
              valueStyle={{ color: '#389e0d', fontWeight: 'bold', fontSize: '28px' }}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: '#389e0d', fontWeight: '500' }}>Successfully executed jobs</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ 
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #2a1215 0%, #431418 100%)' 
              : 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)',
            border: `1px solid ${theme === 'dark' ? '#cf1322' : '#ffa39e'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <Statistic
              title="Failed Jobs"
              value={jobStatisticsNew.failedJobs}
              valueStyle={{ color: '#cf1322', fontWeight: 'bold', fontSize: '28px' }}
              prefix={<ExclamationCircleOutlined style={{ color: '#f5222d' }} />}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: '#cf1322', fontWeight: '500' }}>Jobs that failed execution</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ 
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #111a2c 0%, #1d39c4 100%)' 
              : 'linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)',
            border: `1px solid ${theme === 'dark' ? '#1890ff' : '#91d5ff'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <Statistic
              title="Currently Running"
              value={jobStatisticsNew.currentlyRunningJobs}
              valueStyle={{ color: '#0958d9', fontWeight: 'bold', fontSize: '28px' }}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: '#0958d9', fontWeight: '500' }}>Jobs in progress</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ 
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #22075e 0%, #391085 100%)' 
              : 'linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)',
            border: `1px solid ${theme === 'dark' ? '#722ed1' : '#b37feb'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <Statistic
              title="Total Jobs"
              value={jobStatisticsNew.totalJobs}
              valueStyle={{ color: '#531dab', fontWeight: 'bold', fontSize: '28px' }}
              prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ color: '#531dab', fontWeight: '500' }}>Scheduled jobs count</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Scheduler Actions Panel */}
      <Card title="Actions" size="small" style={{ marginBottom: '24px' }}>
        <Row align="middle">
          {/* Status Information - Single Line */}
          <Col span={16}>
            <Space size="large" wrap>
              <span>
                <Text type="secondary">Status: </Text>
                <Tag color={schedulerInfo?.isStarted ? (schedulerInfo?.inStandbyMode ? 'orange' : 'green') : 'red'}>
                  {schedulerInfo?.isStarted ? (schedulerInfo?.inStandbyMode ? 'STANDBY' : 'RUNNING') : 'STOPPED'}
                </Tag>
              </span>
              {schedulerInfo?.runningSince && (
                <span>
                  <Text type="secondary">Since: </Text>
                  <Text>{new Date(schedulerInfo.runningSince).toLocaleString()}</Text>
                </span>
              )}
            </Space>
          </Col>
          
          {/* Action Buttons */}
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={handleStartScheduler}
                loading={schedulerLoading?.operation}
                disabled={schedulerInfo?.isStarted && !schedulerInfo?.inStandbyMode}
              >
                Start
              </Button>
              <Button
                danger
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={handleStandbyScheduler}
                loading={schedulerLoading?.operation}
                disabled={schedulerInfo?.inStandbyMode}
              >
                Standby
              </Button>
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={handlePauseAll}
                loading={schedulerLoading?.operation}
                style={{ color: '#faad14', borderColor: '#faad14' }}
              >
                Pause All
              </Button>
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={handleResumeAll}
                loading={schedulerLoading?.operation}
                style={{ color: '#52c41a', borderColor: '#52c41a' }}
              >
                Resume All
              </Button>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={schedulerLoading?.info}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Job Groups and Trigger Groups */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Job Groups Section */}
        <Col span={12}>
          <Card title="Job Groups" size="small" style={{ height: 'auto', overflow: 'auto' }}>
            {schedulerInfo?.jobGroups?.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', margin: '20px 0' }}>
                No job groups found
              </p>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {schedulerInfo?.jobGroups?.map((group) => (
                  <div 
                    key={group.name} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag 
                        color={group.name === 'CRITICAL' ? 'red' : 
                               group.name === 'DEFAULT' ? 'blue' :
                               group.name === 'IMPORT' ? 'orange' :
                               group.name === 'REPORTS' ? 'purple' : 'default'}
                      >
                        {group.name}
                      </Tag>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        ({group.count} jobs)
                      </span>
                    </div>
                    <Button
                      size="small"
                      icon={group.isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                      onClick={() => handleJobGroupAction(group.name, group.isPaused)}
                      loading={schedulerLoading?.groupOperations?.[group.name] || false}
                      type={group.isPaused ? "primary" : "default"}
                    >
                      {group.isPaused ? 'Resume' : 'Pause'}
                    </Button>
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>

        {/* Trigger Groups Section */}
        <Col span={12}>
          <Card title="Trigger Groups" size="small" style={{ height: 'auto', overflow: 'auto' }}>
            {schedulerInfo?.triggerGroups?.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', margin: '20px 0' }}>
                No trigger groups found
              </p>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {schedulerInfo?.triggerGroups?.map((group) => (
                  <div 
                    key={group.name} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag 
                        color={group.name === 'DEFAULT' ? 'blue' :
                               group.name === 'FREQUENTLY' ? 'green' :
                               group.name === 'LONGRUNNING' ? 'orange' : 'default'}
                      >
                        {group.name}
                      </Tag>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        ({group.count} triggers)
                      </span>
                    </div>
                    <Button
                      size="small"
                      icon={group.isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                      onClick={() => handleTriggerGroupAction(group.name, group.isPaused)}
                      loading={schedulerLoading?.groupOperations?.[group.name] || false}
                      type={group.isPaused ? "primary" : "default"}
                    >
                      {group.isPaused ? 'Resume' : 'Pause'}
                    </Button>
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>
      </Row>


      {/* Scheduled Jobs */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Scheduled Jobs" extra={<Text type="secondary">{jobs.length} jobs configured</Text>}>
            <Table
              columns={recentJobColumns}
              dataSource={jobs.slice(0, 10)} // Show only first 10 jobs
              rowKey={(record) => `${record.jobName}-${record.group}`}
              loading={loading}
              pagination={false}
              size="small"
            />
            {jobs.length > 10 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text type="secondary">Showing 10 of {jobs.length} jobs. View all in the Jobs section.</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 
