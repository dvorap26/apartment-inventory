import { Drawer, Button, message, Space, Popconfirm, Alert } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useStorage } from '../contexts/StorageContext';
import type { Room } from '../services/tableStorageService';
import { useState } from 'react';

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

  const roomItems = room ? inventoryItems.filter(item => item.roomId === room.roomId) : [];
  const canDelete = roomItems.length === 0;

  const handleDelete = async () => {
    if (!room) return;
    try {
      setLoading(true);
      await deleteRoom(room.roomId);
      message.success('Room deleted successfully');
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
      title="Room Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
    >
      {room && (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {!canDelete && (
            <Alert
              message="Room has inventory items"
              description={`This room contains ${roomItems.length} item(s) and cannot be deleted until they are moved or removed.`}
              type="info"
              showIcon
            />
          )}

          <div>
            <label style={{ fontWeight: 'bold' }}>Room ID:</label>
            <p>{room.roomId}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Room Name:</label>
            <p>{room.roomName}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Items in this room:</label>
            <p>{roomItems.length}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Created:</label>
            <p>{new Date(room.createdAt).toLocaleString()}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Last Modified:</label>
            <p>{new Date(room.lastModifiedAt).toLocaleString()}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>by {room.lastModifiedBy}</p>
          </div>

          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete Room?"
              description={canDelete ? 'Are you sure you want to delete this room?' : 'This room contains items and cannot be deleted'}
              onConfirm={handleDelete}
              okText="Yes"
              cancelText="No"
              disabled={!canDelete}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={!canDelete}
                loading={loading}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </Space>
      )}
    </Drawer>
  );
};