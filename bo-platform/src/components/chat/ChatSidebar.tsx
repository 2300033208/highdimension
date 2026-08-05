import React, { useState } from 'react';
import { Plus, MessageSquare, Search, Trash2, Pin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChatSession {
  id: string;
  title: string;
  pinned?: boolean;
  date: Date;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  onClose: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePin,
  onClose
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter(s => s.pinned);
  const recentSessions = filteredSessions.filter(s => !s.pinned);

  return (
    <div className="w-64 h-full border-r border-[var(--color-glass-border)] bg-canvas/90 backdrop-blur-xl flex flex-col z-20">
      <div className="p-4 border-b border-[var(--color-glass-border)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Chat History</h2>
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-ink-dim hover:bg-[var(--color-glass-hover)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={onNewSession}
          className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-hover text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--color-glass-input)] border border-[var(--color-glass-input-border)] text-xs text-ink placeholder:text-ink-faint outline-none focus:border-accent/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
        {pinnedSessions.length > 0 && (
          <div>
            <h3 className="px-2 text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1">Pinned</h3>
            <div className="space-y-0.5">
              {pinnedSessions.map(session => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  onSelect={() => onSelectSession(session.id)}
                  onDelete={() => onDeleteSession(session.id)}
                  onTogglePin={() => onTogglePin(session.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="px-2 text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1">Recent</h3>
          <div className="space-y-0.5">
            {recentSessions.map(session => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={() => onSelectSession(session.id)}
                onDelete={() => onDeleteSession(session.id)}
                onTogglePin={() => onTogglePin(session.id)}
              />
            ))}
            {recentSessions.length === 0 && (
              <p className="px-2 text-xs text-ink-faint mt-2">No recent chats</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionItem({ 
  session, 
  isActive, 
  onSelect, 
  onDelete, 
  onTogglePin 
}: { 
  session: ChatSession; 
  isActive: boolean; 
  onSelect: () => void; 
  onDelete: () => void; 
  onTogglePin: () => void; 
}) {
  return (
    <div 
      className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive ? 'bg-[var(--color-glass-active)] text-ink' : 'text-ink-dim hover:bg-[var(--color-glass-hover)] hover:text-ink'
      }`}
      onClick={onSelect}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
      <span className="text-xs truncate flex-1">{session.title}</span>
      
      <div className="hidden group-hover:flex items-center gap-1 absolute right-2 bg-canvas/80 px-1 rounded backdrop-blur-sm">
        <button 
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          className="p-1 hover:text-accent transition-colors"
          title={session.pinned ? "Unpin" : "Pin"}
        >
          <Pin className={`h-3 w-3 ${session.pinned ? 'fill-accent text-accent' : ''}`} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 hover:text-danger transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
