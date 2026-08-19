import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'apartment-inventory';

export function getBlobServiceClient(): BlobServiceClient {
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  }
  return BlobServiceClient.fromConnectionString(connectionString);
}

export async function getContainerClient(): Promise<ContainerClient> {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
}

export async function uploadBlob(blobName: string, data: Buffer, contentType: string): Promise<string> {
  const containerClient = await getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(data, data.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blockBlobClient.url;
}

export async function deleteBlob(blobName: string): Promise<void> {
  const containerClient = await getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}

export async function listBlobs(): Promise<string[]> {
  const containerClient = await getContainerClient();
  const names: string[] = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    names.push(blob.name);
  }
  return names;
}
