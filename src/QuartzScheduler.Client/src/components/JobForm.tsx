import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Button, message, Select, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { createJob, updateJob, Job } from '../store/slices/jobsSlice';
import { CreateJobRequest, UpdateJobRequest } from '../services/jobsApi';
import { JOB_GROUPS, JOB_CLASSES, DEFAULT_JOB_GROUP, DEFAULT_JOB_CLASS } from '../constants/jobConstants';

interface JobFormProps {
  visible: boolean;
  onCancel: () => void;
  editingJob?: Job;
  onSuccess?: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ visible, onCancel, editingJob, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const { operationLoading } = useSelector((state: RootState) => state.jobs);
  const [jobDataMap, setJobDataMap] = useState<Array<{id: string, key: string, value: string, type: string}>>([]);
  
  const isEditing = Boolean(editingJob);
  const isLoading = operationLoading['create'] || 
    (editingJob && operationLoading[`update-${editingJob.jobName}-${editingJob.group}`]);

  useEffect(() => {
    if (visible) {
      if (editingJob) {
        // Pre-fill form for editing
        form.setFieldsValue({
          jobName: editingJob.jobName,
          group: editingJob.group,
          type: editingJob.type,
          description: editingJob.description,
          recovery: editingJob.recovery,
          persist: editingJob.persist,
          concurrent: editingJob.concurrent,
          durable: editingJob.durable,
        });
        // Load existing job data map
        if (editingJob.jobDataMap && Object.keys(editingJob.jobDataMap).length > 0) {
          const dataMapEntries = Object.entries(editingJob.jobDataMap).map(([key, value], index) => ({
            id: `existing-${index}`,
            key,
            value: String(value),
            type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string'
          }));
          setJobDataMap(dataMapEntries);
        } else {
          setJobDataMap([]);
        }
      } else {
        // Reset form for creating
        form.resetFields();
        form.setFieldsValue({
          group: DEFAULT_JOB_GROUP,
          type: DEFAULT_JOB_CLASS,
          recovery: false,
          persist: true, // Default to true for better job data persistence
          concurrent: true,
          durable: true, // Default to true since jobs without triggers must be durable
        });
        setJobDataMap([]);
      }
    }
  }, [visible, editingJob, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert job data map to object
      const jobDataMapObject: Record<string, any> = {};
      jobDataMap.forEach(item => {
        if (item.key && item.value) {
          // Convert value based on type
          switch (item.type) {
            case 'number':
              jobDataMapObject[item.key] = Number(item.value);
              break;
            case 'boolean':
              jobDataMapObject[item.key] = item.value.toLowerCase() === 'true';
              break;
            default:
              jobDataMapObject[item.key] = item.value;
          }
        }
      });
      
      if (isEditing && editingJob) {
        // Update existing job
        const updateData: UpdateJobRequest = {
          type: values.type,
          description: values.description,
          recovery: values.recovery,
          persist: values.persist,
          concurrent: values.concurrent,
          durable: values.durable,
          jobDataMap: jobDataMapObject,
        };
        
        await dispatch(updateJob({
          name: editingJob.jobName,
          group: editingJob.group,
          job: updateData
        })).unwrap();
        
        message.success('Job updated successfully');
      } else {
        // Create new job
        const createData: CreateJobRequest = {
          jobName: values.jobName,
          group: values.group,
          type: values.type,
          description: values.description,
          recovery: values.recovery,
          persist: values.persist,
          concurrent: values.concurrent,
          durable: values.durable,
          jobDataMap: jobDataMapObject,
        };
        
        console.log('Creating job with data:', createData);
        console.log('Job Data Map Object:', jobDataMapObject);
        
        await dispatch(createJob(createData)).unwrap();
        message.success('Job created successfully');
      }
      
      // Close modal and refresh
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
      message.error(`Failed to ${isEditing ? 'update' : 'create'} job: ${error}`);
    }
  };

  const addJobDataEntry = () => {
    const newId = `new-${Date.now()}-${Math.random()}`;
    setJobDataMap([...jobDataMap, { id: newId, key: '', value: '', type: 'string' }]);
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

  return (
    <Modal
      title={isEditing ? 'Edit Job' : 'Create Job'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      width={800}
      okText={isEditing ? 'Update' : 'Create'}
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="jobName"
            label="Job Name"
            rules={[{ required: true, message: 'Please enter job name' }]}
          >
            <Input placeholder="Enter job name" disabled={isEditing} />
          </Form.Item>

          <Form.Item
            name="group"
            label="Group"
            rules={[{ required: true, message: 'Please select group' }]}
          >
            <Select 
              placeholder="Select group"
              disabled={isEditing}
              options={JOB_GROUPS as any}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Job Type"
            rules={[{ required: true, message: 'Please select job type' }]}
          >
            <Select 
              placeholder="Select job type"
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={JOB_CLASSES as any}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input placeholder="Enter job description" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="recovery"
            label="Request Recovery"
            valuePropName="checked"
            tooltip="If true, the job will be re-executed if a 'recovery' or 'fail-over' situation is encountered"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="persist"
            label="Persist Job Data"
            valuePropName="checked"
            tooltip="If true, the job data map will be persisted after execution"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="concurrent"
            label="Allow Concurrent"
            valuePropName="checked"
            tooltip="If true, multiple instances of the job can run concurrently"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="durable"
            label="Durable"
            valuePropName="checked"
            tooltip="If true, the job will remain stored in the scheduler even when no triggers reference it. Required for jobs without triggers."
          >
            <Switch />
          </Form.Item>
        </div>

        <Divider orientation="left">Job Data Map</Divider>
        
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="dashed" 
            onClick={addJobDataEntry} 
            icon={<PlusOutlined />}
            style={{ width: '100%' }}
          >
            Add Job Data Parameter
          </Button>
        </div>

        {jobDataMap.map((item, index) => (
          <div key={item.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
            <Input
              placeholder="Parameter Name"
              value={item.key}
              onChange={(e) => updateJobDataEntry(index, 'key', e.target.value)}
              style={{ flex: 1 }}
            />
            <Input
              placeholder="Value"
              value={item.value}
              onChange={(e) => updateJobDataEntry(index, 'value', e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              value={item.type}
              onChange={(value) => updateJobDataEntry(index, 'type', value)}
              style={{ width: 100 }}
              options={[
                { label: 'String', value: 'string' },
                { label: 'Number', value: 'number' },
                { label: 'Boolean', value: 'boolean' },
              ]}
            />
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
            padding: '20px',
            border: '1px dashed #d9d9d9',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            No job data parameters defined. Click "Add Job Data Parameter" to add key-value pairs.
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default JobForm;