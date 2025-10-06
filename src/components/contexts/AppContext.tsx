import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  role: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  managerLogin: (username: string, password: string) => boolean;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const auth = localStorage.getItem('nirvix_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setUser({ username: 'Nirvix', role: 'Admin' });
    }

    const theme = localStorage.getItem('nirvix_theme');
    if (theme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === 'Nirvix' && password === 'Nirvix@2025') {
      setIsAuthenticated(true);
      setUser({ username, role: 'Admin' });
      localStorage.setItem('nirvix_auth', 'true');
      return true;
    }
    return false;
  };

  const managerLogin = (username: string, password: string): boolean => {
    if (username === 'Manager' && password === 'Manager@2025') {
      setIsAuthenticated(true);
      setUser({ username, role: 'Project Manager' });
      localStorage.setItem('nirvix_auth', 'true');
      return true;
    }
    return false;
  };  

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('nirvix_auth');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nirvix_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nirvix_theme', 'light');
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        managerLogin,
        logout,
        darkMode,
        toggleDarkMode,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};