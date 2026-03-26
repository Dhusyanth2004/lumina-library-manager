import React, { useState, useRef, useEffect } from 'react';
import { Book } from '../../types';
import { generateChatResponse } from '../../services/geminiService';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  books: Book[];
}

const Chatbot: React.FC<ChatbotProps> = ({ books }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hi! I'm Lumina, your AI librarian. How can I help you today?", 
      isUser: false, 
      timestamp: new Date() 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = { text: inputText, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(inputText, books);
      const botMsg: Message = { text: response, isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
       console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-800 w-[350px] h-[500px] rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-5 bg-indigo-600 dark:bg-indigo-700 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl shadow-inner">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">Lumina AI</h3>
                <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">Librarian Assistant</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors font-bold">
              ✕
            </button>
          </div>

          {/* Messages Wrapper */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    m.isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-600'
                  }`}
                >
                  {m.text}
                  <div className={`text-[9px] mt-1 opacity-60 ${m.isUser ? 'text-right' : 'text-left'}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-600 shadow-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about books..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none transition-shadow"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-indigo-100 dark:shadow-none"
            >
              <span className="text-lg">➔</span>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-3xl relative z-10">🤖</span>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 animate-pulse"></div>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
