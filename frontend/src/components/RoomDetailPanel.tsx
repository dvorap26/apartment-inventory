import { Drawer, Button, Form, Input, message, Space, Popconfirm, Alert } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useStorage } from '../contexts/StorageContext';
import type { Room } from '../services/tableStorageService';
import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface RoomDetailPanelProps {
  visible: boolean;
  room: Room | null;
  onClose: () => void;
  onRoomUpdated: (room: Room) => void;
  onSuccess: () => void;
}

export const RoomDetailPanel = ({ visible, room, onClose, onRoomUpdated, onSuccess }: RoomDetailPanelProps) => {
  const { deleteRoom, inventoryItems, updateRoom } = useStorage();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const { language, t } = useLanguage();

  const roomItems = room ? inventoryItems.filter(item => item.roomId === room.roomId) : [];
  const canDelete = roomItems.length === 0;

  useEffect(() => {
    form.setFieldsValue({ roomName: room?.roomName });
    setIsEditing(false);
  }, [form, room]);

  const handleDelete = async () => {
    if (!room) return;
    try {
      setLoading(true);
      await deleteRoom(room.roomId);
      message.success(t('roomDeleted'));
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete room';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!room) return;

    const { roomName } = await form.validateFields();
    try {
      setLoading(true);
      const updatedRoom = await updateRoom(room.roomId, roomName);
      onRoomUpdated(updatedRoom);
      message.success(t('roomUpdated'));
      setIsEditing(false);
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('error');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={t('roomDetails')}
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
    >
      {room && (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {!canDelete && (
            <Alert
              message={t('roomHasItems')}
              description={t('roomHasItemsDescription', { count: roomItems.length })}
              type="info"
              showIcon
            />
          )}

          <div>
            <label style={{ fontWeight: 'bold' }}>{t('roomId')}</label>
            <p>{room.roomId}</p>
          </div>

          {isEditing ? (
            <Form form={form} layout="vertical">
              <Form.Item
                name="roomName"
                label={t('roomName')}
                rules={[
                  { required: true, message: t('roomNameRequired') },
                  { min: 1, message: t('roomNameEmpty') },
                  { max: 100, message: t('roomNameLength') },
                ]}
              >
                <Input autoFocus />
              </Form.Item>
            </Form>
          ) : (
            <div>
              <label style={{ fontWeight: 'bold' }}>{t('roomName')}:</label>
              <p>{room.roomName}</p>
            </div>
          )}

          <div>
            <label style={{ fontWeight: 'bold' }}>{t('itemsInRoom')}</label>
            <p>{roomItems.length}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>{t('created')}</label>
            <p>{new Date(room.createdAt).toLocaleString(language === 'cs' ? 'cs-CZ' : 'en-US')}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>{t('lastModified')}</label>
            <p>{new Date(room.lastModifiedAt).toLocaleString(language === 'cs' ? 'cs-CZ' : 'en-US')}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>{t('by')} {room.lastModifiedBy}</p>
          </div>

          <Space>
            {!isEditing && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                {t('edit')}
              </Button>
            )}
            {isEditing && (
              <>
                <Button type="primary" loading={loading} onClick={handleSave}>
                  {t('save')}
                </Button>
                <Button onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
              </>
            )}
            {!isEditing && <Popconfirm
              title={t('deleteRoom')}
              description={canDelete ? t('confirmDeleteRoom') : t('roomHasItems')}
              onConfirm={handleDelete}
              okText={t('yes')}
              cancelText={t('no')}
              disabled={!canDelete}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={!canDelete}
                loading={loading}
              >
                {t('delete')}
              </Button>
            </Popconfirm>}
          </Space>
        </Space>
      )}
    </Drawer>
  );
};