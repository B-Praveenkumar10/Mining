// Frontend no longer calls Gemini directly. It calls our backend proxy.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api';

interface VoiceCommandRequest {
  command: string;
  language: string;
  currentMode: string;
  availableModes: string[];
}

interface GeminiResponse {
  mode?: string | null;
  confidence: number;
  explanation: string;
}

export const processVoiceCommandWithGemini = async (request: VoiceCommandRequest): Promise<GeminiResponse> => {
  try {
    const res = await fetch(`${BACKEND_URL}/gemini/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }
    const data = await res.json();
    return data as GeminiResponse;
  } catch (error) {
    console.error('Backend proxy error:', error);
    return { mode: null, confidence: 0, explanation: 'API request failed' };
  }
};

// Chat API
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const chatWithGemini = async (messages: ChatMessage[], options?: { system?: string; temperature?: number }): Promise<string> => {
  try {
    const res = await fetch(`${BACKEND_URL}/gemini/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        system: options?.system,
        temperature: options?.temperature,
      }),
    });
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }
    const data = await res.json();
    return data.text as string;
  } catch (e) {
    console.error('Backend chat error:', e);
    throw e;
  }
};