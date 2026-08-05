import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Maximize2, Minimize2, PanelLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSidebar, ChatSession } from './ChatSidebar';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load sessions on mount
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("hdbo_auth");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/v1/chat/sessions', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json.sessions || [];
        setSessions(list.map((s: any) => ({
          id: String(s.id),
          title: s.title || 'Conversation',
          date: new Date(s.createdAt || s.date || Date.now()),
          pinned: s.pinned || false
        })));
      }
    } catch (e) {
      console.warn("Failed to fetch chat sessions", e);
    }
  };

  const handleNewSession = async () => {
    try {
      const res = await fetch('/api/v1/chat/sessions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: 'New Conversation' })
      });
      if (res.ok) {
        const json = await res.json();
        const session = json.data;
        const newSession: ChatSession = {
          id: String(session.id),
          title: session.title || 'New Conversation',
          date: new Date(session.createdAt || Date.now()),
          pinned: false
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setMessages([]);
        setSidebarOpen(false);
        return;
      }
    } catch (e) {
      console.warn("Fallback to local session", e);
    }
    const localId = uuidv4();
    setSessions(prev => [{ id: localId, title: 'New Conversation', date: new Date() }, ...prev]);
    setActiveSessionId(localId);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectSession = async (id: string) => {
    setActiveSessionId(id);
    setSidebarOpen(false);
    try {
      const res = await fetch(`/api/v1/chat/sessions/${id}/messages`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json.messages || [];
        setMessages(list.map((m: any) => ({
          id: String(m.id || uuidv4()),
          role: m.role ? (m.role.toLowerCase() as 'user' | 'assistant') : 'assistant',
          content: m.content || ''
        })));
      }
    } catch (e) {
      console.warn("Failed to fetch session messages", e);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await fetch(`/api/v1/chat/sessions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch {
      // ignore
    }
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([]);
    }
  };

  const handleTogglePin = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
  };

  const handleSendMessage = async (content: string) => {
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const sRes = await fetch('/api/v1/chat/sessions', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ title: content.slice(0, 30) + '...' })
        });
        if (sRes.ok) {
          const sJson = await sRes.json();
          sessionId = String(sJson.data.id);
          const newSession: ChatSession = {
            id: sessionId,
            title: sJson.data.title || content.slice(0, 30) + '...',
            date: new Date(),
          };
          setSessions(prev => [newSession, ...prev]);
          setActiveSessionId(sessionId);
        }
      } catch {
        // fallback
      }
      if (!sessionId) {
        sessionId = '1';
        setActiveSessionId(sessionId);
      }
    }

    const userMessage: Message = { id: uuidv4(), role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const pageContextStr = JSON.stringify({
        pathname: location.pathname,
        search: location.search,
      });

      const res = await fetch(`/api/v1/chat/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: content, pageContext: pageContextStr }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = '';
      const assistantMessageId = uuidv4();

      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);
      setIsTyping(false);

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                const chunk = data.content || data.delta || (typeof data === 'string' ? data : '');
                assistantMessageContent += chunk;
                setMessages(prev => 
                  prev.map(m => m.id === assistantMessageId ? { ...m, content: assistantMessageContent } : m)
                );
              } catch {
                assistantMessageContent += dataStr;
                setMessages(prev => 
                  prev.map(m => m.id === assistantMessageId ? { ...m, content: assistantMessageContent } : m)
                );
              }
            } else if (line.trim().length > 0) {
              assistantMessageContent += line;
              setMessages(prev => 
                prev.map(m => m.id === assistantMessageId ? { ...m, content: assistantMessageContent } : m)
              );
            }
          }
        }
      }
    } catch (e) {
      console.warn("Chat error:", e);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: "I'm having trouble connecting to the local AI service. Please ensure the backend and Ollama (or API service) are active."
        }
      ]);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
            className="fixed bottom-6 right-10 h-14 w-14 bg-accent hover:bg-accent-hover text-white rounded-full shadow-xl shadow-accent/20 flex items-center justify-center z-50 transition-colors"
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isExpanded ? '100vw' : '400px',
              height: isExpanded ? '100vh' : '650px',
              bottom: isExpanded ? 0 : '1.5rem',
              right: isExpanded ? 0 : '2.5rem',
              borderRadius: isExpanded ? 0 : '1.5rem'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed z-50 flex overflow-hidden glass border border-[var(--color-glass-border)] shadow-2xl bg-canvas/60 backdrop-blur-3xl"
          >
            {/* Sidebar */}
            <AnimatePresence>
              {(sidebarOpen || isExpanded) && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 256, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="shrink-0"
                >
                  <ChatSidebar
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={handleSelectSession}
                    onNewSession={handleNewSession}
                    onDeleteSession={handleDeleteSession}
                    onTogglePin={handleTogglePin}
                    onClose={() => setSidebarOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
              {/* Header */}
              <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-[var(--color-glass-border)] bg-canvas/40">
                <div className="flex items-center gap-3">
                  {!isExpanded && (
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      aria-label="Toggle sidebar"
                      className="p-2 -ml-2 rounded-lg text-ink-dim hover:text-ink hover:bg-[var(--color-glass-hover)] transition-colors"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                      AI Assistant
                    </h2>
                    <p className="text-[10px] text-ink-faint">Powered by HyperBench</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
                    className="p-2 rounded-lg text-ink-dim hover:text-ink hover:bg-[var(--color-glass-hover)] transition-colors"
                  >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat"
                    className="p-2 rounded-lg text-ink-dim hover:text-ink hover:bg-danger/10 hover:text-danger transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="h-12 w-12 rounded-2xl bg-[var(--color-glass-active)] flex items-center justify-center mb-4">
                      <MessageSquare className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-base font-semibold text-ink mb-2">How can I help you today?</h3>
                    <p className="text-sm text-ink-dim max-w-xs">
                      Ask me about Bayesian Optimization, hyperparameter tuning, or navigate the platform.
                    </p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
                  ))
                )}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 w-full items-center"
                  >
                    <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-[var(--color-glass-active)] text-accent">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <ChatInput onSend={handleSendMessage} disabled={isTyping} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
