import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Mic, MicOff, Globe, MoreVertical, Trash2, Save, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatWithGemini, type ChatMessage } from '../api/gemini';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import { useSavedReports } from '../contexts/SavedReportsContext';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  hasReportButton?: boolean;
  reportDates?: { startDate?: string; endDate?: string };
}

// Helper to detect report request and extract date range
function detectReportRequest(text: string): { isReport: boolean; startDate?: string; endDate?: string } {
  const lowerText = text.toLowerCase();
  
  // Keywords that indicate a report request
  const reportKeywords = [
    'report', 'analysis report', 'analytics report', 'pdf', 'download',
    'generate report', 'create report', 'give me report', 'export',
    'complete analysis', 'full report', 'detailed report', 'summary report'
  ];
  
  const isReport = reportKeywords.some(keyword => lowerText.includes(keyword));
  
  if (!isReport) return { isReport: false };
  
  // Try to extract date ranges
  const today = new Date();
  let startDate: string | undefined;
  let endDate: string | undefined = today.toISOString().split('T')[0];
  
  // Check for "last X days/weeks/months"
  const lastMatch = lowerText.match(/last\s+(\d+)\s*(day|week|month|year)s?/);
  if (lastMatch) {
    const num = parseInt(lastMatch[1]);
    const unit = lastMatch[2];
    const start = new Date(today);
    
    if (unit === 'day') start.setDate(start.getDate() - num);
    else if (unit === 'week') start.setDate(start.getDate() - (num * 7));
    else if (unit === 'month') start.setMonth(start.getMonth() - num);
    else if (unit === 'year') start.setFullYear(start.getFullYear() - num);
    
    startDate = start.toISOString().split('T')[0];
  }
  
  // Check for specific month mentions
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
  monthNames.forEach((month, index) => {
    if (lowerText.includes(month)) {
      const year = today.getFullYear();
      startDate = `${year}-${String(index + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, index + 1, 0).getDate();
      endDate = `${year}-${String(index + 1).padStart(2, '0')}-${lastDay}`;
    }
  });
  
  // Default to last 2 months if no specific range found but report requested
  if (!startDate) {
    const start = new Date(today);
    start.setMonth(start.getMonth() - 2);
    startDate = start.toISOString().split('T')[0];
  }
  
  return { isReport: true, startDate, endDate };
}

const ChatbotWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to Mining Optimizer Support. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isListening, setIsListening] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      text: language === 'hi' ? 'Chat cleared. How can I help you?' : 'Chat cleared. How can I help you?',
      sender: 'bot',
      timestamp: new Date()
    }]);
    setShowMenu(false);
  };

  const [isSavingReport, setIsSavingReport] = useState(false);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const { saveReport } = useSavedReports();

  const handleSaveReport = async (messageId: string, startDate?: string, endDate?: string, summaryText?: string) => {
    setIsSavingReport(true);
    try {
      // Generate report title based on date range
      const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
      const title = startDate && endDate 
        ? `Report: ${formatDate(startDate)} - ${formatDate(endDate)}`
        : `Report: ${new Date().toLocaleDateString()}`;

      saveReport({
        title,
        dateRange: { startDate, endDate },
        summary: summaryText || 'Analytics report'
      });

      // Mark this message as saved
      setSavedMessageIds(prev => new Set([...prev, messageId]));

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: language === 'hi' 
          ? '✅ रिपोर्ट सफलतापूर्वक सेव हो गई! आप इसे बाएं मेनू में "Saved Reports" में देख सकते हैं।'
          : '✅ Report saved successfully! You can view it in "Saved Reports" in the left menu.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: language === 'hi'
          ? '❌ रिपोर्ट सेव करने में त्रुटि। कृपया पुनः प्रयास करें।'
          : '❌ Failed to save report. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsSavingReport(false);
    }
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
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    // Check if this is a report request
    const reportRequest = detectReportRequest(currentInput);

    try {
      if (reportRequest.isReport) {
        // Fetch summary data for the AI to describe
        let summaryText = '';
        try {
          const summaryData = await api.getReportSummary(reportRequest.startDate, reportRequest.endDate);
          const s = summaryData.summary;
          summaryText = `
Based on the analytics data (${summaryData.recordCount} records):
- Average Throughput: ${s.avgThroughput} Tons/Hr
- Average Efficiency: ${s.avgEfficiency}%
- System Uptime: ${s.uptimePercent}%
- Total Power Consumption: ${s.totalPowerConsumption} kW
- Solar Energy Usage: ${s.avgSolarEnergy}%
- Thermal Energy Usage: ${s.avgThermalEnergy}%
- Planned Downtime: ${s.plannedDowntime} hours
- Unplanned Downtime: ${s.unplannedDowntime} hours
- Total Alerts: ${s.alertCount}
`;
        } catch {
          summaryText = 'Analytics data is available for report generation.';
        }

        // Get AI response about the report
        const history: ChatMessage[] = messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));
        
        const reportPrompt = language === 'hi'
          ? `User ने रिपोर्ट का अनुरोध किया है। Date range: ${reportRequest.startDate} to ${reportRequest.endDate}. ${summaryText}\n\nPlease summarize this data briefly in Hindi and tell the user you're preparing their PDF report for download.`
          : `User has requested a report. Date range: ${reportRequest.startDate} to ${reportRequest.endDate}. ${summaryText}\n\nPlease summarize this data briefly and tell the user you're preparing their comprehensive PDF report for download.`;

        const aiText = await chatWithGemini([...history, { role: 'user', content: reportPrompt }], {
          system: language === 'hi' 
            ? 'You are an AI Mining Assistant. Respond in Hindi. Summarize the analytics data and inform user their PDF report is being prepared.'
            : 'You are an AI Mining Assistant. Summarize the analytics data concisely and inform the user their PDF report is being generated.',
        });

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: aiText,
          sender: 'bot',
          timestamp: new Date(),
          hasReportButton: true,
          reportDates: { startDate: reportRequest.startDate, endDate: reportRequest.endDate }
        }]);
        
      } else {
        // Regular chat message
        const history: ChatMessage[] = messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));
        const aiText = await chatWithGemini([...history, { role: 'user', content: currentInput }], {
          system: language === 'hi' 
            ? 'You are an AI Mining Assistant. Always respond in Hindi (Devanagari script). Be concise, actionable and mining-domain aware.'
            : 'You are an AI Mining Assistant. Always respond in English. Be concise, actionable and mining-domain aware.',
        });
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: aiText,
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: language === 'hi' ? 'Sorry, something went wrong. Please try again.' : 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-14 px-4 flex items-center justify-between bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
              AI
            </div>
            <div>
              <h1 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Mining Assistant</h1>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
            title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5" />
            {language === 'en' ? 'EN' : 'HI'}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={clearChat}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear chat
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-2xl rounded-bl-md border border-neutral-200 dark:border-neutral-700'
                } px-4 py-2.5 shadow-sm`}
              >
                {message.sender === 'bot' ? (
                  <div className="text-sm prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:font-semibold">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.text}</p>
                )}
                
                {/* Save Report Button */}
                {message.hasReportButton && (
                  <button
                    onClick={() => handleSaveReport(message.id, message.reportDates?.startDate, message.reportDates?.endDate, message.text)}
                    disabled={isSavingReport || savedMessageIds.has(message.id)}
                    className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg ${
                      savedMessageIds.has(message.id)
                        ? 'bg-green-500 cursor-default'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {savedMessageIds.has(message.id) ? (
                      <>
                        <Check className="w-4 h-4" />
                        {language === 'hi' ? 'रिपोर्ट सेव हो गई' : 'Report Saved'}
                      </>
                    ) : isSavingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {language === 'hi' ? 'सेव हो रही है...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {language === 'hi' ? 'रिपोर्ट सेव करें' : 'Save Report'}
                      </>
                    )}
                  </button>
                )}
                
                <p className={`text-[10px] mt-1 ${message.sender === 'user' ? 'text-emerald-200' : 'text-neutral-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="flex-shrink-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button
            onClick={toggleListening}
            disabled={isTyping}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            } disabled:opacity-50`}
            title={isListening ? 'Stop' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening...' : language === 'hi' ? 'Type your message...' : 'Type your message...'}
              className="w-full px-4 py-2.5 pr-12 bg-neutral-100 dark:bg-neutral-700 border-0 rounded-full text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="max-w-2xl mx-auto mt-2 text-[10px] text-neutral-400 text-center">
          AI assistant may make mistakes. Verify important information.
        </p>
      </footer>
    </div>
  );
};

export default ChatbotWidget;
