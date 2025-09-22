import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { PerfilUsuario, Servicio, EmailGenerado, ClientePotencial, LlamadaRegistrada } from '../types';

interface AppContextType {
  perfil: PerfilUsuario;
  servicios: Servicio[];
  emails: EmailGenerado[];
  prospectos: ClientePotencial[];
  llamadas: LlamadaRegistrada[];
  setPerfil: (perfil: PerfilUsuario) => void;
  addServicio: (servicio: Omit<Servicio, 'id'>) => void;
  removeServicio: (id: string) => void;
  addEmail: (email: Omit<EmailGenerado, 'id' | 'fecha'>) => void;
  removeEmails: (emailIds: string[]) => void;
  addProspectos: (prospectos: ClientePotencial[]) => void;
  removeProspectos: (prospectoIds: string[]) => void;
  getProspectoById: (id: string) => ClientePotencial | undefined;
  addLlamada: (llamada: Omit<LlamadaRegistrada, 'id' | 'fecha'>) => void;
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
  const [prospectos, setProspectosState] = useState<ClientePotencial[]>(() => getInitialState<ClientePotencial[]>('prospectos', []));
  const [llamadas, setLlamadas] = useState<LlamadaRegistrada[]>(() => getInitialState<LlamadaRegistrada[]>('llamadas', []));


  useEffect(() => {
    localStorage.setItem('perfil', JSON.stringify(perfil));
  }, [perfil]);

  useEffect(() => {
    localStorage.setItem('servicios', JSON.stringify(servicios));
  }, [servicios]);

  useEffect(() => {
    localStorage.setItem('emails', JSON.stringify(emails));
  }, [emails]);
  
  useEffect(() => {
    localStorage.setItem('prospectos', JSON.stringify(prospectos));
  }, [prospectos]);

  useEffect(() => {
    localStorage.setItem('llamadas', JSON.stringify(llamadas));
  }, [llamadas]);

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
  
  const removeEmails = (emailIds: string[]) => {
    setEmails(prev => prev.filter(e => !emailIds.includes(e.id)));
  };

  const addProspectos = (newProspectos: ClientePotencial[]) => {
    setProspectosState(prev => {
        const prospectosMap = new Map(prev.map(p => [p.id, p]));
        newProspectos.forEach(p => prospectosMap.set(p.id, p));
        return Array.from(prospectosMap.values());
    });
  };

  const removeProspectos = (prospectoIds: string[]) => {
    setProspectosState(prev => prev.filter(p => !prospectoIds.includes(p.id)));
  };

  const getProspectoById = (id: string): ClientePotencial | undefined => {
    const allProspects = getInitialState<ClientePotencial[]>('prospectos', []);
    return allProspects.find(p => p.id === id);
  };

  const addLlamada = (llamada: Omit<LlamadaRegistrada, 'id' | 'fecha'>) => {
    const nuevaLlamada = {
      ...llamada,
      id: Date.now().toString(),
      fecha: new Date().toISOString()
    };
    setLlamadas(prev => [nuevaLlamada, ...prev]);
  };

  return (
    <AppContext.Provider value={{ perfil, setPerfil, servicios, addServicio, removeServicio, emails, addEmail, removeEmails, prospectos, addProspectos, removeProspectos, getProspectoById, llamadas, addLlamada }}>
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