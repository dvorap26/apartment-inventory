import { Drawer, Form, Input, Select, Button, message, Space, Popconfirm, Upload, List, message as antdMessage, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import { useStorage } from '../../contexts/StorageContext';
import { InventoryItem, Room } from '../../services/tableStorageService';
import { useState, useEffect } from 'react';
import type { RcFile } from 'antd/es/upload/interface';

interface InventoryItemDetailPanelProps {
  visible: boolean;
  item: InventoryItem | null;
  rooms: Room[];
  onClose: () => void;
  onSuccess: () => void;
}

export const InventoryItemDetailPanel = ({
  visible,
  item,
  rooms,
  onClose,
  onSuccess,
}: InventoryItemDetailPanelProps) => {
  const { updateInventoryItem, deleteInventoryItem, blobService } = useStorage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [pictureUrls, setPictureUrls] = useState<{ [key: string]: string }>({});
  const [attachmentUrls, setAttachmentUrls] = useState<{ [key: string]: string }>({});
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const handleEdit = async () => {
    if (!item) return;
    const values = await form.validateFields();
    try {
      setLoading(true);
      await updateInventoryItem(
        item.itemId,
        values.itemName,
        values.description,
        values.roomId,
        item.pictureIds,
        item.attachmentIds
      );
      message.success('Item updated successfully');
      setIsEditing(false);
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      setLoading(true);
      await deleteInventoryItem(item.itemId);
      message.success('Item deleted successfully');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPicture = async (file: RcFile) => {
    if (!item || !blobService) {
      message.error('Service not initialized');
      return false;
    }
    try {
      setUploadingPicture(true);
      const blobName = await blobService.uploadPicture(item.itemId, new File([file], file.name));
      const updatedPictureIds = [...item.pictureIds, blobName];
      await updateInventoryItem(
        item.itemId,
        item.itemName,
        item.description,
        item.roomId,
        updatedPictureIds,
        item.attachmentIds
      );
      message.success('Picture uploaded successfully');
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload picture';
      message.error(errorMessage);
    } finally {
      setUploadingPicture(false);
    }
    return false;
  };

  const handleDeletePicture = async (pictureId: string) => {
    if (!item || !blobService) return;
    try {
      await blobService.deletePicture(pictureId);
      const updatedPictureIds = item.pictureIds.filter(id => id !== pictureId);
      await updateInventoryItem(
        item.itemId,
        item.itemName,
        item.description,
        item.roomId,
        updatedPictureIds,
        item.attachmentIds
      );
      message.success('Picture deleted successfully');
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete picture';
      message.error(errorMessage);
    }
  };

  const handleUploadAttachment = async (file: RcFile) => {
    if (!item || !blobService) {
      message.error('Service not initialized');
      return false;
    }
    try {
      setUploadingAttachment(true);
      const blobName = await blobService.uploadAttachment(item.itemId, new File([file], file.name));
      const updatedAttachmentIds = [...item.attachmentIds, blobName];
      await updateInventoryItem(
        item.itemId,
        item.itemName,
        item.description,
        item.roomId,
        item.pictureIds,
        updatedAttachmentIds
      );
      message.success('Attachment uploaded successfully');
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload attachment';
      message.error(errorMessage);
    } finally {
      setUploadingAttachment(false);
    }
    return false;
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!item || !blobService) return;
    try {
      await blobService.deleteAttachment(attachmentId);
      const updatedAttachmentIds = item.attachmentIds.filter(id => id !== attachmentId);
      await updateInventoryItem(
        item.itemId,
        item.itemName,
        item.description,
        item.roomId,
        item.pictureIds,
        updatedAttachmentIds
      );
      message.success('Attachment deleted successfully');
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete attachment';
      message.error(errorMessage);
    }
  };

  const getPictureFileName = (blobName: string) => {
    return blobName.split('/').pop() || blobName;
  };

  const handleDownloadPicture = async (pictureId: string) => {
    if (!blobService) return;
    try {
      const url = await blobService.getPictureUrl(pictureId);
      window.open(url, '_blank');
    } catch (error) {
      message.error('Failed to download picture');
    }
  };

  const handleDownloadAttachment = async (attachmentId: string) => {
    if (!blobService) return;
    try {
      const url = await blobService.getAttachmentUrl(attachmentId);
      window.open(url, '_blank');
    } catch (error) {
      message.error('Failed to download attachment');
    }
  };

  return (
    <Drawer
      title={isEditing ? 'Edit Item' : 'Item Details'}
      placement="right"
      onClose={onClose}
      open={visible}
      width={500}
    >
      {item && (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            itemName: item.itemName,
            description: item.description,
            roomId: item.roomId,
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 'bold' }}>Item ID:</label>
            <p>{item.itemId}</p>
          </div>

          <Form.Item
            name="itemName"
            label="Item Name"
            rules={[{ required: true, message: 'Item name is required' }]}
          >
            <Input disabled={!isEditing} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Description is required' }]}
          >
            <Input.TextArea disabled={!isEditing} rows={3} />
          </Form.Item>

          <Form.Item
            name="roomId"
            label="Room"
            rules={[{ required: true, message: 'Room is required' }]}
          >
            <Select disabled={!isEditing}>
              {rooms.map(room => (
                <Select.Option key={room.roomId} value={room.roomId}>
                  {room.roomName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {!isEditing && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  Pictures ({item.pictureIds.length})
                </label>
                {item.pictureIds.length > 0 ? (
                  <List
                    dataSource={item.pictureIds}
                    renderItem={(pictureId) => (
                      <List.Item
                        key={pictureId}
                        actions={[
                          <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={() => handleDownloadPicture(pictureId)}
                          />,
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleDeletePicture(pictureId)}
                          />,
                        ]}
                      >
                        {getPictureFileName(pictureId)}
                      </List.Item>
                    )}
                  />
                ) : (
                  <p style={{ color: '#999' }}>No pictures yet</p>
                )}
                <Upload
                  beforeUpload={handleUploadPicture}
                  maxCount={1}
                  style={{ marginTop: '8px' }}
                >
                  <Button loading={uploadingPicture}>Upload Picture</Button>
                </Upload>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  Attachments ({item.attachmentIds.length})
                </label>
                {item.attachmentIds.length > 0 ? (
                  <List
                    dataSource={item.attachmentIds}
                    renderItem={(attachmentId) => (
                      <List.Item
                        key={attachmentId}
                        actions={[
                          <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={() => handleDownloadAttachment(attachmentId)}
                          />,
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleDeleteAttachment(attachmentId)}
                          />,
                        ]}
                      >
                        {getPictureFileName(attachmentId)}
                      </List.Item>
                    )}
                  />
                ) : (
                  <p style={{ color: '#999' }}>No attachments yet</p>
                )}
                <Upload
                  beforeUpload={handleUploadAttachment}
                  maxCount={1}
                  accept=".pdf"
                  style={{ marginTop: '8px' }}
                >
                  <Button loading={uploadingAttachment}>Upload PDF</Button>
                </Upload>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 'bold' }}>Created:</label>
                <p>{new Date(item.createdAt).toLocaleString()}</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 'bold' }}>Last Modified:</label>
                <p>{new Date(item.lastModifiedAt).toLocaleString()}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>by {item.lastModifiedBy}</p>
              </div>
            </>
          )}

          <Space>
            {!isEditing && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
            {isEditing && (
              <>
                <Button type="primary" loading={loading} onClick={handleEdit}>
                  Save
                </Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </>
            )}
            {!isEditing && (
              <Popconfirm
                title="Delete Item?"
                description="Are you sure you want to delete this item?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Form>
      )}
    </Drawer>
  );
};