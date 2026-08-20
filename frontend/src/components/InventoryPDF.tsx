import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { Room, InventoryItem } from '../services/tableStorageService';
import type { Language } from '../contexts/LanguageContext';

// Register font for better PDF rendering
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  roomSection: {
    marginBottom: 20,
    pageBreakInside: 'avoid',
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  itemContainer: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 10,
    marginBottom: 8,
    color: '#555',
  },
  picturesContainer: {
    marginTop: 8,
  },
  picturesLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  pictureWrapper: {
    marginBottom: 10,
    pageBreakInside: 'avoid',
  },
  picture: {
    width: 200,
    height: 150,
    marginBottom: 5,
  },
  pictureName: {
    fontSize: 8,
    color: '#666',
  },
  noItems: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
  },
});

interface InventoryPDFProps {
  rooms: Room[];
  inventoryItems: InventoryItem[];
  pictureUrls?: { [key: string]: string };
  language: Language;
}

export const InventoryPDF = ({ rooms, inventoryItems, pictureUrls = {}, language }: InventoryPDFProps) => {
  const labels = language === 'cs'
    ? { title: 'Inventar bytu', pictures: 'Fotografie', noItems: 'V teto mistnosti nejsou zadne polozky', generated: 'Vygenerovano' }
    : { title: 'Apartment Inventory', pictures: 'Pictures', noItems: 'No items in this room', generated: 'Generated on' };
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{labels.title}</Text>

        {rooms.map((room) => {
          const roomItems = inventoryItems.filter(item => item.roomId === room.roomId);

          return (
            <View key={room.roomId} style={styles.roomSection}>
              <Text style={styles.roomTitle}>{room.roomName}</Text>

              {roomItems.length > 0 ? (
                roomItems.map((item) => (
                  <View key={item.itemId} style={styles.itemContainer}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>

                    {item.pictureIds.length > 0 && (
                      <View style={styles.picturesContainer}>
                        <Text style={styles.picturesLabel}>
                          {labels.pictures} ({item.pictureIds.length})
                        </Text>
                        {item.pictureIds.map((pictureId, index) => {
                          const pictureName = pictureId.split('/').pop() || `Picture ${index + 1}`;
                          const imageUrl = pictureUrls[pictureId];

                          return (
                            <View key={pictureId} style={styles.pictureWrapper}>
                              {imageUrl && (
                                <Image
                                  src={imageUrl}
                                  style={styles.picture}
                                />
                              )}
                              <Text style={styles.pictureName}>{pictureName}</Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noItems}>{labels.noItems}</Text>
              )}
            </View>
          );
        })}

        <Text style={styles.timestamp}>
          {labels.generated} {new Date().toLocaleString(language)}
        </Text>
      </Page>
    </Document>
  );
};
