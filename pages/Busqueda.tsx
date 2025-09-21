
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { buscarClientes, generarEmail } from '../services/geminiService';
import type { ClientePotencial, Servicio } from '../types';
import { Spinner } from '../components/Spinner';

// Client Card Component
const ClientCard: React.FC<{ cliente: ClientePotencial; }> = ({ cliente }) => {
  
  const getScoreColor = (score: number) => {
    if (score > 89) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (score > 84) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };
  
  return (
    <Link to={`/prospecto/${cliente.id}`} className="block hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
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
          <p className="text-sm text-gray-500 hover:underline break-all">{cliente.paginaWeb}</p>
          <div className="my-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{cliente.contacto.nombre} - <span className="font-normal">{cliente.contacto.cargo}</span></p>
            <p className="text-gray-600 dark:text-gray-400">{cliente.contacto.email}</p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">{cliente.analisisNecesidad}</p>
        </div>
        <div className="mt-4 self-start text-blue-600 font-semibold">
          Ver Detalles &rarr;
        </div>
      </div>
    </Link>
  );
};


export const Busqueda: React.FC = () => {
  const { servicios, perfil, addEmail, setProspectos } = useAppContext();
  const [filtros, setFiltros] = useState({ servicioId: '', sector: '', ubicacion: '' });
  const [resultados, setResultados] = useState<ClientePotencial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');

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
        const clientesOrdenados = clientes.sort((a, b) => b.probabilidadContratacion - a.probabilidadContratacion);
        setResultados(clientesOrdenados);
        setProspectos(clientesOrdenados); // Save to context
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al buscar clientes.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const selectedServicio = servicios.find(s => s.id === filtros.servicioId);

  const handleGenerateAllEmails = async () => {
    if (!selectedServicio || !perfil.nombre || !resultados.length) return;

    setIsBulkGenerating(true);
    setBulkMessage('Iniciando generación masiva...');
    
    let successCount = 0;
    let errorCount = 0;
    for (let i = 0; i < resultados.length; i++) {
        const cliente = resultados[i];
        setBulkMessage(`Generando email ${i + 1} de ${resultados.length} para ${cliente.nombreEmpresa}...`);
        try {
            const emailJson = await generarEmail(cliente, selectedServicio, perfil);
            const parsedEmail = JSON.parse(emailJson);
            addEmail({
                destinatario: cliente,
                servicio: selectedServicio,
                cuerpo: JSON.stringify(parsedEmail),
            });
            successCount++;
        } catch(error) {
            console.error("Error generating email for:", cliente.nombreEmpresa, error);
            errorCount++;
        }
    }

    setBulkMessage(`${successCount} de ${resultados.length} emails generados y guardados. ${errorCount > 0 ? `${errorCount} fallaron.` : ''}`);
    setIsBulkGenerating(false);
    
    setTimeout(() => setBulkMessage(''), 5000);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 mb-8">
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Resultados de la Búsqueda</h2>
              <button
                onClick={handleGenerateAllEmails}
                disabled={isBulkGenerating || isLoading}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isBulkGenerating ? 'Generando...' : 'Generar y Guardar Todos'}
              </button>
            </div>
             {bulkMessage && <p className="text-center text-blue-600 dark:text-blue-400 mb-4">{bulkMessage}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultados.map((cliente) => (
                <ClientCard 
                  key={cliente.id} 
                  cliente={cliente} 
                />
            ))}
            </div>
        </div>
      )}
    </div>
  );
};
