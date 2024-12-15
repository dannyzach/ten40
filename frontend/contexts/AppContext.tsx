import React, { createContext, useContext } from 'react';
import { useSearch } from '../hooks/useSearch';
import { useDocumentManagement } from '../hooks/useDocumentManagement';
import { Receipt } from '@/types';

interface AppContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  documents: {
    uploadReceipt: (file: File) => Promise<Receipt>;
    getReceipts: () => Promise<Receipt[]>;
    deleteReceipt: (id: number) => Promise<void>;
    fetchReceipt: (id: string | string[]) => Promise<Receipt>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const search = useSearch();
  const documents = useDocumentManagement();

  const value = {
    ...search,
    documents
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}; 