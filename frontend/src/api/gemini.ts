const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'your-gemini-api-key';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface VoiceCommandRequest {
  command: string;
  language: string;
  currentMode: string;
  availableModes: string[];
}

interface GeminiResponse {
  mode?: string;
  confidence: number;
  explanation: string;
}

export const processVoiceCommandWithGemini = async (request: VoiceCommandRequest): Promise<GeminiResponse> => {
  const prompt = `
You are an energy management system voice assistant. Analyze this voice command and determine the intended energy mode.

Voice Command: "${request.command}"
Language: ${request.language}
Current Mode: ${request.currentMode}
Available Modes: ${request.availableModes.join(', ')}

Energy Mode Mappings:
- "solar" or "solar only" → solar
- "wind" or "wind only" → wind  
- "solar and wind" or "renewable" or "hybrid" → solar+wind
- "all sources" or "everything" or "full power" → solar+wind+grid
- "grid" or "grid only" → grid

Respond with JSON only:
{
  "mode": "detected_mode_or_null",
  "confidence": 0.0-1.0,
  "explanation": "brief_explanation"
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      try {
        const parsed = JSON.parse(text);
        return parsed;
      } catch {
        // Fallback parsing
        const modeMatch = text.match(/"mode":\s*"([^"]+)"/);
        const confidenceMatch = text.match(/"confidence":\s*([0-9.]+)/);
        
        return {
          mode: modeMatch?.[1] || null,
          confidence: parseFloat(confidenceMatch?.[1] || '0'),
          explanation: 'Parsed from Gemini response'
        };
      }
    }

    return {
      mode: null,
      confidence: 0,
      explanation: 'No valid response from Gemini'
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      mode: null,
      confidence: 0,
      explanation: 'API request failed'
    };
  }
};