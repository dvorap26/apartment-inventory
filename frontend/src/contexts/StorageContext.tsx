import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { TableStorageService } from '../services/tableStorageService';
import type { Room, InventoryItem } from '../services/tableStorageService';
import { BlobStorageService } from '../services/blobStorageService';
import { useAuth } from './AuthContext';

interface StorageContextType {
  tableService: TableStorageService | null;
  blobService: BlobStorageService | null;
  isInitialized: boolean;
  rooms: Room[];
  inventoryItems: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  loadRooms: () => Promise<void>;
  loadInventoryItems: () => Promise<void>;
  createRoom: (roomName: string) => Promise<Room>;
  updateRoom: (roomId: string, roomName: string) => Promise<Room>;
  deleteRoom: (roomId: string) => Promise<void>;
  createInventoryItem: (itemName: string, description: string, roomId: string) => Promise<InventoryItem>;
  updateInventoryItem: (itemId: string, itemName: string, description: string, roomId: string, pictureIds: string[], attachmentIds: string[]) => Promise<InventoryItem>;
  deleteInventoryItem: (itemId: string) => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider = ({ children }: { children: ReactNode }) => {
  const { getAccessToken, account, isAuthenticated } = useAuth();
  const [tableService, setTableService] = useState<TableStorageService | null>(null);
  const [blobService, setBlobService] = useState<BlobStorageService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      if (!isAuthenticated || !account) return;

      try {
        setIsLoading(true);
        setError(null);

        const accessToken = await getAccessToken();
        
        const tableServiceInstance = new TableStorageService(getAccessToken);
        await tableServiceInstance.initialize();
        setTableService(tableServiceInstance);

        const blobServiceInstance = new BlobStorageService(accessToken);
        await blobServiceInstance.initialize();
        setBlobService(blobServiceInstance);

        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize storage services';
        setError(errorMessage);
        console.error('Storage initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeServices();
  }, [isAuthenticated, account, getAccessToken]);

  // Load initial data
  useEffect(() => {
    if (isInitialized && tableService) {
      loadRooms();
      loadInventoryItems();
    }
  }, [isInitialized]);

  const loadRooms = async () => {
    if (!tableService) return;

    try {
      setIsLoading(true);
      setError(null);
      const roomsList = await tableService.getRooms();
      setRooms(roomsList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rooms';
      setError(errorMessage);
      console.error('Load rooms error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    if (!tableService) return;

    try {
      setIsLoading(true);
      setError(null);
      const items = await tableService.getInventoryItems();
      setInventoryItems(items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory items';
      setError(errorMessage);
      console.error('Load inventory items error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async (roomName: string): Promise<Room> => {
    if (!tableService || !account) throw new Error('Storage not initialized');

    try {
      const newRoom = await tableService.createRoom(roomName, account.name || 'Unknown');
      setRooms([...rooms, newRoom]);
      return newRoom;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      throw err;
    }
  };

  const updateRoom = async (roomId: string, roomName: string): Promise<Room> => {
    if (!tableService || !account) throw new Error('Storage not initialized');

    try {
      const updatedRoom = await tableService.updateRoom(roomId, roomName, account.name || 'Unknown');
      setRooms(rooms.map(r => r.roomId === roomId ? updatedRoom : r));
      return updatedRoom;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update room';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteRoom = async (roomId: string): Promise<void> => {
    if (!tableService) throw new Error('Storage not initialized');

    try {
      await tableService.deleteRoom(roomId);
      setRooms(rooms.filter(r => r.roomId !== roomId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete room';
      setError(errorMessage);
      throw err;
    }
  };

  const createInventoryItem = async (itemName: string, description: string, roomId: string): Promise<InventoryItem> => {
    if (!tableService || !account) throw new Error('Storage not initialized');

    try {
      const newItem = await tableService.createInventoryItem(itemName, description, roomId, account.name || 'Unknown');
      setInventoryItems([...inventoryItems, newItem]);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create inventory item';
      setError(errorMessage);
      throw err;
    }
  };

  const updateInventoryItem = async (
    itemId: string,
    itemName: string,
    description: string,
    roomId: string,
    pictureIds: string[],
    attachmentIds: string[]
  ): Promise<InventoryItem> => {
    if (!tableService || !account) throw new Error('Storage not initialized');

    try {
      const updatedItem = await tableService.updateInventoryItem(
        itemId,
        itemName,
        description,
        roomId,
        pictureIds,
        attachmentIds,
        account.name || 'Unknown'
      );
      setInventoryItems(inventoryItems.map(i => i.itemId === itemId ? updatedItem : i));
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inventory item';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteInventoryItem = async (itemId: string): Promise<void> => {
    if (!tableService) throw new Error('Storage not initialized');

    try {
      await tableService.deleteInventoryItem(itemId);
      setInventoryItems(inventoryItems.filter(i => i.itemId !== itemId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete inventory item';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <StorageContext.Provider
      value={{
        tableService,
        blobService,
        isInitialized,
        rooms,
        inventoryItems,
        isLoading,
        error,
        loadRooms,
        loadInventoryItems,
        createRoom,
        updateRoom,
        deleteRoom,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};
