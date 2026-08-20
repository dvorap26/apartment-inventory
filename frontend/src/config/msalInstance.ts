import * as msal from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

export const msalInstance = new msal.PublicClientApplication(msalConfig);

export const msalInitialization = msalInstance.initialize();

// Scopes for Azure Storage access
export const storageScopes = {
  read: ["https://storage.azure.com/.default"],
  write: ["https://storage.azure.com/.default"]
};