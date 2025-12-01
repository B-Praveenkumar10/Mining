import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Globe, Volume2 } from 'lucide-react';

interface VoiceControlProps {
  onEnergyModeChange: (mode: string) => void;
  currentMode: string;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onEnergyModeChange, currentMode }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const languages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' }
  ];

  const energyCommands = {
    'en-US': {
      solar: ['solar only', 'switch to solar', 'solar power', 'solar mode'],
      wind: ['wind only', 'switch to wind', 'wind power', 'wind mode'],
      'solar+wind': ['solar and wind', 'renewable only', 'solar plus wind', 'hybrid mode'],
      'solar+wind+grid': ['all sources', 'everything', 'all power', 'full mode'],
      grid: ['grid only', 'switch to grid', 'grid power', 'grid mode']
    },
    'hi-IN': {
      solar: ['केवल सोलर', 'सोलर पर स्विच करें', 'सोलर पावर', 'सोलर मोड'],
      wind: ['केवल हवा', 'हवा पर स्विच करें', 'हवा की शक्ति', 'हवा मोड'],
      'solar+wind': ['सोलर और हवा', 'केवल नवीकरणीय', 'सोलर प्लस हवा', 'हाइब्रिड मोड'],
      'solar+wind+grid': ['सभी स्रोत', 'सब कुछ', 'सभी शक्ति', 'पूर्ण मोड'],
      grid: ['केवल ग्रिड', 'ग्रिड पर स्विच करें', 'ग्रिड पावर', 'ग्रिड मोड']
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript.toLowerCase();
        setTranscript(result);
        processVoiceCommand(result);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [language]);

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    // First try local command matching
    const langCommands = energyCommands[language as keyof typeof energyCommands] || energyCommands['en-US'];
    
    for (const [mode, commands] of Object.entries(langCommands)) {
      if (commands.some(cmd => command.includes(cmd))) {
        onEnergyModeChange(mode);
        setIsProcessing(false);
        return;
      }
    }

    // If no local match, use Gemini API
    try {
      const { processVoiceCommandWithGemini } = await import('../api/gemini');
      const result = await processVoiceCommandWithGemini({
        command,
        language,
        currentMode,
        availableModes: ['solar', 'wind', 'solar+wind', 'solar+wind+grid', 'grid']
      });
      
      if (result.mode && result.confidence > 0.5) {
        onEnergyModeChange(result.mode);
      }
    } catch (error) {
      console.error('Gemini API error:', error);
    }
    
    setIsProcessing(false);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Voice Control</h3>
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : isProcessing
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isListening ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Click to speak'}
          </p>
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">"{transcript}"</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Commands:</h4>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
            {language === 'hi-IN' ? (
              <>
                <p>• "केवल सोलर" - Solar only</p>
                <p>• "हवा की शक्ति" - Wind power</p>
                <p>• "सभी स्रोत" - All sources</p>
              </>
            ) : (
              <>
                <p>• "Switch to solar" - Solar only</p>
                <p>• "Wind power" - Wind only</p>
                <p>• "All sources" - Everything</p>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => speakResponse(`Current mode is ${currentMode}`)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <Volume2 className="h-4 w-4" />
          <span>Speak Current Mode</span>
        </button>
      </div>
    </div>
  );
};

export default VoiceControl;