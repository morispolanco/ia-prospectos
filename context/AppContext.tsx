
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { PerfilUsuario, Servicio, EmailGenerado } from '../types';

interface AppContextType {
  perfil: PerfilUsuario;
  servicios: Servicio[];
  emails: EmailGenerado[];
  setPerfil: (perfil: PerfilUsuario) => void;
  addServicio: (servicio: Omit<Servicio, 'id'>) => void;
  removeServicio: (id: string) => void;
  addEmail: (email: Omit<EmailGenerado, 'id' | 'fecha'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [perfil, setPerfilState] = useState<PerfilUsuario>(() => getInitialState<PerfilUsuario>('perfil', { nombre: '', email: '', paginaWeb: '' }));
  const [servicios, setServicios] = useState<Servicio[]>(() => getInitialState<Servicio[]>('servicios', []));
  const [emails, setEmails] = useState<EmailGenerado[]>(() => getInitialState<EmailGenerado[]>('emails', []));

  useEffect(() => {
    localStorage.setItem('perfil', JSON.stringify(perfil));
  }, [perfil]);

  useEffect(() => {
    localStorage.setItem('servicios', JSON.stringify(servicios));
  }, [servicios]);

  useEffect(() => {
    localStorage.setItem('emails', JSON.stringify(emails));
  }, [emails]);
  
  const setPerfil = (newPerfil: PerfilUsuario) => {
    setPerfilState(newPerfil);
  };

  const addServicio = (servicio: Omit<Servicio, 'id'>) => {
    const newServicio = { ...servicio, id: Date.now().toString() };
    setServicios(prev => [...prev, newServicio]);
  };

  const removeServicio = (id: string) => {
    setServicios(prev => prev.filter(s => s.id !== id));
  };
  
  const addEmail = (email: Omit<EmailGenerado, 'id' | 'fecha'>) => {
    const newEmail = { 
      ...email, 
      id: Date.now().toString(),
      fecha: new Date().toISOString()
    };
    setEmails(prev => [newEmail, ...prev]);
  };

  return (
    <AppContext.Provider value={{ perfil, setPerfil, servicios, addServicio, removeServicio, emails, addEmail }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
