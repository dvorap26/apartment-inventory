import { Button, message, Modal, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { pdf } from '@react-pdf/renderer';
import { InventoryPDF } from './InventoryPDF';
import { useStorage } from '../contexts/StorageContext';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const ExportButton = () => {
  const { rooms, inventoryItems, blobService } = useStorage();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { language, t } = useLanguage();

  const handleExportPDF = async () => {
    if (rooms.length === 0) {
      message.warning(t('noRoomsToExport'));
      return;
    }

    const pictureUrls: { [key: string]: string } = {};

    try {
      setLoading(true);
      setModalVisible(true);

      // Collect all picture URLs
      // Get URLs for all pictures
      for (const item of inventoryItems) {
        for (const pictureId of item.pictureIds) {
          if (blobService && !pictureUrls[pictureId]) {
            try {
              const url = await blobService.getPicturePreviewUrl(pictureId);
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
        language={language}
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

      message.success(t('pdfExported'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export PDF';
      message.error(errorMessage);
      console.error('Export error:', error);
    } finally {
      Object.values(pictureUrls).forEach((url) => URL.revokeObjectURL(url));
      setLoading(false);
      setModalVisible(false);
    }
  };

  return (
    <>
      <Button
        className="export-button"
        icon={<DownloadOutlined />}
        onClick={handleExportPDF}
        loading={loading}
        disabled={rooms.length === 0}
      >
        <span className="button-label">{t('exportPdf')}</span>
      </Button>

      <Modal
        title={t('generatingPdf')}
        open={modalVisible}
        footer={null}
        closable={false}
        centered
      >
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin size="large" tip={t('preparingExport')} />
        </div>
      </Modal>
    </>
  );
};
