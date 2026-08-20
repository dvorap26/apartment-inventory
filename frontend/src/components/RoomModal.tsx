import { Modal, Form, Input, Button, message } from 'antd';
import { useStorage } from '../contexts/StorageContext';
import type { Room } from '../services/tableStorageService';
import { useState } from 'react';

interface RoomModalProps {
  visible: boolean;
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoomModal = ({ visible, room, onClose, onSuccess }: RoomModalProps) => {
  const { createRoom, updateRoom } = useStorage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { roomName: string }) => {
    try {
      setLoading(true);
      if (room) {
        await updateRoom(room.roomId, values.roomName);
        message.success('Room updated successfully');
      } else {
        await createRoom(values.roomName);
        message.success('Room created successfully');
      }
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
      title={room ? 'Edit Room' : 'Create New Room'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          {room ? 'Update' : 'Create'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          roomName: room?.roomName || '',
        }}
      >
        <Form.Item
          name="roomName"
          label="Room Name"
          rules={[
            { required: true, message: 'Room name is required' },
            { min: 1, message: 'Room name cannot be empty' },
            { max: 100, message: 'Room name must be less than 100 characters' },
          ]}
        >
          <Input placeholder="Enter room name (e.g., Living Room, Kitchen)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};