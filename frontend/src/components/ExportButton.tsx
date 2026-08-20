import { Button, message, Space, Modal, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { pdf } from '@react-pdf/renderer';
import { InventoryPDF } from './InventoryPDF';
import { useStorage } from '../contexts/StorageContext';
import { useState } from 'react';

export const ExportButton = () => {
  const { rooms, inventoryItems, blobService } = useStorage();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleExportPDF = async () => {
    if (rooms.length === 0) {
      message.warning('No rooms to export');
      return;
    }

    try {
      setLoading(true);
      setModalVisible(true);

      // Collect all picture URLs
      const pictureUrls: { [key: string]: string } = {};

      // Get URLs for all pictures
      for (const item of inventoryItems) {
        for (const pictureId of item.pictureIds) {
          if (blobService && !pictureUrls[pictureId]) {
            try {
              const url = await blobService.getPictureUrl(pictureId);
              pictureUrls[pictureId] = url;
            } catch (error) {
              console.warn(`Failed to get URL for picture ${pictureId}:`, error);
            }
          }
        }
      }

      // Generate PDF
      const doc = <InventoryPDF
        rooms={rooms}
        inventoryItems={inventoryItems}
        pictureUrls={pictureUrls}
      />;

      const blob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `apartment-inventory-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success('PDF exported successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export PDF';
      message.error(errorMessage);
      console.error('Export error:', error);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  return (
    <>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleExportPDF}
        loading={loading}
        disabled={rooms.length === 0}
      >
        Export to PDF
      </Button>

      <Modal
        title="Generating PDF"
        open={modalVisible}
        footer={null}
        closable={false}
        centered
      >
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin size="large" tip="Preparing your inventory export..." />
        </div>
      </Modal>
    </>
  );
};
