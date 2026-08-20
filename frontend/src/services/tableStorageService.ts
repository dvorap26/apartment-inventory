import { TableClient } from "@azure/data-tables";
import type { TableEntity } from "@azure/data-tables";
import { storageConfig } from "../config/authConfig";

export interface Room {
  roomId: string;
  roomName: string;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
}

export interface InventoryItem {
  itemId: string;
  itemName: string;
  description: string;
  roomId: string;
  pictureIds: string[];
  attachmentIds: string[];
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
}

export class TableStorageService {
  private roomsClient: TableClient | null = null;
  private inventoryClient: TableClient | null = null;
  private accessToken: string | null = null;
  private getAccessToken: (scopes?: string[]) => Promise<string>;

  constructor(getAccessToken: (scopes?: string[]) => Promise<string>) {
    this.getAccessToken = getAccessToken;
  }

  async initialize(): Promise<void> {
    try {
      this.accessToken = await this.getAccessToken();
      
      // Initialize table clients with bearer token
      const tablesEndpoint = storageConfig.tablesEndpoint;
      
      this.roomsClient = new TableClient(
        tablesEndpoint,
        "rooms",
        new BearerTokenAuthCredential(this.accessToken)
      );
      
      this.inventoryClient = new TableClient(
        tablesEndpoint,
        "inventoryItems",
        new BearerTokenAuthCredential(this.accessToken)
      );
    } catch (error) {
      console.error("Failed to initialize table storage service:", error);
      throw error;
    }
  }

  async getRooms(): Promise<Room[]> {
    if (!this.roomsClient) throw new Error("Table storage not initialized");
    
    try {
      const rooms: Room[] = [];
      for await (const entity of this.roomsClient.listEntities<Room>()) {
        rooms.push(this.mapRoomEntity(entity));
      }
      return rooms;
    } catch (error) {
      console.error("Failed to get rooms:", error);
      throw error;
    }
  }

  async getRoom(roomId: string): Promise<Room | null> {
    if (!this.roomsClient) throw new Error("Table storage not initialized");
    
    try {
      const room = await this.roomsClient.getEntity<Room>(roomId, roomId);
      return this.mapRoomEntity(room);
    } catch (error) {
      if ((error as any).code === "ResourceNotFound") {
        return null;
      }
      console.error("Failed to get room:", error);
      throw error;
    }
  }

  async createRoom(roomName: string, lastModifiedBy: string): Promise<Room> {
    if (!this.roomsClient) throw new Error("Table storage not initialized");
    
    // Check for duplicate room names
    const existingRooms = await this.getRooms();
    if (existingRooms.some(r => r.roomName.toLowerCase() === roomName.toLowerCase())) {
      throw new Error("Room with this name already exists");
    }

    const roomId = this.generateId();
    const now = new Date().toISOString();
    
    const room: Room = {
      roomId,
      roomName,
      createdAt: now,
      lastModifiedAt: now,
      lastModifiedBy
    };

    try {
      await this.roomsClient.createEntity(this.toRoomEntity(room));
      return room;
    } catch (error) {
      console.error("Failed to create room:", error);
      throw error;
    }
  }

  async updateRoom(roomId: string, roomName: string, lastModifiedBy: string): Promise<Room> {
    if (!this.roomsClient) throw new Error("Table storage not initialized");
    
    // Check for duplicate room names (excluding current room)
    const existingRooms = await this.getRooms();
    if (existingRooms.some(r => r.roomId !== roomId && r.roomName.toLowerCase() === roomName.toLowerCase())) {
      throw new Error("Room with this name already exists");
    }

    const existingRoom = await this.getRoom(roomId);
    if (!existingRoom) throw new Error("Room not found");

    const updatedRoom: Room = {
      ...existingRoom,
      roomName,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy
    };

    try {
      await this.roomsClient.updateEntity(this.toRoomEntity(updatedRoom));
      return updatedRoom;
    } catch (error) {
      console.error("Failed to update room:", error);
      throw error;
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    if (!this.roomsClient || !this.inventoryClient) throw new Error("Table storage not initialized");
    
    // Check if room has any items
    const items = await this.getInventoryItemsByRoom(roomId);
    if (items.length > 0) {
      throw new Error("Cannot delete room with inventory items");
    }

    try {
      await this.roomsClient.deleteEntity(roomId, roomId);
    } catch (error) {
      console.error("Failed to delete room:", error);
      throw error;
    }
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    if (!this.inventoryClient) throw new Error("Table storage not initialized");
    
    try {
      const items: InventoryItem[] = [];
      for await (const entity of this.inventoryClient.listEntities<InventoryItem>()) {
        items.push(this.mapInventoryItemEntity(entity));
      }
      return items;
    } catch (error) {
      console.error("Failed to get inventory items:", error);
      throw error;
    }
  }

  async getInventoryItemsByRoom(roomId: string): Promise<InventoryItem[]> {
    const allItems = await this.getInventoryItems();
    return allItems.filter(item => item.roomId === roomId);
  }

  async getInventoryItem(itemId: string): Promise<InventoryItem | null> {
    if (!this.inventoryClient) throw new Error("Table storage not initialized");
    
    try {
      const item = await this.inventoryClient.getEntity<InventoryItem>(itemId, itemId);
      return this.mapInventoryItemEntity(item);
    } catch (error) {
      if ((error as any).code === "ResourceNotFound") {
        return null;
      }
      console.error("Failed to get inventory item:", error);
      throw error;
    }
  }

  async createInventoryItem(
    itemName: string,
    description: string,
    roomId: string,
    lastModifiedBy: string
  ): Promise<InventoryItem> {
    if (!this.inventoryClient) throw new Error("Table storage not initialized");
    
    const itemId = this.generateId();
    const now = new Date().toISOString();
    
    const item: InventoryItem = {
      itemId,
      itemName,
      description,
      roomId,
      pictureIds: [],
      attachmentIds: [],
      createdAt: now,
      lastModifiedAt: now,
      lastModifiedBy
    };

    try {
      await this.inventoryClient.createEntity(this.toInventoryItemEntity(item));
      return item;
    } catch (error) {
      console.error("Failed to create inventory item:", error);
      throw error;
    }
  }

  async updateInventoryItem(
    itemId: string,
    itemName: string,
    description: string,
    roomId: string,
    pictureIds: string[],
    attachmentIds: string[],
    lastModifiedBy: string
  ): Promise<InventoryItem> {
    if (!this.inventoryClient) throw new Error("Table storage not initialized");
    
    const existingItem = await this.getInventoryItem(itemId);
    if (!existingItem) throw new Error("Item not found");

    const updatedItem: InventoryItem = {
      ...existingItem,
      itemName,
      description,
      roomId,
      pictureIds,
      attachmentIds,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy
    };

    try {
      await this.inventoryClient.updateEntity(this.toInventoryItemEntity(updatedItem));
      return updatedItem;
    } catch (error) {
      console.error("Failed to update inventory item:", error);
      throw error;
    }
  }

  async deleteInventoryItem(itemId: string): Promise<void> {
    if (!this.inventoryClient) throw new Error("Table storage not initialized");
    
    try {
      await this.inventoryClient.deleteEntity(itemId, itemId);
    } catch (error) {
      console.error("Failed to delete inventory item:", error);
      throw error;
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private toRoomEntity(room: Room): TableEntity<Room> {
    return {
      ...room,
      partitionKey: room.roomId,
      rowKey: room.roomId
    };
  }

  private mapRoomEntity(entity: Room & { partitionKey?: string; rowKey?: string }): Room {
    const { partitionKey: _partitionKey, rowKey: _rowKey, ...room } = entity;
    return room;
  }

  private toInventoryItemEntity(item: InventoryItem): TableEntity<InventoryItem> {
    return {
      ...item,
      partitionKey: item.itemId,
      rowKey: item.itemId
    };
  }

  private mapInventoryItemEntity(
    entity: InventoryItem & { partitionKey?: string; rowKey?: string }
  ): InventoryItem {
    const { partitionKey: _partitionKey, rowKey: _rowKey, ...item } = entity;
    return item;
  }
}

// Custom bearer token credential for MSAL
class BearerTokenAuthCredential {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getToken(): Promise<{ token: string; expiresOnTimestamp: number }> {
    return {
      token: this.token,
      expiresOnTimestamp: Date.now() + 3600000 // 1 hour
    };
  }
}