import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

declare var google: any;

export const Perfil: React.FC = () => {
  const { perfil, setPerfil, googleAccessToken, setGoogleAccessToken } = useAppContext();
  const [formData, setFormData] = useState(perfil);
  const [saved, setSaved] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [gsiClient, setGsiClient] = useState<any>(null);

  useEffect(() => {
    const initializeGsi = () => {
      if (google && process.env.GOOGLE_CLIENT_ID) {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: process.env.GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/gmail.compose',
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              setGoogleAccessToken(tokenResponse.access_token);
            }
          },
        });
        setGsiClient(client);
      }
    };
    
    const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (script) {
        if (google) {
             initializeGsi();
        } else {
            (script as HTMLScriptElement).onload = initializeGsi;
        }
    }
  }, [setGoogleAccessToken]);

  const handleConnectGoogle = () => {
    if (gsiClient) {
      gsiClient.requestAccessToken();
    }
  };

  const handleDisconnectGoogle = () => {
    setGoogleAccessToken(null);
  };


  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Don't show error for empty field until submit
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      if (!validateEmail(value)) {
        setEmailError('Por favor, introduce un formato de email válido.');
      } else {
        setEmailError('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.email) || !formData.email) {
      setEmailError('Por favor, introduce un formato de email válido.');
      return;
    }
    
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
              className={`w-full px-4 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 ${emailError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="Ej: juan.perez@tuempresa.com"
              required
            />
            {emailError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{emailError}</p>}
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
              disabled={!!emailError}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Guardar Cambios
            </button>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Integración con Gmail</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Conecta tu cuenta de Google para crear borradores de tus emails generados directamente en Gmail.
            </p>
            {googleAccessToken ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                    <p className="font-medium text-green-800 dark:text-green-200">Conectado a Google</p>
                    <button onClick={handleDisconnectGoogle} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
                        Desconectar
                    </button>
                </div>
            ) : (
                <button 
                  onClick={handleConnectGoogle}
                  disabled={!gsiClient}
                  className="w-full px-6 py-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-white font-semibold rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                    Conectar con Google
                </button>
            )}
             {!process.env.GOOGLE_CLIENT_ID && <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">La integración con Google está desactivada. Se requiere configuración del administrador.</p>}
        </div>
      </div>
    </div>
  );
};