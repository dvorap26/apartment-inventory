import { Drawer, Button, message, Space, Popconfirm, Alert } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useStorage } from '../contexts/StorageContext';
import type { Room } from '../services/tableStorageService';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface RoomDetailPanelProps {
  visible: boolean;
  room: Room | null;
  onClose: () => void;
  onEdit: (room: Room) => void;
  onSuccess: () => void;
}

export const RoomDetailPanel = ({ visible, room, onClose, onEdit, onSuccess }: RoomDetailPanelProps) => {
  const { deleteRoom, inventoryItems } = useStorage();
  const [loading, setLoading] = useState(false);
  const { language, t } = useLanguage();

  const roomItems = room ? inventoryItems.filter(item => item.roomId === room.roomId) : [];
  const canDelete = roomItems.length === 0;

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

  const handleEdit = () => {
    if (room) {
      onEdit(room);
      onClose();
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

          <div>
            <label style={{ fontWeight: 'bold' }}>{t('roomName')}:</label>
            <p>{room.roomName}</p>
          </div>

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
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              {t('edit')}
            </Button>
            <Popconfirm
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
            </Popconfirm>
          </Space>
        </Space>
      )}
    </Drawer>
  );
};