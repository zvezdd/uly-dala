import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AvatarContext = createContext(null);

export function AvatarProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessage(messages.length > 0 ? messages[0] : null);
  }, [messages]);

  const onMessagePlayed = useCallback(() => {
    setMessages((prev) => prev.slice(1));
  }, []);

  const speak = useCallback(async (text) => {
    if (!text?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`/api/speak returned ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.warn('[AvatarContext] ElevenLabs unavailable, falling back to browser TTS:', err.message);
      setMessages((prev) => [
        ...prev,
        { audio: null, lipsync: { mouthCues: [] }, animation: 'Talking_0', ttsText: text },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AvatarContext.Provider value={{ message, onMessagePlayed, speak, loading }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatarContext() {
  return useContext(AvatarContext);
}
