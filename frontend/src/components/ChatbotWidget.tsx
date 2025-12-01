import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatWithGemini, type ChatMessage } from '../api/gemini';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI Mining Assistant. I can help you with crushing optimization, grinding efficiency, predictive maintenance, Digital Twin simulation, equipment monitoring, and AI-driven process control. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const smartResponses = {
    crushing: {
      keywords: ['crush', 'crusher', 'jaw', 'cone', 'impact'],
      response: 'Crushing Operations Optimization 🔨\n\n• AI-controlled feed rate adjustment\n• Real-time ore hardness monitoring\n• Predictive wear pattern analysis\n• Energy consumption: 1.5-3 kWh/ton\n• Optimal CSS settings for efficiency\n\nWould you like to know about crusher maintenance or energy optimization?'
    },
    grinding: {
      keywords: ['grind', 'mill', 'ball', 'sag', 'rod'],
      response: 'Grinding Circuit Optimization ⚙️\n\n• Ball mill efficiency: 15-25 kWh/ton\n• SAG mill optimization: 8-15 kWh/ton\n• Optimal grinding media selection\n• Particle size distribution control\n• Mill liner wear monitoring\n\nGrinding accounts for 50% of comminution energy!'
    },
    maintenance: {
      keywords: ['maintenance', 'predictive', 'wear', 'repair', 'schedule'],
      response: 'Predictive Maintenance System 🔧\n\n🔸 AI-Powered Predictions:\n• Bearing failure: 95% accuracy\n• Liner wear: Real-time monitoring\n• Vibration analysis: Continuous\n\n🔸 Cost Savings:\n• Unplanned downtime: -60%\n• Maintenance costs: -30%\n• Equipment life: +25%\n\nContact: Mining Control Room for scheduling'
    },
    emergency: {
      keywords: ['emergency', 'contact', 'help', 'support', 'number'],
      response: 'Emergency Contacts 📞\n\n🚨 Mining Control Room: 1912\n🔧 Technical Support: 1800-180-1912\n⚡ Equipment Emergency: 1800-11-0001\n🏥 Medical Emergency: 108\n🔥 Fire Safety: 101\n\nAll helplines are available 24/7!'
    },
    efficiency: {
      keywords: ['points', 'earn', 'reward', 'leaderboard', 'ranking', 'efficiency'],
      response: 'Efficiency Points System 🏆\n\n⚡ Earning Points:\n• Energy savings: 10 points per kWh\n• Throughput increase: 8 points per ton\n• Downtime reduction: 5 points per hour\n• Maintenance optimization: 3 points per task\n\n🎯 Bonus Points:\n• Daily efficiency >80%: 50 bonus points\n• Weekly targets: 100-500 points\n• Process improvements: 200 points each\n\nCheck leaderboard to see your ranking!'
    },
    optimization: {
      keywords: ['optimize', 'efficiency', 'save', 'reduce', 'tips'],
      response: 'Process Optimization Tips 💡\n\n🔨 Crushing Optimization:\n• Feed size control: Uniform distribution\n• CSS adjustment: Real-time monitoring\n• Load balancing: Prevent overloading\n\n⚙️ Grinding Optimization:\n• Mill speed: 75-85% critical speed\n• Ball charge: 30-40% mill volume\n• Pulp density: 65-75% solids\n\n📊 Energy Management:\n• Peak load shifting: Off-peak operations\n• Variable frequency drives: Speed control\n• Power factor correction: Reactive power'
    },
    energy: {
      keywords: ['battery', 'storage', 'backup', 'charge', 'discharge', 'energy'],
      response: 'Energy Storage & Management 🔋\n\n💡 Industrial Battery Systems:\n• 10-15 year lifespan\n• 90%+ round-trip efficiency\n• Fast response capability\n• Minimal maintenance\n\n💰 Cost Benefits:\n• Peak shaving: 20-30% savings\n• Load balancing: 15% efficiency gain\n• Backup power: Uninterrupted operations\n\n⚡ Recommended Capacity:\n• Small operations: 500-1000 kWh\n• Medium mines: 2-5 MWh\n• Large operations: 10+ MWh'
    },
    digitaltwin: {
      keywords: ['digital', 'twin', 'simulation', 'virtual', 'video', 'ore', 'journey'],
      response: 'Digital Twin - Virtual Ore Journey 👁️\n\n🎥 Upload Process:\n• Upload conveyor belt video\n• AI analyzes ore characteristics\n• Detects size, hardness, moisture\n• Classifies ore type automatically\n\n🔮 Simulation Features:\n• Virtual processing walkthrough\n• Stage-by-stage energy prediction\n• Throughput estimation\n• Equipment performance modeling\n\n📊 Predictions Include:\n• Crushing power requirements\n• Grinding energy consumption\n• Final product size distribution\n• Overall plant efficiency\n\nAccess via the Digital Twin page!'
    }
  };

  const getSmartResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
  for (const [, data] of Object.entries(smartResponses)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return data.response;
      }
    }
    
    // Default responses for common queries
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! I\'m here to help with all your mining operations questions. You can ask me about crushing optimization, grinding efficiency, predictive maintenance, Digital Twin simulation, emergency contacts, or process optimization tips. What would you like to know?';
    }
    
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! I\'m always here to help with your mining optimization journey. Feel free to ask if you have more questions! 😊';
    }
    
    return 'I can help you with:\n\n🔨 Crushing optimization\n⚙️ Grinding efficiency\n🔧 Predictive maintenance\n👁️ Digital Twin simulation\n📞 Emergency contacts\n🏆 Efficiency points\n💡 Process optimization\n🔋 Energy management\n🤖 AI control systems\n\nPlease ask me about any of these topics!';
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Try backend AI chat first
      const history: ChatMessage[] = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      const aiText = await chatWithGemini([...history, { role: 'user', content: inputText }], {
        system: 'You are an AI Mining Assistant. Be concise, actionable and mining-domain aware.',
      });
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (e) {
      // Fallback to local smartResponses
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getSmartResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">AI Mining Assistant</h1>
                <p className="text-sm text-gray-600">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-green-400 to-blue-500'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="px-4 py-3 bg-gray-100 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about crushing, grinding, Digital Twin, or AI optimization..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotWidget;