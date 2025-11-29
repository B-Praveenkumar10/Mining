import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Send, Bot, User, Zap, Sun, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'system';
  content: string;
  timestamp: Date;
  phoneNumber?: string;
  action?: string;
}

const WhatsAppIntegration: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate initial messages
    const initialMessages: Message[] = [
      {
        id: '1',
        sender: 'user',
        content: 'There is low power supply for the past 2 hours',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        phoneNumber: '+91 98765 43210'
      },
      {
        id: '2',
        sender: 'system',
        content: 'Noted!! Switched power to solar',
        timestamp: new Date(Date.now() - 4 * 60 * 1000),
        action: 'switch_to_solar'
      },
      {
        id: '3',
        sender: 'user',
        content: 'Wind power seems low in our area',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        phoneNumber: '+91 87654 32109'
      },
      {
        id: '4',
        sender: 'system',
        content: 'Acknowledged! Switching to solar+grid hybrid mode',
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
        action: 'hybrid_mode'
      }
    ];
    setMessages(initialMessages);
  }, []);

  const processIncomingMessage = (userMessage: string, phoneNumber: string) => {
    const messageId = Date.now().toString();
    
    // Add user message
    const userMsg: Message = {
      id: messageId,
      sender: 'user',
      content: userMessage,
      timestamp: new Date(),
      phoneNumber
    };
    
    setMessages(prev => [...prev, userMsg]);

    // Process and generate system response
    setTimeout(() => {
      const response = generateSystemResponse(userMessage);
      const systemMsg: Message = {
        id: messageId + '_response',
        sender: 'system',
        content: response.message,
        timestamp: new Date(),
        action: response.action
      };
      
      setMessages(prev => [...prev, systemMsg]);
    }, 1500);
  };

  const generateSystemResponse = (message: string): { message: string; action: string } => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('low power') || lowerMsg.includes('power cut') || lowerMsg.includes('no electricity')) {
      return {
        message: 'Noted!! Switched power to solar',
        action: 'switch_to_solar'
      };
    }
    
    if (lowerMsg.includes('wind') && (lowerMsg.includes('low') || lowerMsg.includes('not working'))) {
      return {
        message: 'Acknowledged! Switching to solar+grid hybrid mode',
        action: 'hybrid_mode'
      };
    }
    
    if (lowerMsg.includes('solar') && (lowerMsg.includes('problem') || lowerMsg.includes('not working'))) {
      return {
        message: 'Solar issue detected. Switching to wind+grid backup',
        action: 'switch_to_wind'
      };
    }
    
    if (lowerMsg.includes('high demand') || lowerMsg.includes('more power')) {
      return {
        message: 'High demand noted. Activating all power sources',
        action: 'all_sources'
      };
    }
    
    return {
      message: 'Message received. Technical team will respond shortly',
      action: 'analyzing'
    };
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'switch_to_solar':
        return <Sun className="h-4 w-4 text-orange-500" />;
      case 'switch_to_wind':
        return <Wind className="h-4 w-4 text-blue-500" />;
      case 'hybrid_mode':
      case 'all_sources':
        return <Zap className="h-4 w-4 text-green-500" />;
      default:
        return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simulate incoming WhatsApp messages
  const simulateIncomingMessage = () => {
    const sampleMessages = [
      'Power outage since 1 hour',
      'Solar panels not working properly',
      'Need more power supply',
      'Wind turbines not working'
    ];
    
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    const randomPhone = '+91 ' + Math.floor(Math.random() * 9000000000 + 1000000000);
    
    processIncomingMessage(randomMessage, randomPhone);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-6 w-6 text-green-500" />
                <h1 className="text-xl font-semibold text-gray-800">WhatsApp Energy Support</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border h-96 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-green-50 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Energy Support Bot</h3>
                    <p className="text-sm text-gray-600">Automated energy management system</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.sender === 'user' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs opacity-75">{message.phoneNumber}</span>
                        </div>
                      )}
                      
                      {message.sender === 'system' && (
                        <div className="flex items-center space-x-2 mb-1">
                          {getActionIcon(message.action)}
                          <span className="text-xs text-gray-500">System Response</span>
                        </div>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulate Button */}
              <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={simulateIncomingMessage}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Simulate Incoming WhatsApp Message</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">WhatsApp Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connection</span>
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages Today</span>
                  <span className="text-sm font-medium text-blue-600">{messages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium text-green-600">~1.5s</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => processIncomingMessage('Low power supply in Jaipur', '+91 9876543210')}
                  className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Power Outage</span>
                  </div>
                </button>
                
                <button
                  onClick={() => processIncomingMessage('Solar panels not working in Udaipur', '+91 8765432109')}
                  className="w-full text-left p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
                >
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Solar Issue</span>
                  </div>
                </button>
                
                <button
                  onClick={() => processIncomingMessage('Wind turbines stopped in Jodhpur', '+91 7654321098')}
                  className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                >
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Wind Issue</span>
                  </div>
                </button>
              </div>
            </div>

            {/* System Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Recent Actions</h3>
              <div className="space-y-3">
                {messages
                  .filter(m => m.sender === 'system' && m.action)
                  .slice(-3)
                  .map((message) => (
                    <div key={message.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      {getActionIcon(message.action)}
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">{formatTime(message.timestamp)}</p>
                        <p className="text-sm font-medium text-gray-800">
                          {message.action?.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">How WhatsApp Integration Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Supported Messages:</h4>
              <ul className="space-y-1">
                <li>• Power outage reports</li>
                <li>• Solar panel issues</li>
                <li>• Wind turbine problems</li>
                <li>• High demand requests</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Automatic Actions:</h4>
              <ul className="space-y-1">
                <li>• Switch to backup power sources</li>
                <li>• Load balancing optimization</li>
                <li>• Maintenance scheduling</li>
                <li>• Real-time status updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppIntegration;