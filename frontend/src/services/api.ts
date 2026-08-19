const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface InventoryItem {
  name: string;
}

export async function fetchItems(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/items`);
  if (!res.ok) throw new Error('Failed to fetch items');
  const data = await res.json();
  return (data.items as string[]).map((name) => ({ name }));
}

export async function uploadItem(name: string, file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  );
  const res = await fetch(`${API_BASE_URL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, data: base64, contentType: file.type }),
  });
  if (!res.ok) throw new Error('Failed to upload item');
  const data = await res.json();
  return data.url as string;
}

export async function deleteItem(name: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/items/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete item');
}
