export const msalConfig = {
  auth: {
    clientId: "afd862b8-d954-42cc-979f-ca808c91272f",
    authority: "https://login.microsoftonline.com/e66b2449-23da-4c56-b825-a3a66bf72c8e",
    redirectUri: "https://apartmentinventorydev.z36.web.core.windows.net" // adjust for production
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const storageConfig = {
  accountName: "apartmentinventorydev",
  tablesEndpoint: "https://apartmentinventorydev.table.core.windows.net/",
  blobsEndpoint: "https://apartmentinventorydev.blob.core.windows.net/"
};
