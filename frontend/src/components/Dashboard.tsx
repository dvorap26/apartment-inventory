import { Layout, Button, Space, message, Alert, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useStorage } from '../contexts/StorageContext';
import type { Room, InventoryItem } from '../services/tableStorageService';
import { useEffect, useState } from 'react';
import { InventoryTable } from './InventoryTable';
import { RoomModal } from './RoomModal';
import { RoomDetailPanel } from './RoomDetailPanel';
import { InventoryItemModal } from './InventoryItemModal';
import { InventoryItemDetailPanel } from './InventoryItemDetailPanel';
import { ExportButton } from './ExportButton';
import { useLanguage } from '../contexts/LanguageContext';

export const Dashboard = () => {
  const {
    rooms,
    inventoryItems,
    isLoading,
    error,
    loadRooms,
    loadInventoryItems,
    moveRoom,
    moveInventoryItem,
  } = useStorage();
  const { t } = useLanguage();
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [roomDetailVisible, setRoomDetailVisible] = useState(false);
  const [itemDetailVisible, setItemDetailVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedRoomIdForItem, setSelectedRoomIdForItem] = useState<string | null>(null);

  useEffect(() => {
    setSelectedItem((currentItem) =>
      currentItem
        ? inventoryItems.find((item) => item.itemId === currentItem.itemId) ?? currentItem
        : null
    );
  }, [inventoryItems]);

  // Refresh data
  const handleRefresh = async () => {
    try {
      await loadRooms();
      await loadInventoryItems();
      message.success(t('refreshed'));
    } catch (err) {
      message.error(t('refreshFailed'));
    }
  };

  // Room operations
  const handleCreateRoom = () => {
    setEditingRoom(null);
    setRoomModalVisible(true);
  };

  const handleSelectRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomDetailVisible(true);
  };

  const handleRoomModalClose = () => {
    setRoomModalVisible(false);
    setEditingRoom(null);
  };

  const handleRoomDetailClose = () => {
    setRoomDetailVisible(false);
    setEditingRoom(null);
  };

  // Item operations
  const handleAddItem = (roomId: string) => {
    setSelectedRoomIdForItem(roomId);
    setItemModalVisible(true);
  };

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemDetailVisible(true);
  };

  const handleMoveRoom = async (roomId: string, direction: -1 | 1) => {
    try {
      await moveRoom(roomId, direction);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('error'));
    }
  };

  const handleMoveItem = async (itemId: string, direction: -1 | 1) => {
    try {
      await moveInventoryItem(itemId, direction);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('error'));
    }
  };

  const handleItemModalClose = () => {
    setItemModalVisible(false);
    setSelectedRoomIdForItem(null);
  };

  const handleItemDetailClose = () => {
    setItemDetailVisible(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100%' }}>
        <Layout.Content className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Spin size="large" tip={t('loadingInventory')} />
          </div>
        </Layout.Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100%' }}>
      <Layout.Content className="dashboard-content">
        {error && (
          <Alert
            message={t('error')}
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: '24px' }}
          />
        )}

        <div className="dashboard-actions">
          <Space wrap>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateRoom}
            >
              <span className="button-label">{t('addRoom')}</span>
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              <span className="button-label">{t('refresh')}</span>
            </Button>
            <ExportButton />
          </Space>
        </div>

        {rooms.length === 0 ? (
          <Alert
            message={t('noRooms')}
            description={t('noRoomsDescription')}
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        ) : (
          <InventoryTable
            rooms={rooms}
            inventoryItems={inventoryItems}
            onAddItem={handleAddItem}
            onEditRoom={handleSelectRoom}
            onSelectItem={handleSelectItem}
            onMoveRoom={(roomId, direction) => void handleMoveRoom(roomId, direction)}
            onMoveItem={(itemId, direction) => void handleMoveItem(itemId, direction)}
          />
        )}

        {/* Modals and Panels */}
        <RoomModal
          visible={roomModalVisible}
          room={editingRoom}
          onClose={handleRoomModalClose}
          onSuccess={() => {
            loadRooms();
            loadInventoryItems();
          }}
        />

        <RoomDetailPanel
          visible={roomDetailVisible}
          room={editingRoom}
          onClose={handleRoomDetailClose}
          onRoomUpdated={setEditingRoom}
          onSuccess={() => {
            loadRooms();
            loadInventoryItems();
          }}
        />

        <InventoryItemModal
          visible={itemModalVisible}
          roomId={selectedRoomIdForItem}
          rooms={rooms}
          onClose={handleItemModalClose}
        />

        <InventoryItemDetailPanel
          visible={itemDetailVisible}
          item={selectedItem}
          rooms={rooms}
          onClose={handleItemDetailClose}
        />
      </Layout.Content>
    </Layout>
  );
};
