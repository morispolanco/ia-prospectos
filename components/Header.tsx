
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
const activeLinkClasses = "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white";
const inactiveLinkClasses = "text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

export const Header: React.FC = () => {
  const location = useLocation();
  const isProspectosActive = location.pathname.startsWith('/prospecto') || location.pathname === '/prospectos';

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;
    
  const getProspectosLinkClass = () => 
    `${navLinkClasses} ${isProspectosActive ? activeLinkClasses : inactiveLinkClasses}`;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/" className="text-xl font-bold text-gray-800 dark:text-white">
                ServiceMatch
              </NavLink>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                <NavLink to="/" className={getNavLinkClass}>Dashboard</NavLink>
                <NavLink to="/servicios" className={getNavLinkClass}>Mis Servicios</NavLink>
                <NavLink to="/busqueda" className={getNavLinkClass}>Búsqueda</NavLink>
                <NavLink to="/prospectos" className={getProspectosLinkClass}>Prospectos</NavLink>
                <NavLink to="/emails" className={getNavLinkClass}>Emails</NavLink>
                <NavLink to="/perfil" className={getNavLinkClass}>Perfil</NavLink>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                CM
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
