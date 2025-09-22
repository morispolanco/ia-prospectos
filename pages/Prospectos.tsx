import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generarEmail } from '../services/geminiService';
import { createGmailDraft } from '../services/gmailService';
import { ClientCard } from '../components/ClientCard';
import { Spinner } from '../components/Spinner';

export const Prospectos: React.FC = () => {
    const { prospectos, removeProspectos, servicios, perfil, addEmail, googleAccessToken } = useAppContext();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [bulkMessage, setBulkMessage] = useState('');
    const [selectedServicioId, setSelectedServicioId] = useState<string>('');
    const [error, setError] = useState('');

    const handleSelectProspecto = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === prospectos.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(prospectos.map(p => p.id)));
        }
    };

    const handleRemoveSelected = () => {
        removeProspectos(Array.from(selectedIds));
        setSelectedIds(new Set());
    };

    const runBulkGeneration = async (createDraft: boolean) => {
        const selectedServicio = servicios.find(s => s.id === selectedServicioId);
        if (!selectedServicio) {
            setError('Por favor, selecciona un servicio.');
            return;
        }
        if (!perfil.nombre) {
            setError('Por favor, configura tu perfil.');
            return;
        }
        if (selectedIds.size === 0) {
            setError('Por favor, selecciona al menos un prospecto.');
            return;
        }
        if (createDraft && !googleAccessToken) {
            setError('Por favor, conecta tu cuenta de Google en tu perfil para crear borradores.');
            return;
        }
        setError('');

        const selectedProspectos = prospectos.filter(p => selectedIds.has(p.id));

        setIsBulkGenerating(true);
        setBulkMessage('Iniciando generación masiva...');
        
        let successCount = 0;
        let errorCount = 0;
        for (let i = 0; i < selectedProspectos.length; i++) {
            const cliente = selectedProspectos[i];
            const actionText = createDraft ? 'borrador para' : 'email para';
            setBulkMessage(`Generando ${actionText} ${i + 1} de ${selectedProspectos.length}: ${cliente.nombreEmpresa}...`);
            try {
                const emailJson = await generarEmail(cliente, selectedServicio, perfil);
                const parsedEmail = JSON.parse(emailJson);
                
                if (createDraft && googleAccessToken) {
                    await createGmailDraft(googleAccessToken, cliente.contacto.email, parsedEmail.asunto, parsedEmail.cuerpo);
                }
                
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
        const resultText = createDraft ? 'Borradores creados' : 'Emails guardados';
        setBulkMessage(`${successCount} de ${selectedProspectos.length} ${resultText}. ${errorCount > 0 ? `${errorCount} fallaron.` : ''}`);
        setIsBulkGenerating(false);
        
        setTimeout(() => setBulkMessage(''), 8000);
    };


    if (prospectos.length === 0) {
        return (
            <div className="container mx-auto p-6 text-center">
                <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No tienes prospectos guardados</h2>
                    <p className="text-gray-500 dark:text-gray-400">Ve a la página de 'Búsqueda' para encontrar y guardar nuevos prospectos.</p>
                    <Link to="/busqueda" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                        Ir a Búsqueda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Mis Prospectos</h2>
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        <span>{selectedIds.size} de {prospectos.length} seleccionados</span>
                    </div>
                     <button
                        onClick={handleSelectAll}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                    >
                        {selectedIds.size === prospectos.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedServicioId}
                      onChange={e => {
                        setSelectedServicioId(e.target.value);
                        setError('');
                      }}
                      className="block pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Selecciona un servicio</option>
                      {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                    <button
                        onClick={() => runBulkGeneration(false)}
                        disabled={isBulkGenerating || selectedIds.size === 0}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {isBulkGenerating ? 'Generando...' : 'Generar y Guardar Emails'}
                    </button>
                    {googleAccessToken && (
                        <button
                            onClick={() => runBulkGeneration(true)}
                            disabled={isBulkGenerating || selectedIds.size === 0}
                            className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
                        >
                            {isBulkGenerating ? 'Generando...' : 'Generar Borradores en Gmail'}
                        </button>
                    )}
                    <button
                        onClick={handleRemoveSelected}
                        disabled={selectedIds.size === 0}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-400"
                    >
                        Eliminar Seleccionados
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            {isBulkGenerating && <Spinner message={bulkMessage} />}
            {bulkMessage && !isBulkGenerating && <p className="text-center text-blue-600 dark:text-blue-400 mb-4">{bulkMessage}</p>}


            {!isBulkGenerating && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prospectos.map((cliente) => (
                        <ClientCard 
                            key={cliente.id} 
                            cliente={cliente}
                            isSelected={selectedIds.has(cliente.id)}
                            onSelect={handleSelectProspecto}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};