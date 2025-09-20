
import React from 'react';
import { NavLink } from 'react-router-dom';

const navLinkClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
const activeLinkClasses = "bg-blue-600 text-white";
const inactiveLinkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white shadow-lg">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">
          <NavLink to="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span>Prospección B2B</span>
          </NavLink>
        </h1>
        <div className="flex space-x-4">
          <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
            Búsqueda
          </NavLink>
          <NavLink to="/servicios" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
            Mis Servicios
          </NavLink>
          <NavLink to="/emails" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
            Emails Generados
          </NavLink>
          <NavLink to="/perfil" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
            Mi Perfil
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
