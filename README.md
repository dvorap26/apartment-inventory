# Apartment Inventory

A full-stack apartment inventory management application.

## Project Structure

```
apartment-inventory/
├── frontend/   # React + TypeScript + Vite + Ant Design
└── backend/    # Node.js + Express + TypeScript + Azure Blob Storage
```

## Frontend

Built with [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/), and [Ant Design](https://ant.design/).

### Setup

```bash
cd frontend
npm install
cp .env.example .env    # configure VITE_API_BASE_URL
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3001` |

## Backend

Built with [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), and [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs).

### Setup

```bash
cd backend
npm install
cp .env.example .env    # configure Azure credentials
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage connection string |
| `AZURE_STORAGE_CONTAINER_NAME` | Blob container name (default: `apartment-inventory`) |
| `PORT` | Server port (default: `3001`) |

### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/items` | List all inventory items |
| `POST` | `/api/items` | Upload a new item |
| `DELETE` | `/api/items/:name` | Delete an item by name |