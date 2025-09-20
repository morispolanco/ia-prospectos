import { GoogleGenAI } from "@google/genai";
import type { PerfilUsuario, Servicio, ClientePotencial } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const buscarClientes = async (servicio: Servicio, sector: string, ubicacion: string): Promise<ClientePotencial[]> => {
  try {
    const systemInstruction = "Eres una API de búsqueda de prospectos B2B. Tu única función es devolver datos en formato JSON. Nunca incluyas texto explicativo, saludos o cualquier otra cosa fuera del JSON solicitado.";

    const prompt = `
    Realiza una búsqueda para encontrar 50 clientes potenciales del sector '${sector}' en '${ubicacion}' que necesiten el servicio: '${servicio.nombre}'.

    REGLAS ESTRICTAS:
    1.  FILTRADO OBLIGATORIO: Devuelve ÚNICAMENTE prospectos con una 'probabilidadContratacion' superior a 80.
    2.  CONTACTO VÁLIDO: Para cada empresa, usa Google Search para encontrar un gerente o director en LinkedIn y obtén su email de contacto. Este campo es OBLIGATORIO.
    3.  ORDEN: Ordena el resultado final de mayor a menor 'probabilidadContratacion'.
    4.  FORMATO DE SALIDA: Tu respuesta DEBE ser EXCLUSIVAMENTE un array JSON válido. No añadas texto introductorio, explicaciones, ni marcadores de código como \`\`\`json. La respuesta debe empezar con '[' y terminar con ']'.

    La estructura de cada objeto JSON debe ser:
    {
      "nombreEmpresa": "string",
      "paginaWeb": "string",
      "contacto": { "nombre": "string", "cargo": "string", "email": "string" },
      "analisisNecesidad": "string",
      "probabilidadContratacion": "number (entre 81 y 100)"
    }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          tools: [{googleSearch: {}}],
        },
    });

    let jsonText = response.text.trim();
    
    // Make parsing more robust: find the first '[' and last ']'
    const startIndex = jsonText.indexOf('[');
    const endIndex = jsonText.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      jsonText = jsonText.substring(startIndex, endIndex + 1);
    } else {
      console.error("No se encontró un array JSON válido en la respuesta:", response.text);
      throw new Error("La respuesta del modelo no contenía un array JSON válido. La respuesta fue: " + response.text.substring(0, 100) + "...");
    }
    
    const clientes = JSON.parse(jsonText) as ClientePotencial[];
    return clientes;
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    if (error instanceof SyntaxError) {
      console.error("Respuesta recibida no es JSON válido.");
      throw new Error("La respuesta del modelo no tuvo un formato JSON válido. Intenta ajustar la búsqueda.");
    }
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("No se pudieron obtener los prospectos. Inténtalo de nuevo.");
  }
};

export const generarEmail = async (cliente: ClientePotencial, servicio: Servicio, perfil: PerfilUsuario): Promise<string> => {
  try {
    const systemInstruction = "Eres una API de redacción de correos. Tu única función es devolver un objeto JSON con las claves 'asunto' y 'cuerpo'. Nunca escribas nada fuera del objeto JSON.";

    const prompt = `
    Tu tarea es redactar un borrador de correo electrónico B2B en español.

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

    **REGLAS ESTRICTAS PARA EL CORREO:**
    1.  **Asunto:** Corto, intrigante y personalizado (ej: "Idea para ${cliente.nombreEmpresa}").
    2.  **Cuerpo:**
        -   Saludo: "Estimado/a ${cliente.contacto.nombre}:" (con dos puntos).
        -   Introducción: Demuestra que conoces su empresa y su necesidad específica.
        -   Solución: Presenta tu servicio ('${servicio.nombre}') como la solución a esa necesidad.
        -   Llamada a la acción: Clara y de bajo compromiso (ej: "¿Tendría 15 minutos la próxima semana para una breve llamada?").
        -   Despedida: "Atentamente," seguido de tu nombre (${perfil.nombre}).
    
    **FORMATO DE SALIDA OBLIGATORIO:**
    Tu respuesta DEBE ser EXCLUSIVAMENTE un objeto JSON válido. No incluyas texto, explicaciones o marcadores de formato. La respuesta debe empezar con '{' y terminar con '}'.
    
    Ejemplo de salida:
    {
      "asunto": "Un asunto de ejemplo",
      "cuerpo": "El cuerpo del correo electrónico aquí."
    }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
        }
    });
    
    let jsonText = response.text.trim();
    
    // Robust parsing for an object, as a fallback
    const startIndex = jsonText.indexOf('{');
    const endIndex = jsonText.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        jsonText = jsonText.substring(startIndex, endIndex + 1);
    } else {
        console.error("No se encontró un objeto JSON válido en la respuesta:", response.text);
        throw new Error("La respuesta del modelo para el email no contenía un objeto JSON válido.");
    }

    return jsonText;
  } catch (error) {
    console.error("Error al generar el email:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("No se pudo generar el correo. Inténtalo de nuevo.");
  }
};