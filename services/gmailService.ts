export const createGmailDraft = async (accessToken: string, to: string, subject: string, body: string): Promise<void> => {
  try {
    const emailLines = [
      `To: ${to}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`, // Encode subject for non-ASCII characters
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body.replace(/\n/g, '<br>')
    ];
    const email = emailLines.join('\r\n');
    
    // Convert to Base64URL
    const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          raw: base64EncodedEmail
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating Gmail draft:', errorData);
      throw new Error(`Error de la API de Gmail: ${errorData.error.message}`);
    }
  } catch (error) {
    console.error("Error al crear el borrador de Gmail:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("No se pudo crear el borrador en Gmail.");
  }
};
