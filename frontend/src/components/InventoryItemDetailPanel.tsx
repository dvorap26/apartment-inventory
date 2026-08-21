import { Drawer, Form, Input, Select, Button, Image, message, Space, Popconfirm, Upload, List } from 'antd';
import { DeleteOutlined, EditOutlined, DownloadOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useStorage } from '../contexts/StorageContext';
import type { InventoryItem, Room } from '../services/tableStorageService';
import { useEffect, useState } from 'react';
import type { RcFile } from 'antd/es/upload/interface';
import { useLanguage } from '../contexts/LanguageContext';

interface InventoryItemDetailPanelProps {
  visible: boolean;
  item: InventoryItem | null;
  rooms: Room[];
  onClose: () => void;
}

export const InventoryItemDetailPanel = ({
  visible,
  item,
  rooms,
  onClose,
}: InventoryItemDetailPanelProps) => {
  const { updateInventoryItem, deleteInventoryItem, blobService } = useStorage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [pictureIndex, setPictureIndex] = useState(0);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    setPictureIndex(0);
  }, [item?.itemId]);

  useEffect(() => {
    form.setFieldsValue({
      itemName: item?.itemName,
      description: item?.description,
      roomId: item?.roomId,
    });
    setIsEditing(false);
  }, [form, item]);

  useEffect(() => {
    const pictureId = item?.pictureIds[pictureIndex];
    if (!pictureId || !blobService) {
      setPictureUrl(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;
    void blobService.getPicturePreviewUrl(pictureId).then((url) => {
      objectUrl = url;
      if (active) {
        setPictureUrl(url);
      } else {
        URL.revokeObjectURL(url);
      }
    });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [blobService, item?.pictureIds, pictureIndex]);

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
      message.success(t('itemUpdated'));
      setIsEditing(false);
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
      message.success(t('itemDeleted'));
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPictures = async (files: RcFile[]) => {
    if (!item || !blobService) {
      message.error('Service not initialized');
      return;
    }
    try {
      setUploadingPicture(true);
      const uploadedPictureIds = await Promise.all(
        files.map((file) => blobService.uploadPicture(item.itemId, new File([file], file.name)))
      );
      const updatedPictureIds = [...item.pictureIds, ...uploadedPictureIds];
      await updateInventoryItem(
        item.itemId,
        item.itemName,
        item.description,
        item.roomId,
        updatedPictureIds,
        item.attachmentIds
      );
      message.success('Picture uploaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload picture';
      message.error(errorMessage);
    } finally {
      setUploadingPicture(false);
    }
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
      const url = await blobService.getPicturePreviewUrl(pictureId);
      window.open(url, '_blank');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
      title={isEditing ? t('editItem') : t('itemDetails')}
      placement="right"
      onClose={onClose}
      open={visible}
      width={500}
    >
      {item && (
        <Form
          form={form}
          layout="vertical"
        >
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 'bold' }}>{t('itemId')}</label>
            <p>{item.itemId}</p>
          </div>

          <Form.Item
            name="itemName"
            label={t('itemName')}
            rules={[{ required: true, message: t('itemNameRequired') }]}
          >
            <Input disabled={!isEditing} />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('description')}
          >
            <Input.TextArea disabled={!isEditing} rows={3} />
          </Form.Item>

          <Form.Item
            name="roomId"
            label={t('room')}
            rules={[{ required: true, message: t('roomRequired') }]}
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
                  {t('pictures')} ({item.pictureIds.length})
                </label>
                {item.pictureIds.length > 0 ? (
                  <div style={{ textAlign: 'center' }}>
                    {pictureUrl && (
                      <Image
                        alt={getPictureFileName(item.pictureIds[pictureIndex])}
                        src={pictureUrl}
                        style={{ maxHeight: 280, maxWidth: '100%', objectFit: 'contain' }}
                      />
                    )}
                    <Space style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                      <Button
                        aria-label={t('previousPicture')}
                        disabled={pictureIndex === 0}
                        icon={<LeftOutlined />}
                        onClick={() => setPictureIndex((index) => index - 1)}
                      />
                      <span>{pictureIndex + 1} / {item.pictureIds.length}</span>
                      <Button
                        aria-label={t('nextPicture')}
                        disabled={pictureIndex === item.pictureIds.length - 1}
                        icon={<RightOutlined />}
                        onClick={() => setPictureIndex((index) => index + 1)}
                      />
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadPicture(item.pictureIds[pictureIndex])}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeletePicture(item.pictureIds[pictureIndex])}
                      />
                    </Space>
                  </div>
                ) : (
                  <p style={{ color: '#999' }}>{t('noPictures')}</p>
                )}
                <Upload
                  beforeUpload={(file, fileList) => {
                    if (file === fileList[0]) {
                      void handleUploadPictures(fileList as RcFile[]);
                    }
                    return false;
                  }}
                  multiple
                  accept="image/*"
                  style={{ marginTop: '8px' }}
                >
                  <Button loading={uploadingPicture}>{t('uploadPicture')}</Button>
                </Upload>
                <Upload
                  beforeUpload={(file) => {
                    void handleUploadPictures([file]);
                    return false;
                  }}
                  maxCount={1}
                  accept="image/*"
                  capture="environment"
                  style={{ marginTop: '8px', marginLeft: '8px' }}
                >
                  <Button loading={uploadingPicture}>{t('takePicture')}</Button>
                </Upload>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                  {t('attachments')} ({item.attachmentIds.length})
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
                  <p style={{ color: '#999' }}>{t('noAttachments')}</p>
                )}
                <Upload
                  beforeUpload={handleUploadAttachment}
                  maxCount={1}
                  accept=".pdf"
                  style={{ marginTop: '8px' }}
                >
                  <Button loading={uploadingAttachment}>{t('uploadPdf')}</Button>
                </Upload>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 'bold' }}>{t('created')}</label>
                <p>{new Date(item.createdAt).toLocaleString(language === 'cs' ? 'cs-CZ' : 'en-US')}</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 'bold' }}>{t('lastModified')}</label>
                <p>{new Date(item.lastModifiedAt).toLocaleString(language === 'cs' ? 'cs-CZ' : 'en-US')}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>{t('by')} {item.lastModifiedBy}</p>
              </div>
            </>
          )}

          <Space>
            {!isEditing && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                {t('edit')}
              </Button>
            )}
            {isEditing && (
              <>
                <Button type="primary" loading={loading} onClick={handleEdit}>
                  {t('save')}
                </Button>
                <Button onClick={() => setIsEditing(false)}>{t('cancel')}</Button>
              </>
            )}
            {!isEditing && (
              <Popconfirm
                title={t('deleteItem')}
                description={t('confirmDeleteItem')}
                onConfirm={handleDelete}
                okText={t('yes')}
                cancelText={t('no')}
              >
                <Button danger icon={<DeleteOutlined />}>
                  {t('delete')}
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Form>
      )}
    </Drawer>
  );
};