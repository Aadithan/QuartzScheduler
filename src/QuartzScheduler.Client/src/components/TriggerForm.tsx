import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, Radio, DatePicker, message, Divider, Checkbox, TimePicker } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { createTrigger, updateTrigger } from '../store/slices/triggersSlice';
import { fetchJobs } from '../store/slices/jobsSlice';
import { fetchCalendars } from '../store/slices/calendarsSlice';
import { CreateTriggerRequest, UpdateTriggerRequest, triggersApi } from '../services/triggersApi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

interface TriggerFormProps {
  visible: boolean;
  onCancel: () => void;
  editingTrigger?: any;
  onSuccess?: () => void;
}

const { TextArea } = Input;
const { Option } = Select;

const TriggerForm: React.FC<TriggerFormProps> = ({ visible, onCancel, editingTrigger, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const { operationLoading } = useSelector((state: RootState) => state.triggers);
  const { jobs, loading: jobsLoading } = useSelector((state: RootState) => state.jobs);
  const { calendars, loading: calendarsLoading } = useSelector((state: RootState) => state.calendars);
  const [triggerType, setTriggerType] = useState<string>('Cron');
  const [jobDataMap, setJobDataMap] = useState<Array<{id: string, key: string, value: string, type: string}>>([]);
  const [cronDescription, setCronDescription] = useState<string>('');
  const [cronDescriptionTimer, setCronDescriptionTimer] = useState<NodeJS.Timeout | null>(null);

  const isEditing = Boolean(editingTrigger);
  const isLoading = operationLoading['create'] || 
    (editingTrigger && operationLoading[`update-${editingTrigger.triggerName}-${editingTrigger.triggerGroup}`]);

  // Function to get cron description
  const describeCron = async (cronExpression: string) => {
    if (!cronExpression || cronExpression.trim() === '') {
      setCronDescription('');
      return;
    }

    try {
      console.log('Describing cron expression:', cronExpression.trim()); // Debug log
      const response = await triggersApi.describeCronExpression(cronExpression.trim());
      console.log('Cron description response:', response); // Debug log
      
      setCronDescription(response.description || 'No description available');
    } catch (error) {
      console.error('Error describing cron:', error); // Debug log
      setCronDescription('Error validating cron expression');
    }
  };

  // Handler for cron expression input changes
  const handleCronExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Cron expression changed:', value); // Debug log
    
    // Clear existing timer
    if (cronDescriptionTimer) {
      clearTimeout(cronDescriptionTimer);
    }

    // Set new timer to describe cron after 500ms delay
    const timer = setTimeout(() => {
      console.log('Timer triggered, describing cron:', value); // Debug log
      describeCron(value);
    }, 500);

    setCronDescriptionTimer(timer);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cronDescriptionTimer) {
        clearTimeout(cronDescriptionTimer);
      }
    };
  }, [cronDescriptionTimer]);

  useEffect(() => {
    if (visible) {
      // Fetch jobs and calendars when form opens
      dispatch(fetchJobs());
      dispatch(fetchCalendars());
      
      if (editingTrigger) {
        // Fetch detailed trigger information for editing
        const fetchTriggerDetails = async () => {
          try {
            const triggerName = editingTrigger.triggerName || editingTrigger.name;
            const triggerGroup = editingTrigger.triggerGroup || editingTrigger.group;
            
            console.log('Fetching trigger details for:', triggerName, triggerGroup); // Debug log
            const triggerDetails = await triggersApi.getTrigger(triggerName, triggerGroup);
            console.log('Trigger details:', triggerDetails); // Debug log
            
            // Pre-fill form with detailed trigger information
            const formValues: any = {
              triggerName: triggerDetails.triggerName,
              triggerGroup: triggerDetails.triggerGroup,
              job: triggerDetails.job,
              description: triggerDetails.description,
              priority: triggerDetails.priority,
              calendar: triggerDetails.calendarName, // Include associated calendar
              // Convert UTC date strings to CST dayjs objects for DatePicker
              startDate: triggerDetails.startTime ? dayjs.utc(triggerDetails.startTime).tz('America/Chicago') : null,
              endDate: triggerDetails.endTime ? dayjs.utc(triggerDetails.endTime).tz('America/Chicago') : null,
            };

            // Determine trigger type and set type-specific fields
            let scheduleType = 'Cron'; // Default
            
            if (triggerDetails.cronExpression) {
              scheduleType = 'Cron';
              formValues.cronExpression = triggerDetails.cronExpression;
              formValues.triggerType = 'Cron';
              
              // Get cron description
              describeCron(triggerDetails.cronExpression);
            } else if (triggerDetails.repeatCount !== undefined || triggerDetails.repeatInterval) {
              scheduleType = 'Simple';
              formValues.repeatCount = triggerDetails.repeatCount;
              formValues.repeatInterval = triggerDetails.repeatInterval;
              formValues.triggerType = 'Simple';
              
              // Parse repeat interval to extract value and unit
              if (triggerDetails.repeatInterval) {
                // RepeatInterval might be in format like "00:01:00" (1 minute)
                const parts = triggerDetails.repeatInterval.split(':');
                if (parts.length === 3) {
                  const hours = parseInt(parts[0]);
                  const minutes = parseInt(parts[1]);
                  const seconds = parseInt(parts[2]);
                  
                  if (hours > 0) {
                    formValues.repeatInterval = hours.toString();
                    formValues.intervalUnit = 'Hour';
                  } else if (minutes > 0) {
                    formValues.repeatInterval = minutes.toString();
                    formValues.intervalUnit = 'Minute';
                  } else {
                    formValues.repeatInterval = seconds.toString();
                    formValues.intervalUnit = 'Second';
                  }
                }
              }
            }

            setTriggerType(scheduleType);
            form.setFieldsValue(formValues);
            
            // Handle job data map if available in trigger details
            console.log('Trigger details jobDataMap:', triggerDetails.jobDataMap); // Debug log
            if (triggerDetails.jobDataMap && Object.keys(triggerDetails.jobDataMap).length > 0) {
              const jobDataMapArray = Object.entries(triggerDetails.jobDataMap).map(([key, value], index) => ({
                id: `${index}`,
                key: key,
                value: String(value),
                type: typeof value === 'number' ? 'Number' : typeof value === 'boolean' ? 'Boolean' : 'String'
              }));
              console.log('Setting job data map array:', jobDataMapArray); // Debug log
              setJobDataMap(jobDataMapArray);
            } else {
              console.log('No job data map found in trigger details'); // Debug log
              setJobDataMap([]);
            }
            
          } catch (error) {
            console.error('Error fetching trigger details:', error);
            message.error('Failed to load trigger details');
          }
        };
        
        fetchTriggerDetails();
      } else {
        // Reset form for creating
        form.resetFields();
        setTriggerType('Cron');
        setJobDataMap([]);
        setCronDescription(''); // Clear cron description for new forms
      }
    }
  }, [visible, editingTrigger, form, dispatch]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert job data map to object (if needed later for more complex triggers)
      const jobDataMapObject: Record<string, any> = {};
      jobDataMap.forEach(item => {
        if (item.key && item.value) {
          switch (item.type) {
            case 'Number':
              jobDataMapObject[item.key] = Number(item.value);
              break;
            case 'Boolean':
              jobDataMapObject[item.key] = item.value.toLowerCase() === 'true';
              break;
            default:
              jobDataMapObject[item.key] = item.value;
          }
        }
      });

      // Helper function to convert time units to milliseconds for simple triggers
      const convertToMilliseconds = (value: number, unit: string): number => {
        switch (unit) {
          case 'Second': return value * 1000;
          case 'Minute': return value * 60 * 1000;
          case 'Hour': return value * 60 * 60 * 1000;
          case 'Day': return value * 24 * 60 * 60 * 1000;
          default: return value * 1000; // Default to seconds
        }
      };

      // Build job reference string (format: jobName.jobGroup)
      // The job field will contain the combined value like "PushAds_US.DEFAULT"
      const jobReference = values.job || '';

      if (isEditing && editingTrigger) {
        // Update existing trigger
        const updateData: UpdateTriggerRequest = {
          job: jobReference,
          description: values.description,
          priority: values.priority,
          // Convert CST dayjs objects to UTC Date objects for backend
          startTime: values.startDate ? values.startDate.tz('America/Chicago').utc().toDate() : undefined,
          endTime: values.endDate ? values.endDate.tz('America/Chicago').utc().toDate() : undefined,
          // Include calendar association
          calendarName: values.calendar || undefined,
          // Include job data map
          jobDataMap: jobDataMapObject,
        };

        // Add trigger-specific properties
        if (triggerType === 'Cron') {
          updateData.cronExpression = values.cronExpression;
        } else if (triggerType === 'Simple') {
          updateData.repeatCount = values.repeatCount ? parseInt(values.repeatCount) : -1;
          if (values.repeatInterval && values.intervalUnit) {
            const intervalMs = convertToMilliseconds(parseInt(values.repeatInterval), values.intervalUnit);
            updateData.repeatInterval = `00:00:${Math.floor(intervalMs / 1000).toString().padStart(2, '0')}`;
          }
        }
        
        await dispatch(updateTrigger({
          name: editingTrigger.triggerName,
          group: editingTrigger.triggerGroup,
          trigger: updateData
        })).unwrap();
        
        message.success('Trigger updated successfully');
      } else {
        // Create new trigger
        const createData: CreateTriggerRequest = {
          triggerName: values.triggerName,
          triggerGroup: values.triggerGroup,
          job: jobReference,
          description: values.description,
          priority: values.priority,
          // Convert CST dayjs objects to UTC Date objects for backend
          startTime: values.startDate ? values.startDate.tz('America/Chicago').utc().toDate() : undefined,
          endTime: values.endDate ? values.endDate.tz('America/Chicago').utc().toDate() : undefined,
          // Include calendar association
          calendarName: values.calendar || undefined,
          // Include job data map
          jobDataMap: jobDataMapObject,
        };

        // Add trigger-specific properties
        if (triggerType === 'Cron') {
          createData.cronExpression = values.cronExpression;
        } else if (triggerType === 'Simple') {
          createData.repeatCount = values.repeatCount ? parseInt(values.repeatCount) : -1;
          if (values.repeatInterval && values.intervalUnit) {
            const intervalMs = convertToMilliseconds(parseInt(values.repeatInterval), values.intervalUnit);
            createData.repeatInterval = `00:00:${Math.floor(intervalMs / 1000).toString().padStart(2, '0')}`;
          }
        }
        
        await dispatch(createTrigger(createData)).unwrap();
        message.success('Trigger created successfully');
      }
      
      // Close modal and reset
      onCancel();
      form.resetFields();
      setJobDataMap([]);
      
      // Trigger success callback to refresh parent component
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
      
    } catch (error: any) {
      message.error(`Failed to ${isEditing ? 'update' : 'create'} trigger: ${error}`);
    }
  };

  const addJobDataEntry = () => {
    const newId = `new-${Date.now()}-${Math.random()}`;
    setJobDataMap([...jobDataMap, { id: newId, key: '', value: '', type: 'String' }]);
  };

  const removeJobDataEntry = (index: number) => {
    const newJobDataMap = jobDataMap.filter((_, i) => i !== index);
    setJobDataMap(newJobDataMap);
  };

  const updateJobDataEntry = (index: number, field: 'key' | 'value' | 'type', value: string) => {
    const newJobDataMap = [...jobDataMap];
    newJobDataMap[index][field] = value;
    setJobDataMap(newJobDataMap);
  };

  const renderTriggerSpecificFields = () => {
    switch (triggerType) {
      case 'Cron':
        return (
          <div>
            <Divider orientation="left">Cron Trigger Properties</Divider>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Form.Item
                name="cronExpression"
                label="Cron Expression"
                rules={[{ required: true, message: 'Please enter cron expression' }]}
                extra={
                  <div>
                    <a href="http://cronmaker.com" target="_blank" rel="noopener noreferrer">http://cronmaker.com</a>
                    {cronDescription && (
                      <div style={{ 
                        marginTop: '4px', 
                        color: '#52c41a', 
                        fontSize: '12px', 
                        fontStyle: 'italic' 
                      }}>
                        {cronDescription}
                      </div>
                    )}
                  </div>
                }
              >
                <Input 
                  placeholder="0 0 * * * ?" 
                  onChange={handleCronExpressionChange}
                />
              </Form.Item>
              <Form.Item
                name="timeZone"
                label="Time Zone"
              >
                <Select >
                  <Option value="UTC">(UTC+00:00) UTC</Option>
                  <Option value="US/Central">(UTC-06:00) Central Time (US & Canada)</Option>
                  <Option value="US/Eastern">(UTC-05:00) Eastern Time (US & Canada)</Option>
                  <Option value="US/Pacific">(UTC-08:00) Pacific Time (US & Canada)</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
        );
      
      case 'Simple':
        return (
          <div>
            <Divider orientation="left">Simple Trigger Properties</Divider>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
              <Form.Item
                name="repeatInterval"
                label="Repeat Interval"
                rules={[{ required: true, message: 'Please enter repeat interval' }]}
              >
                <Input placeholder="Enter interval" />
              </Form.Item>
              <Form.Item
                name="intervalUnit"
                label="Unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select >
                  <Option value="Second">Second</Option>
                  <Option value="Minute">Minute</Option>
                  <Option value="Hour">Hour</Option>
                  <Option value="Day">Day</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="repeatCount"
                label="Repeat Count"
              >
                <Input placeholder="-1 for infinite" />
              </Form.Item>
            </div>
          </div>
        );
      
      case 'Daily Time Interval':
        return (
          <div>
            <Divider orientation="left">Daily Time Interval Trigger Properties</Divider>
            
            {/* First row: Repeat Interval, Unit, Time Zone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '8px', marginBottom: '12px' }}>
              <Form.Item
                name="repeatInterval"
                label="Repeat Interval"
                rules={[{ required: true, message: 'Please enter repeat interval' }]}
              >
                <Input placeholder="1" />
              </Form.Item>
              <Form.Item
                name="intervalUnit"
                label="Unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select >
                  <Option value="Second">Second</Option>
                  <Option value="Minute">Minute</Option>
                  <Option value="Hour">Hour</Option>
                  <Option value="Day">Day</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="timeZone"
                label="Time Zone"
              >
                <Select >
                  <Option value="UTC">(UTC+00:00) UTC</Option>
                  <Option value="US/Central">(UTC-06:00) Central Time (US & Canada)</Option>
                  <Option value="US/Eastern">(UTC-05:00) Eastern Time (US & Canada)</Option>
                  <Option value="US/Pacific">(UTC-08:00) Pacific Time (US & Canada)</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Second row: Repeat Count and Repeat Forever */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'end', marginBottom: '12px' }}>
              <Form.Item
                name="repeatCount"
                label="Repeat Count"
              >
                <Input placeholder="Repeat Count" />
              </Form.Item>
              <Form.Item
                name="repeatForever"
                valuePropName="checked"
                style={{ marginBottom: '24px' }}
              >
                <Checkbox>Repeat Forever</Checkbox>
              </Form.Item>
            </div>

            {/* Third row: Start Time and End Time of Day */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <Form.Item
                name="startTimeOfDay"
                label="Start Time of Day"
              >
                <TimePicker 
                  style={{ width: '100%' }} 
                  placeholder="Time"
                  format="HH:mm:ss"
                />
              </Form.Item>
              <Form.Item
                name="endTimeOfDay"
                label="End Time of Day"
              >
                <TimePicker 
                  style={{ width: '100%' }} 
                  placeholder="Time"
                  format="HH:mm:ss"
                />
              </Form.Item>
            </div>

            {/* Days of Week */}
            <Form.Item
              name="daysOfWeek"
              label="Days of Week"
            >
              <Checkbox.Group
                options={[
                  { label: 'Monday', value: 'Monday' },
                  { label: 'Tuesday', value: 'Tuesday' },
                  { label: 'Wednesday', value: 'Wednesday' },
                  { label: 'Thursday', value: 'Thursday' },
                  { label: 'Friday', value: 'Friday' },
                  { label: 'Saturday', value: 'Saturday' },
                  { label: 'Sunday', value: 'Sunday' },
                ]}

                style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px 16px' 
                }}
              />
            </Form.Item>
          </div>
        );
      
      case 'Calendar Interval':
        return (
          <div>
            <Divider orientation="left">Calendar Interval Trigger Properties</Divider>
            
            {/* First row: Repeat Interval, Unit, Time Zone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '8px', marginBottom: '12px' }}>
              <Form.Item
                name="repeatInterval"
                label="Repeat Interval"
                rules={[{ required: true, message: 'Please enter repeat interval' }]}
              >
                <Input placeholder="1" />
              </Form.Item>
              <Form.Item
                name="intervalUnit"
                label="Unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select >
                  <Option value="Minute">Minute</Option>
                  <Option value="Hour">Hour</Option>
                  <Option value="Day">Day</Option>
                  <Option value="Week">Week</Option>
                  <Option value="Month">Month</Option>
                  <Option value="Year">Year</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="timeZone"
                label="Time Zone"
              >
                <Select >
                  <Option value="UTC">(UTC+00:00) UTC</Option>
                  <Option value="US/Central">(UTC-06:00) Central Time (US & Canada)</Option>
                  <Option value="US/Eastern">(UTC-05:00) Eastern Time (US & Canada)</Option>
                  <Option value="US/Pacific">(UTC-08:00) Pacific Time (US & Canada)</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Daylight Savings Options */}
            <div style={{ marginBottom: '16px' }}>
              <Form.Item
                name="preserveHourOfDay"
                valuePropName="checked"
                style={{ marginBottom: '8px' }}
              >
                <Checkbox>Preserve Hour of Day Across Daylight Savings</Checkbox>
              </Form.Item>
              
              <Form.Item
                name="skipDayIfHourDoesNotExist"
                valuePropName="checked"
                style={{ marginBottom: '0' }}
              >
                <Checkbox>Skip Day If Hour Does Not Exist</Checkbox>
              </Form.Item>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Trigger' : 'Add Trigger'}
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Discard Changes
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={isLoading}>
          {isEditing ? 'Update' : 'Create'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
        initialValues={{
          triggerGroup: 'DEFAULT',
          priority: 5,
          misfireInstruction: 'Smart Policy',
          intervalUnit: 'Second',
          timeZone: '(UTC-06:00) Central Time (US & Canada)',
          repeatForever: true,
          daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          preserveHourOfDay: false,
          skipDayIfHourDoesNotExist: false,
        }}
      >
        {/* Trigger Type */}
        <Form.Item
          name="triggerType"
          label="Trigger Type"
          rules={[{ required: true, message: 'Please select trigger type' }]}
        >
          <Radio.Group onChange={(e) => setTriggerType(e.target.value)} value={triggerType}>
            <Radio value="Cron">Cron</Radio>
            <Radio value="Simple">Simple</Radio>
            <Radio value="Calendar Interval">Calendar Interval</Radio>
            <Radio value="Daily Time Interval">Daily Time Interval</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Job Selection */}
        <Form.Item
          name="job"
          label="Job"
          rules={[{ required: true, message: 'Please select a job' }]}
        >
          <Select 
            placeholder={jobsLoading ? "Loading jobs..." : "Select a job"}
            loading={jobsLoading}
            showSearch
            filterOption={(input, option) =>
              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {jobs.map((job) => (
              <Option 
                key={`${job.jobName}.${job.group}`} 
                value={`${job.jobName}.${job.group}`}
              >
                {job.jobName} ({job.group})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
          <Form.Item
            name="triggerName"
            label="Trigger Name"
            rules={[{ required: true, message: 'Please enter trigger name' }]}
          >
            <Input placeholder="Trigger Name" />
          </Form.Item>

          <Form.Item
            name="triggerGroup"
            label="Trigger Group"
            rules={[{ required: true, message: 'Please select trigger group' }]}
          >
            <Select>
              <Option value="DEFAULT">DEFAULT</Option>
              <Option value="CRITICAL">CRITICAL</Option>
              <Option value="REPORTS">REPORTS</Option>
            </Select>
          </Form.Item>

          <Form.Item name="startDate" label="Start Date (CST)">
            <DatePicker 
              showTime={{
                format: 'h:mm:ss A'
              }}
              format="MM/DD/YYYY h:mm:ss A"
              style={{ width: '100%' }} 
              placeholder="MM/DD/YYYY h:mm:ss AM/PM"
            />
          </Form.Item>

          <Form.Item name="endDate" label="End Date (CST)">
            <DatePicker 
              showTime={{
                format: 'h:mm:ss A'
              }}
              format="MM/DD/YYYY h:mm:ss A"
              style={{ width: '100%' }} 
              placeholder="MM/DD/YYYY h:mm:ss AM/PM"
            />
          </Form.Item>
        </div>

        {/* Description */}
        <Form.Item name="description" label="Description" style={{ marginBottom: '12px' }}>
          <TextArea rows={2} placeholder="Enter trigger description" />
        </Form.Item>

        {/* Calendar, Misfire Instruction and Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <Form.Item name="calendar" label="Calendar">
            <Select 
              placeholder="Select calendar (optional)"
              loading={calendarsLoading}
              allowClear
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {calendars.map((calendar) => (
                <Option key={calendar.name} value={calendar.name}>
                  {calendar.name} ({calendar.type})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="misfireInstruction" label="Misfire Instruction">
            <Select>
              <Option value="Smart Policy">Smart Policy</Option>
              <Option value="Ignore Misfire Policy">Ignore Misfire Policy</Option>
              <Option value="Do Nothing">Do Nothing</Option>
            </Select>
          </Form.Item>

          <Form.Item name="priority" label="Priority">
            <Select>
              <Option value={1}>1</Option>
              <Option value={2}>2</Option>
              <Option value={3}>3</Option>
              <Option value={4}>4</Option>
              <Option value={5}>5</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Trigger-specific fields */}
        {renderTriggerSpecificFields()}

        {/* Job Data Map */}
        <Divider orientation="left" style={{ marginTop: '8px', marginBottom: '12px' }}>Job Data Map</Divider>
        
        <div style={{ marginBottom: 8 }}>
          <Button 
            type="dashed" 
            onClick={addJobDataEntry} 
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Add Parameter
          </Button>
        </div>

        {jobDataMap.map((item, index) => (
          <div key={item.id} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'flex-start' }}>
            <Input
              placeholder="Parameter Name"
              value={item.key}
              onChange={(e) => updateJobDataEntry(index, 'key', e.target.value)}
              style={{ flex: 1 }}
            />
            <Input
              placeholder="String"
              value={item.value}
              onChange={(e) => updateJobDataEntry(index, 'value', e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              value={item.type}
              onChange={(value) => updateJobDataEntry(index, 'type', value)}
              style={{ width: 100 }}
            >
              <Option value="String">String</Option>
              <Option value="Number">Number</Option>
              <Option value="Boolean">Boolean</Option>
            </Select>
            <Button 
              type="text" 
              danger 
              icon={<MinusCircleOutlined />}
              onClick={() => removeJobDataEntry(index)}
            />
          </div>
        ))}

        {jobDataMap.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#999', 
            padding: '12px',
            border: '1px dashed #d9d9d9',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            No job data parameters defined.
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default TriggerForm;