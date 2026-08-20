import { Modal, Form, Input, Select, Button, message } from 'antd';
import { useStorage } from '../contexts/StorageContext';
import type { Room } from '../services/tableStorageService';
import { useState } from 'react';

interface InventoryItemModalProps {
  visible: boolean;
  roomId: string | null;
  rooms: Room[];
  onClose: () => void;
  onSuccess: () => void;
}

export const InventoryItemModal = ({
  visible,
  roomId,
  rooms,
  onClose,
  onSuccess,
}: InventoryItemModalProps) => {
  const { createInventoryItem } = useStorage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    itemName: string;
    description: string;
    roomId: string;
  }) => {
    try {
      setLoading(true);
      await createInventoryItem(
        values.itemName,
        values.description,
        values.roomId
      );
      message.success('Item created successfully');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create New Inventory Item"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          Create
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          roomId: roomId || undefined,
        }}
      >
        <Form.Item
          name="itemName"
          label="Item Name"
          rules={[
            { required: true, message: 'Item name is required' },
            { min: 1, message: 'Item name cannot be empty' },
            { max: 100, message: 'Item name must be less than 100 characters' },
          ]}
        >
          <Input placeholder="Enter item name (e.g., Refrigerator)" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: 'Description is required' },
            { min: 1, message: 'Description cannot be empty' },
          ]}
        >
          <Input.TextArea
            placeholder="Enter item description"
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="roomId"
          label="Room"
          rules={[{ required: true, message: 'Room is required' }]}
        >
          <Select placeholder="Select a room">
            {rooms.map(room => (
              <Select.Option key={room.roomId} value={room.roomId}>
                {room.roomName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};