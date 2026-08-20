import { BlobServiceClient } from "@azure/storage-blob";
import { storageConfig } from "../config/authConfig";

export class BlobStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async initialize(): Promise<void> {
    try {
      this.blobServiceClient = new BlobServiceClient(
        storageConfig.blobsEndpoint,
        new BearerTokenAuthCredential(this.accessToken)
      );
    } catch (error) {
      console.error("Failed to initialize blob storage service:", error);
      throw error;
    }
  }

  async uploadPicture(itemId: string, file: File): Promise<string> {
    if (!this.blobServiceClient) throw new Error("Blob storage not initialized");

    const containerName = "inventory-pictures";
    const blobName = `${itemId}/${file.name}`;

    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(file, file.size);
      return blobName;
    } catch (error) {
      console.error("Failed to upload picture:", error);
      throw error;
    }
  }

  async uploadAttachment(itemId: string, file: File): Promise<string> {
    if (!this.blobServiceClient) throw new Error("Blob storage not initialized");

    // Only allow PDF files
    if (file.type !== "application/pdf") {
      throw new Error("Only PDF files are allowed");
    }

    const containerName = "inventory-attachments";
    const blobName = `${itemId}/${file.name}`;

    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(file, file.size);
      return blobName;
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      throw error;
    }
  }

  async deletePicture(blobName: string): Promise<void> {
    if (!this.blobServiceClient) throw new Error("Blob storage not initialized");

    const containerName = "inventory-pictures";

    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
    } catch (error) {
      console.error("Failed to delete picture:", error);
      throw error;
    }
  }

  async deleteAttachment(blobName: string): Promise<void> {
    if (!this.blobServiceClient) throw new Error("Blob storage not initialized");

    const containerName = "inventory-attachments";

    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      throw error;
    }
  }

  async getPictureUrl(blobName: string): Promise<string> {
    if (!this.blobServiceClient) throw new Error("Blob storage not initialized");

    const containerName = "inventory-pictures";
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    return blockBlobClient.url;
  }

  async getPicturePreviewUrl(blobName: string): Promise<string> {
    if (!this.blobServiceClient) throw new Error("Blob storage not initialized");

    const containerClient = this.blobServiceClient.getContainerClient("inventory-pictures");
    const response = await containerClient.getBlockBlobClient(blobName).download();
    const blob = await response.blobBody;

    if (!blob) {
      throw new Error("Picture download did not return a body");
    }

    return URL.createObjectURL(blob);
  }

  async getAttachmentUrl(blobName: string): Promise<string> {
    if (!this.blobServiceClient) throw new Error("Blob storage not initialized");

    const containerName = "inventory-attachments";
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    return blockBlobClient.url;
  }

  renamePicture(oldBlobName: string, newFileName: string): string {
    const itemId = oldBlobName.split("/")[0];
    return `${itemId}/${newFileName}`;
  }

  renameAttachment(oldBlobName: string, newFileName: string): string {
    const itemId = oldBlobName.split("/")[0];
    return `${itemId}/${newFileName}`;
  }
}

// Custom bearer token credential for storage services
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