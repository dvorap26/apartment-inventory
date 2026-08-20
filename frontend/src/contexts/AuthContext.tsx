import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { msalInstance, storageScopes } from '../config/msalInstance';

interface AuthContextType {
  isAuthenticated: boolean;
  account: AccountInfo | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: (scopes?: string[]) => Promise<string>;
  hasWritePermission: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWritePermission, setHasWritePermission] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsAuthenticated(true);
          // Check write permission by attempting to get token
          try {
            await getAccessTokenInternal(storageScopes.write);
            setHasWritePermission(true);
          } catch {
            setHasWritePermission(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const getAccessTokenInternal = async (scopes: string[]): Promise<string> => {
    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes,
        account: account || undefined
      });
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      throw error;
    }
  };

  const login = async () => {
    try {
      const response = await msalInstance.loginPopup();
      setAccount(response.account);
      setIsAuthenticated(true);
      
      // Check write permission
      try {
        await getAccessTokenInternal(storageScopes.write);
        setHasWritePermission(true);
      } catch {
        setHasWritePermission(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await msalInstance.logoutPopup();
      setAccount(null);
      setIsAuthenticated(false);
      setHasWritePermission(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const getAccessToken = async (scopes: string[] = storageScopes.read): Promise<string> => {
    return getAccessTokenInternal(scopes);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        account,
        isLoading,
        login,
        logout,
        getAccessToken,
        hasWritePermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};