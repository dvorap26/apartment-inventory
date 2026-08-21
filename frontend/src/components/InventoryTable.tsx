import { Table, Button, Space, Collapse, Empty, Alert, Tooltip } from 'antd';
import type { Breakpoint } from 'antd';
import { PlusOutlined, EditOutlined, UpOutlined, DownOutlined, EyeOutlined } from '@ant-design/icons';
import type { Room, InventoryItem } from '../services/tableStorageService';
import { useLanguage } from '../contexts/LanguageContext';

interface InventoryTableProps {
  rooms: Room[];
  inventoryItems: InventoryItem[];
  onAddItem: (roomId: string) => void;
  onEditRoom: (room: Room) => void;
  onSelectItem: (item: InventoryItem) => void;
  onMoveRoom: (roomId: string, direction: -1 | 1) => void;
  onMoveItem: (itemId: string, direction: -1 | 1) => void;
}

export const InventoryTable = ({
  rooms,
  inventoryItems,
  onAddItem,
  onEditRoom,
  onSelectItem,
  onMoveRoom,
  onMoveItem,
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

  const items = rooms.map((room, roomIndex) => {
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
        responsive: ['sm'] as Breakpoint[],
      },
      {
        title: t('actions'),
        key: 'actions',
        width: '20%',
        render: (_: unknown, record: InventoryItem) => (
          <Space>
            <Tooltip title={t('moveUp')}>
              <Button
                aria-label={t('moveUp')}
                disabled={roomItems.findIndex((item) => item.itemId === record.itemId) === 0}
                icon={<UpOutlined />}
                size="small"
                type="text"
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveItem(record.itemId, -1);
                }}
              />
            </Tooltip>
            <Tooltip title={t('moveDown')}>
              <Button
                aria-label={t('moveDown')}
                disabled={roomItems.findIndex((item) => item.itemId === record.itemId) === roomItems.length - 1}
                icon={<DownOutlined />}
                size="small"
                type="text"
                onClick={(event) => {
                  event.stopPropagation();
                  onMoveItem(record.itemId, 1);
                }}
              />
            </Tooltip>
            <Button
              aria-label={t('view')}
              className="item-detail-button"
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onSelectItem(record)}
            >
              <span className="button-label">{t('view')}</span>
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
            <Tooltip title={t('moveUp')}>
              <Button
                aria-label={t('moveUp')}
                disabled={roomIndex === 0}
                icon={<UpOutlined />}
                size="small"
                type="text"
                onClick={() => onMoveRoom(room.roomId, -1)}
              />
            </Tooltip>
            <Tooltip title={t('moveDown')}>
              <Button
                aria-label={t('moveDown')}
                disabled={roomIndex === rooms.length - 1}
                icon={<DownOutlined />}
                size="small"
                type="text"
                onClick={() => onMoveRoom(room.roomId, 1)}
              />
            </Tooltip>
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
