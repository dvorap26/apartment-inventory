import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'cs';

const translations = {
  en: {
    appTitle: 'Apartment Inventory',
    language: 'Language',
    english: 'English',
    czech: 'Cestina',
    loginWelcome: 'Welcome to Apartment Inventory',
    loginPrompt: 'Please sign in with your work account to continue',
    signIn: 'Sign in with Microsoft',
    logout: 'Logout',
    loggedOut: 'Logged out successfully',
    logoutFailed: 'Logout failed',
    addRoom: 'Add Room',
    addItem: 'Add Item',
    refresh: 'Refresh',
    refreshed: 'Data refreshed successfully',
    refreshFailed: 'Failed to refresh data',
    loadingInventory: 'Loading inventory...',
    error: 'Error',
    noRooms: 'No rooms created yet',
    noRoomsDescription: 'Click "Add Room" above to create your first room before adding inventory items.',
    noRoomsAvailable: 'No rooms available',
    noRoomsAvailableDescription: 'Please create a room first before adding inventory items.',
    noItems: 'No items in this room',
    items: 'items',
    itemName: 'Item Name',
    description: 'Description',
    room: 'Room',
    actions: 'Actions',
    view: 'View',
    createItem: 'Create New Inventory Item',
    itemCreated: 'Item created successfully',
    itemUpdated: 'Item updated successfully',
    itemDeleted: 'Item deleted successfully',
    itemNameRequired: 'Item name is required',
    itemNameEmpty: 'Item name cannot be empty',
    itemNameLength: 'Item name must be less than 100 characters',
    itemNamePlaceholder: 'Enter item name (e.g., Refrigerator)',
    descriptionPlaceholder: 'Enter item description',
    roomRequired: 'Room is required',
    selectRoom: 'Select a room',
    createRoom: 'Create New Room',
    editRoom: 'Edit Room',
    roomCreated: 'Room created successfully',
    roomUpdated: 'Room updated successfully',
    roomDeleted: 'Room deleted successfully',
    roomName: 'Room Name',
    roomNameRequired: 'Room name is required',
    roomNameEmpty: 'Room name cannot be empty',
    roomNameLength: 'Room name must be less than 100 characters',
    roomNamePlaceholder: 'Enter room name (e.g., Living Room, Kitchen)',
    create: 'Create',
    update: 'Update',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    yes: 'Yes',
    no: 'No',
    roomDetails: 'Room Details',
    itemDetails: 'Item Details',
    editItem: 'Edit Item',
    itemId: 'Item ID:',
    roomId: 'Room ID:',
    itemsInRoom: 'Items in this room:',
    created: 'Created:',
    lastModified: 'Last Modified:',
    by: 'by',
    deleteRoom: 'Delete Room?',
    deleteItem: 'Delete Item?',
    confirmDeleteRoom: 'Are you sure you want to delete this room?',
    confirmDeleteItem: 'Are you sure you want to delete this item?',
    roomHasItems: 'Room has inventory items',
    roomHasItemsDescription: 'This room contains {count} item(s) and cannot be deleted until they are moved or removed.',
    pictures: 'Pictures',
    previousPicture: 'Previous picture',
    nextPicture: 'Next picture',
    moveUp: 'Move up',
    moveDown: 'Move down',
    attachments: 'Attachments',
    noPictures: 'No pictures yet',
    noAttachments: 'No attachments yet',
    uploadPicture: 'Upload Picture',
    uploadPdf: 'Upload PDF',
    exportPdf: 'Export to PDF',
    generatingPdf: 'Generating PDF',
    preparingExport: 'Preparing your inventory export...',
    noRoomsToExport: 'No rooms to export',
    pdfExported: 'PDF exported successfully',
  },
  cs: {
    appTitle: 'Inventar bytu',
    language: 'Jazyk',
    english: 'English',
    czech: 'Čeština',
    loginWelcome: 'Vítejte v inventáři bytu',
    loginPrompt: 'Pro pokračování se přihlaste pracovním účtem',
    signIn: 'Přihlásit se pomocí Microsoftu',
    logout: 'Odhlásit se',
    loggedOut: 'Odhlášení proběhlo úspěšně',
    logoutFailed: 'Odhlášení se nezdařilo',
    addRoom: 'Přidat místnost',
    addItem: 'Přidat položku',
    refresh: 'Obnovit',
    refreshed: 'Data byla úspěšně obnovena',
    refreshFailed: 'Data se nepodařilo obnovit',
    loadingInventory: 'Načítám inventář...',
    error: 'Chyba',
    noRooms: 'Zatím nejsou vytvořeny žádné místnosti',
    noRoomsDescription: 'Před přidáním položek vytvořte místnost tlačítkem "Přidat místnost".',
    noRoomsAvailable: 'Nejsou k dispozici žádné místnosti',
    noRoomsAvailableDescription: 'Před přidáním položek inventáře nejprve vytvořte místnost.',
    noItems: 'V této místnosti nejsou žádné položky',
    items: 'polozek',
    itemName: 'Název položky',
    description: 'Popis',
    room: 'Místnost',
    actions: 'Akce',
    view: 'Zobrazit',
    createItem: 'Vytvořit novou položku inventáře',
    itemCreated: 'Položka byla úspěšně vytvořena',
    itemUpdated: 'Položka byla úspěšně upravena',
    itemDeleted: 'Položka byla úspěšně smazána',
    itemNameRequired: 'Název položky je povinný',
    itemNameEmpty: 'Název položky nesmí být prázdný',
    itemNameLength: 'Název položky musí mít méně než 100 znaků',
    itemNamePlaceholder: 'Zadejte název položky (např. Lednice)',
    descriptionPlaceholder: 'Zadejte popis položky',
    roomRequired: 'Místnost je povinná',
    selectRoom: 'Vyberte místnost',
    createRoom: 'Vytvořit novou místnost',
    editRoom: 'Upravit místnost',
    roomCreated: 'Místnost byla úspěšně vytvořena',
    roomUpdated: 'Místnost byla úspěšně upravena',
    roomDeleted: 'Místnost byla úspěšně smazána',
    roomName: 'Název místnosti',
    roomNameRequired: 'Název místnosti je povinný',
    roomNameEmpty: 'Název místnosti nesmí být prázdný',
    roomNameLength: 'Název místnosti musí mít méně než 100 znaků',
    roomNamePlaceholder: 'Zadejte název místnosti (např. Obývací pokoj, Kuchyně)',
    create: 'Vytvořit',
    update: 'Upravit',
    cancel: 'Zrušit',
    save: 'Uložit',
    edit: 'Upravit',
    delete: 'Smazat',
    yes: 'Ano',
    no: 'Ne',
    roomDetails: 'Detail mistnosti',
    itemDetails: 'Detail polozky',
    editItem: 'Upravit polozku',
    itemId: 'ID polozky:',
    roomId: 'ID mistnosti:',
    itemsInRoom: 'Polozky v mistnosti:',
    created: 'Vytvoreno:',
    lastModified: 'Naposledy upraveno:',
    by: 'uzivatelem',
    deleteRoom: 'Smazat mistnost?',
    deleteItem: 'Smazat polozku?',
    confirmDeleteRoom: 'Opravdu chcete tuto mistnost smazat?',
    confirmDeleteItem: 'Opravdu chcete tuto polozku smazat?',
    roomHasItems: 'Mistnost obsahuje polozky inventare',
    roomHasItemsDescription: 'Tato mistnost obsahuje {count} polozek a nelze ji smazat, dokud nebudou presunuty nebo odstraneny.',
    pictures: 'Fotografie',
    previousPicture: 'Předchozí fotografie',
    nextPicture: 'Další fotografie',
    moveUp: 'Posunout nahoru',
    moveDown: 'Posunout dolů',
    attachments: 'Prilohy',
    noPictures: 'Zatim nejsou zadne fotografie',
    noAttachments: 'Zatim nejsou zadne prilohy',
    uploadPicture: 'Nahrat fotografii',
    uploadPdf: 'Nahrat PDF',
    exportPdf: 'Exportovat do PDF',
    generatingPdf: 'Vytvarim PDF',
    preparingExport: 'Pripravuji export inventare...',
    noRoomsToExport: 'Nejsou zadne mistnosti k exportu',
    pdfExported: 'PDF bylo uspesne exportovano',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() =>
    localStorage.getItem('language') === 'en' ? 'en' : 'cs'
  );

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey, values?: Record<string, string | number>) =>
    Object.entries(values ?? {}).reduce(
      (text, [name, value]) => text.replace(`{${name}}`, String(value)),
      translations[language][key] as string
    );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
