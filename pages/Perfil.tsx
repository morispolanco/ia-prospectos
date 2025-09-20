
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const Perfil: React.FC = () => {
  const { perfil, setPerfil } = useAppContext();
  const [formData, setFormData] = useState(perfil);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPerfil(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          Mi Perfil
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Esta información se utilizará para firmar los correos electrónicos que generes.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tu Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej: juan.perez@tuempresa.com"
              required
            />
          </div>
          <div>
            <label htmlFor="paginaWeb" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Página Web o Portfolio
            </label>
            <input
              type="url"
              name="paginaWeb"
              id="paginaWeb"
              value={formData.paginaWeb}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej: https://www.tuempresa.com"
              required
            />
          </div>
          <div className="flex items-center justify-end space-x-4">
            {saved && (
              <span className="text-green-600 dark:text-green-400 font-medium">¡Perfil guardado!</span>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
