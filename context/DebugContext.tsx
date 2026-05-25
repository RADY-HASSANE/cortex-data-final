import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DebugLog {
  id: string;
  timestamp: number;
  type: 'success' | 'error';
  request: any;
  response: any;
}

interface DebugContextType {
  isDebugOpen: boolean;
  toggleDebug: () => void;
  logs: DebugLog[];
  addLog: (request: any, response: any, isError?: boolean) => void;
  clearLogs: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);

  const toggleDebug = useCallback(() => setIsDebugOpen(prev => !prev), []);

  const addLog = useCallback((request: any, response: any, isError = false) => {
    const newLog: DebugLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: isError ? 'error' : 'success',
      request,
      response
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return (
    <DebugContext.Provider value={{ isDebugOpen, toggleDebug, logs, addLog, clearLogs }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};