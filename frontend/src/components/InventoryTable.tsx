import { Table, Button, Space, Collapse, Empty, message, Alert } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useStorage } from '../../contexts/StorageContext';
import { Room, InventoryItem } from '../../services/tableStorageService';
import { useState } from 'react';

interface InventoryTableProps {
  rooms: Room[];
  inventoryItems: InventoryItem[];
  onAddItem: (roomId: string) => void;
  onEditRoom: (room: Room) => void;
  onSelectItem: (item: InventoryItem) => void;
}

export const InventoryTable = ({
  rooms,
  inventoryItems,
  onAddItem,
  onEditRoom,
  onSelectItem,
}: InventoryTableProps) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  if (rooms.length === 0) {
    return (
      <Alert
        message="No rooms available"
        description="Please create a room first before adding inventory items."
        type="warning"
        showIcon
        style={{ marginBottom: '24px' }}
      />
    );
  }

  const items = rooms.map((room) => {
    const roomItems = inventoryItems.filter(item => item.roomId === room.roomId);

    const columns = [
      {
        title: 'Item Name',
        dataIndex: 'itemName',
        key: 'itemName',
        width: '40%',
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: '40%',
        ellipsis: true,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: '20%',
        render: (_: unknown, record: InventoryItem) => (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => onSelectItem(record)}
            >
              View
            </Button>
          </Space>
        ),
      },
    ];

    return {
      key: room.roomId,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span>
            {room.roomName} ({roomItems.length} items)
          </span>
          <Space onClick={(e) => e.stopPropagation()}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditRoom(room)}
            />
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onAddItem(room.roomId)}
            >
              Add Item
            </Button>
          </Space>
        </div>
      ),
      children: roomItems.length > 0 ? (
        <Table
          columns={columns}
          dataSource={roomItems}
          pagination={false}
          rowKey="itemId"
          onRow={(record) => ({
            onClick: () => onSelectItem(record),
            style: { cursor: 'pointer' },
          })}
        />
      ) : (
        <Empty description="No items in this room" style={{ padding: '24px 0' }} />
      ),
    };
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Add Room
          </Button>
        </Space>
      </div>
      <Collapse items={items} />
    </div>
  );
};
