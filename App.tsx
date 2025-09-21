
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Busqueda } from './pages/Busqueda';
import { Servicios } from './pages/Servicios';
import { Emails } from './pages/Emails';
import { Perfil } from './pages/Perfil';
import { ProspectoDetalle } from './pages/ProspectoDetalle';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Busqueda />} />
              <Route path="/busqueda" element={<Busqueda />} />
              <Route path="/prospectos" element={<Busqueda />} />
              <Route path="/prospecto/:prospectoId" element={<ProspectoDetalle />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/emails" element={<Emails />} />
              <Route path="/perfil" element={<Perfil />} />
            </Routes>
          </main>
          <footer className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-center p-4 border-t dark:border-gray-700">
            <p>&copy; {new Date().getFullYear()} ServiceMatch. Creado con IA.</p>
          </footer>
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
