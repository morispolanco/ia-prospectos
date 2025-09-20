import { GoogleGenAI } from "@google/genai";
import type { PerfilUsuario, Servicio, ClientePotencial } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const buscarClientes = async (servicio: Servicio, sector: string, ubicacion: string): Promise<ClientePotencial[]> => {
  try {
    const prompt = `
    Busca al menos 15 empresas reales y activas del sector '${sector}' en '${ubicacion}' que podrían beneficiarse de mi servicio de '${servicio.nombre}'.
    Utiliza fuentes públicas y actualizadas como Google Search para encontrar esta información. Para cada empresa, es fundamental que encuentres una dirección de correo electrónico de contacto válida.

    Devuelve los resultados únicamente como un array JSON válido. La estructura de cada objeto en el array debe ser la siguiente:
    {
      "nombreEmpresa": "string",
      "paginaWeb": "string (URL del sitio web)",
      "contacto": {
        "nombre": "string (Nombre del contacto)",
        "cargo": "string (Cargo del contacto)",
        "email": "string (Email de contacto, obligatorio)"
      },
      "analisisNecesidad": "string (Análisis de por qué necesitan el servicio)"
    }

    No incluyas texto, explicaciones o marcadores de formato como \`\`\`json antes o después del array JSON. La respuesta debe ser directamente el JSON.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
    });

    let jsonText = response.text.trim();
    // Clean potential markdown formatting
    if (jsonText.startsWith("```json")) {
        jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }
    
    const clientes = JSON.parse(jsonText) as ClientePotencial[];
    return clientes;
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    if (error instanceof SyntaxError) {
      console.error("Respuesta recibida no es JSON válido:", (error as any).response?.text);
      throw new Error("La respuesta del modelo no tuvo un formato JSON válido. Intenta ajustar la búsqueda.");
    }
    throw new Error("No se pudieron obtener los prospectos. Inténtalo de nuevo.");
  }
};

export const generarEmail = async (cliente: ClientePotencial, servicio: Servicio, perfil: PerfilUsuario): Promise<string> => {
  try {
    const prompt = `
    Actúa como un experto en redacción de correos de ventas B2B.
    Tu tarea es redactar un borrador de correo electrónico profesional y altamente personalizado.

    **Información del destinatario:**
    - Empresa: ${cliente.nombreEmpresa}
    - Contacto: ${cliente.contacto.nombre} (${cliente.contacto.cargo})
    - Análisis de su necesidad: ${cliente.analisisNecesidad}

    **Información del remitente (mi perfil):**
    - Nombre: ${perfil.nombre}
    - Email: ${perfil.email}
    - Web: ${perfil.paginaWeb}
    - Mi servicio: ${servicio.nombre}
    - Descripción del servicio: ${servicio.descripcion}

    **Instrucciones para el correo:**
    1.  **Asunto:** Crea un asunto corto, intrigante y personalizado. Por ejemplo: "Idea para ${cliente.nombreEmpresa}" o "Colaboración potencial con ${cliente.nombreEmpresa}".
    2.  **Cuerpo del correo:**
        -   Comienza con un saludo personalizado a ${cliente.contacto.nombre}.
        -   Menciona brevemente que conoces su empresa, ${cliente.nombreEmpresa}.
        -   Basándote en el 'análisis de necesidad', demuestra que entiendes un posible desafío u oportunidad que tienen.
        -   Presenta tu servicio ('${servicio.nombre}') como la solución a ese desafío. Usa la descripción del servicio para explicar el beneficio clave en 1-2 frases.
        -   Termina con una llamada a la acción clara y de bajo compromiso, como "¿Tendría 15 minutos la próxima semana para una breve llamada?".
        -   Firma con el nombre del remitente.
    3.  **Formato de salida:** Tu respuesta DEBE SER EXCLUSIVAMENTE un objeto JSON válido. No incluyas texto, explicaciones o marcadores de formato como \`\`\`json antes o después del objeto. El objeto JSON debe tener dos claves: "asunto" (string) y "cuerpo" (string).

    **Ejemplo de formato de salida deseado:**
    {
      "asunto": "Un asunto de ejemplo",
      "cuerpo": "El cuerpo del correo electrónico aquí."
    }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    let jsonText = response.text.trim();
    // Clean potential markdown formatting
    if (jsonText.startsWith("```json")) {
        jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }

    return jsonText;
  } catch (error) {
    console.error("Error al generar el email:", error);
    throw new Error("No se pudo generar el correo. Inténtalo de nuevo.");
  }
};