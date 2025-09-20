
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { EmailGenerado } from '../types';

const EmailCard: React.FC<{ email: EmailGenerado }> = ({ email }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { asunto, cuerpo } = JSON.parse(email.cuerpo);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300">
      <div className="p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">PARA: {email.destinatario.contacto.email}</p>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-1">{email.destinatario.nombreEmpresa}</h3>
            <p className="text-blue-600 dark:text-blue-400">Asunto: {asunto}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(email.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <span className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                isExpanded ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              {isExpanded ? 'Ocultar' : 'Ver más'}
            </span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-6 pb-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Servicio Ofrecido:</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{email.servicio.nombre}</p>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Cuerpo del Email:</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md">
              <pre className="whitespace-pre-wrap font-sans">{cuerpo}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export const Emails: React.FC = () => {
  const { emails } = useAppContext();

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Emails Generados</h2>
      {emails.length > 0 ? (
        <div className="space-y-6">
          {emails.map(email => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">No has generado ningún correo electrónico todavía.</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Ve a la página de 'Búsqueda' para encontrar prospectos y crear emails.</p>
        </div>
      )}
    </div>
  );
};
