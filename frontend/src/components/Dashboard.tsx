import { Layout, Button, Space, message, Alert, Empty, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useStorage } from '../contexts/StorageContext';
import { Room, InventoryItem } from '../services/tableStorageService';
import { useState, useEffect } from 'react';
import { InventoryTable } from './InventoryTable';
import { RoomModal } from './RoomModal';
import { RoomDetailPanel } from './RoomDetailPanel';
import { InventoryItemModal } from './InventoryItemModal';
import { InventoryItemDetailPanel } from './InventoryItemDetailPanel';
import { ExportButton } from './ExportButton';

export const Dashboard = () => {
  const { rooms, inventoryItems, isLoading, error, loadRooms, loadInventoryItems } = useStorage();
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [roomDetailVisible, setRoomDetailVisible] = useState(false);
  const [itemDetailVisible, setItemDetailVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedRoomIdForItem, setSelectedRoomIdForItem] = useState<string | null>(null);

  // Refresh data
  const handleRefresh = async () => {
    try {
      await loadRooms();
      await loadInventoryItems();
      message.success('Data refreshed successfully');
    } catch (err) {
      message.error('Failed to refresh data');
    }
  };

  // Room operations
  const handleCreateRoom = () => {
    setEditingRoom(null);
    setRoomModalVisible(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomModalVisible(true);
    setRoomDetailVisible(false);
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
        <Layout.Content style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Spin size="large" tip="Loading inventory..." />
          </div>
        </Layout.Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100%' }}>
      <Layout.Content style={{ padding: '24px' }}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: '24px' }}
          />
        )}

        <div style={{ marginBottom: '24px' }}>
          <Space wrap>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateRoom}
            >
              Add Room
            </Button>
            <Button onClick={handleRefresh}>
              Refresh
            </Button>
            <ExportButton />
          </Space>
        </div>

        {rooms.length === 0 ? (
          <Alert
            message="No rooms created yet"
            description="Click 'Add Room' above to create your first room before adding inventory items."
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
          onEdit={handleEditRoom}
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
          onSuccess={() => {
            loadInventoryItems();
          }}
        />

        <InventoryItemDetailPanel
          visible={itemDetailVisible}
          item={selectedItem}
          rooms={rooms}
          onClose={handleItemDetailClose}
          onSuccess={() => {
            loadRooms();
            loadInventoryItems();
          }}
        />
      </Layout.Content>
    </Layout>
  );
};
