
import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Busqueda } from './pages/Busqueda';
import { Servicios } from './pages/Servicios';
import { Emails } from './pages/Emails';
import { Perfil } from './pages/Perfil';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Busqueda />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/emails" element={<Emails />} />
              <Route path="/perfil" element={<Perfil />} />
            </Routes>
          </main>
          <footer className="bg-gray-800 text-white text-center p-4">
            <p>&copy; {new Date().getFullYear()} Asistente de Prospección B2B. Creado con IA.</p>
          </footer>
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
