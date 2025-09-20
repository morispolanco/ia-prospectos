
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { buscarClientes, generarEmail } from '../services/geminiService';
import type { ClientePotencial, Servicio } from '../types';
import { Spinner } from '../components/Spinner';

// Modal for email generation
const EmailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cliente: ClientePotencial;
  servicio: Servicio;
}> = ({ isOpen, onClose, cliente, servicio }) => {
  const { perfil, addEmail } = useAppContext();
  const [emailContent, setEmailContent] = useState({ asunto: '', cuerpo: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateEmail = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generarEmail(cliente, servicio, perfil);
      const parsedResult = JSON.parse(result);
      setEmailContent(parsedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmail = () => {
    addEmail({
      destinatario: cliente,
      servicio,
      cuerpo: JSON.stringify(emailContent),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Generar Email para {cliente.nombreEmpresa}</h3>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <Spinner message="Generando email..." />
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : emailContent.cuerpo ? (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Asunto:</label>
                <input
                  type="text"
                  value={emailContent.asunto}
                  onChange={(e) => setEmailContent(prev => ({ ...prev, asunto: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">Cuerpo:</label>
                <textarea
                  value={emailContent.cuerpo}
                  onChange={(e) => setEmailContent(prev => ({ ...prev, cuerpo: e.target.value }))}
                  rows={10}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Haz clic para generar un borrador de correo personalizado para este cliente.</p>
                <button
                    onClick={handleGenerateEmail}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                >
                    Generar Borrador
                </button>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
            Cancelar
          </button>
          <button
            onClick={handleSaveEmail}
            disabled={!emailContent.cuerpo || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Guardar Email
          </button>
        </div>
      </div>
    </div>
  );
};

// Client Card Component
const ClientCard: React.FC<{ cliente: ClientePotencial; servicio: Servicio; onGenerateEmail: () => void }> = ({ cliente, onGenerateEmail }) => {
  
  const getScoreColor = (score: number) => {
    if (score > 70) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (score > 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex-1 pr-4">{cliente.nombreEmpresa}</h3>
            <div className="text-center flex-shrink-0">
                <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(cliente.probabilidadContratacion)}`}>
                    {cliente.probabilidadContratacion}%
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Potencial</p>
            </div>
        </div>
        <a href={cliente.paginaWeb} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:underline break-all">{cliente.paginaWeb}</a>
        <div className="my-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{cliente.contacto.nombre} - <span className="font-normal">{cliente.contacto.cargo}</span></p>
          <p className="text-gray-600 dark:text-gray-400">{cliente.contacto.email}</p>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">{cliente.analisisNecesidad}</p>
      </div>
      <button 
        onClick={onGenerateEmail} 
        className="mt-4 self-start px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
      >
        Generar Email
      </button>
    </div>
  );
};


export const Busqueda: React.FC = () => {
  const { servicios, perfil } = useAppContext();
  const [filtros, setFiltros] = useState({ servicioId: '', sector: '', ubicacion: '' });
  const [resultados, setResultados] = useState<ClientePotencial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientePotencial | null>(null);

  const isFormValid = filtros.servicioId && filtros.sector && filtros.ubicacion && perfil.nombre;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        setError('Por favor, completa todos los filtros y asegúrate de haber configurado tu perfil.');
        return;
    }
    
    setIsLoading(true);
    setError('');
    setResultados([]);

    const servicioSeleccionado = servicios.find(s => s.id === filtros.servicioId);
    if (servicioSeleccionado) {
      try {
        const clientes = await buscarClientes(servicioSeleccionado, filtros.sector, filtros.ubicacion);
        setResultados(clientes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al buscar clientes.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const selectedServicio = servicios.find(s => s.id === filtros.servicioId);

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Búsqueda de Prospectos</h2>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="servicioId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Servicio</label>
            <select id="servicioId" value={filtros.servicioId} onChange={e => setFiltros({...filtros, servicioId: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
              <option value="">Selecciona un servicio</option>
              {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sector</label>
            <input type="text" id="sector" value={filtros.sector} onChange={e => setFiltros({...filtros, sector: e.target.value})} placeholder="Ej: Abogados, Restaurantes" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</label>
            <input type="text" id="ubicacion" value={filtros.ubicacion} onChange={e => setFiltros({...filtros, ubicacion: e.target.value})} placeholder="Ej: Guatemala, Ciudad de México" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <button type="submit" disabled={!isFormValid || isLoading} className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {!perfil.nombre && <p className="text-yellow-600 mt-4">Advertencia: Debes configurar tu perfil antes de poder generar correos.</p>}
      </div>

      {isLoading && <Spinner message="Buscando clientes potenciales..." />}

      {resultados.length > 0 && (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Resultados de la Búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultados.map((cliente, index) => (
                <ClientCard 
                key={index} 
                cliente={cliente} 
                servicio={selectedServicio!}
                onGenerateEmail={() => setSelectedClient(cliente)}
                />
            ))}
            </div>
        </div>
      )}
      
      {selectedClient && selectedServicio && (
        <EmailModal 
            isOpen={!!selectedClient}
            onClose={() => setSelectedClient(null)}
            cliente={selectedClient}
            servicio={selectedServicio}
        />
      )}
    </div>
  );
};