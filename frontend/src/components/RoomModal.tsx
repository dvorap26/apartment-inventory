import { Modal, Form, Input, Button, message } from 'antd';
import { useStorage } from '../contexts/StorageContext';
import type { Room } from '../services/tableStorageService';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();

  const handleSubmit = async (values: { roomName: string }) => {
    try {
      setLoading(true);
      if (room) {
        await updateRoom(room.roomId, values.roomName);
        message.success(t('roomUpdated'));
      } else {
        await createRoom(values.roomName);
        message.success(t('roomCreated'));
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
      title={room ? t('editRoom') : t('createRoom')}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          {room ? t('update') : t('create')}
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
          label={t('roomName')}
          rules={[
            { required: true, message: t('roomNameRequired') },
            { min: 1, message: t('roomNameEmpty') },
            { max: 100, message: t('roomNameLength') },
          ]}
        >
          <Input placeholder={t('roomNamePlaceholder')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};