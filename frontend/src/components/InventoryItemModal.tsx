import { Modal, Form, Input, Select, Button, message } from 'antd';
import { useStorage } from '../contexts/StorageContext';
import type { Room } from '../services/tableStorageService';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface InventoryItemModalProps {
  visible: boolean;
  roomId: string | null;
  rooms: Room[];
  onClose: () => void;
}

export const InventoryItemModal = ({
  visible,
  roomId,
  rooms,
  onClose,
}: InventoryItemModalProps) => {
  const { createInventoryItem } = useStorage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

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
      message.success(t('itemCreated'));
      form.resetFields();
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
      title={t('createItem')}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          {t('create')}
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
          label={t('itemName')}
          rules={[
            { required: true, message: t('itemNameRequired') },
            { min: 1, message: t('itemNameEmpty') },
            { max: 100, message: t('itemNameLength') },
          ]}
        >
          <Input placeholder={t('itemNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('description')}
        >
          <Input.TextArea
            placeholder={t('descriptionPlaceholder')}
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="roomId"
          label={t('room')}
          rules={[{ required: true, message: t('roomRequired') }]}
        >
          <Select placeholder={t('selectRoom')}>
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