import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY || '');

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction:
    'You are a helpful assistant for the Uly Dala web app — an interactive 3D map of Almaty, Kazakhstan. ' +
    'You help users understand air quality data (AQI), traffic conditions, city landmarks, and navigation around Almaty. ' +
    'Be concise and friendly. Answer in the same language the user writes in.',
  generationConfig: { maxOutputTokens: 512 },
});

export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Hi! I\'m your Uly Dala assistant. Ask me anything about Almaty, air quality, traffic, or the city.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = model.startChat({ history: [] });
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const result = await chatRef.current.sendMessage(text);
      const response = await result.response;
      setMessages((prev) => [...prev, { role: 'model', text: response.text() }]);
    } catch (err) {
      console.error('Gemini error:', err?.message, err?.status, err);
      const is429 = err?.message?.includes('429') || err?.status === 429;
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: is429
            ? 'Rate limit reached. Please wait a moment and try again.'
            : `Error: ${err?.message || 'Something went wrong.'}`,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="absolute bottom-4 right-4 z-20 w-80 flex flex-col bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden"
      style={{ maxHeight: '70vh' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-sm font-semibold">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-sm'
                  : msg.error
                  ? 'bg-red-900/50 text-red-300 rounded-bl-sm'
                  : 'bg-gray-800 text-gray-200 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-3 pb-3 pt-2 border-t border-gray-700/50 flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about Almaty..."
            disabled={loading}
            className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-3 py-2 outline-none border border-gray-700 focus:border-cyan-500 transition-colors placeholder-gray-500 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
