import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Stricter User interface
interface User {
  username: string;
  role: 'Admin' | 'Project Manager' | null; // Literal types
}

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  managerLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const initializeState = () => {
      const auth = localStorage.getItem('nirvix_auth');
      const storedUser = localStorage.getItem('nirvix_user');
      if (auth === 'true' && storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          if (parsedUser.username && ['Admin', 'Project Manager'].includes(parsedUser.role || '')) {
            setIsAuthenticated(true);
            setUser(parsedUser);
          } else {
            // Clean up invalid data
            localStorage.removeItem('nirvix_auth');
            localStorage.removeItem('nirvix_user');
          }
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('nirvix_auth');
          localStorage.removeItem('nirvix_user');
        }
      }
    };

    initializeState();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nirvix_auth' || e.key === 'nirvix_user') {
        if (e.key === 'nirvix_auth' && e.newValue !== 'true') {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          const storedUser = localStorage.getItem('nirvix_user');
          if (storedUser && e.newValue === 'true') {
            try {
              const parsedUser: User = JSON.parse(storedUser);
              if (parsedUser.username && ['Admin', 'Project Manager'].includes(parsedUser.role || '')) {
                setIsAuthenticated(true);
                setUser(parsedUser);
              } else {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('nirvix_auth');
                localStorage.removeItem('nirvix_user');
              }
            } catch (error) {
              console.error('Failed to parse stored user:', error);
              setIsAuthenticated(false);
              setUser(null);
              localStorage.removeItem('nirvix_auth');
              localStorage.removeItem('nirvix_user');
            }
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (username === 'Nirvix' && password === 'Nirvix@2025') {
        const user: User = { username, role: 'Admin' };
        setIsAuthenticated(true);
        setUser(user);
        localStorage.setItem('nirvix_auth', 'true');
        localStorage.setItem('nirvix_user', JSON.stringify(user));
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const managerLogin = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (username === 'Manager' && password === 'Manager@2025') {
        const user: User = { username, role: 'Project Manager' };
        setIsAuthenticated(true);
        setUser(user);
        localStorage.setItem('nirvix_auth', 'true');
        localStorage.setItem('nirvix_user', JSON.stringify(user));
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('nirvix_auth');
    localStorage.removeItem('nirvix_user');
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      managerLogin,
      logout,
      searchQuery,
      setSearchQuery,
      loading,
    }),
    [isAuthenticated, user, searchQuery, loading]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};