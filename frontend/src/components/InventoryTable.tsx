import { Table, Button, Space, Collapse, Empty, Alert } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { Room, InventoryItem } from '../services/tableStorageService';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();
  if (rooms.length === 0) {
    return (
      <Alert
        message={t('noRoomsAvailable')}
        description={t('noRoomsAvailableDescription')}
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
        title: t('itemName'),
        dataIndex: 'itemName',
        key: 'itemName',
        width: '40%',
      },
      {
        title: t('description'),
        dataIndex: 'description',
        key: 'description',
        width: '40%',
        ellipsis: true,
      },
      {
        title: t('actions'),
        key: 'actions',
        width: '20%',
        render: (_: unknown, record: InventoryItem) => (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => onSelectItem(record)}
            >
              {t('view')}
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
            {room.roomName} ({roomItems.length} {t('items')})
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
              {t('addItem')}
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
        <Empty description={t('noItems')} style={{ padding: '24px 0' }} />
      ),
    };
  });

  return (
    <div>
      <Collapse defaultActiveKey={rooms.map((room) => room.roomId)} items={items} />
    </div>
  );
};
