import type { IConversation } from '../types';

export const createConversation = async (
  apiKey: string
): Promise<IConversation> => {
  try {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    console.log('Making Tavus API request with persona_id: p82a6be06b3a');
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        persona_id: 'pbe15210a53f', // Updated User Persona
      }),
    });

    console.log('Tavus API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavus API error response:', errorText);
      throw new Error(`Tavus API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Tavus API success response:', data);
    return data;
  } catch (error) {
    console.error('createConversation error:', error);
    throw error;
  }
};
