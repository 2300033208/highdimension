import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  "Explain BO",
  "Compare SAASBO vs TuRBO",
  "How to tune hyperparameters?",
  "What is expected improvement?"
];

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
    if (e.target.value.trim() !== '') {
      setShowSuggestions(false);
    }
  };

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSend(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full flex flex-col gap-3 p-4 bg-canvas/80 backdrop-blur-md border-t border-[var(--color-glass-border)] relative z-10">
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2"
          >
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full glass border border-[var(--color-glass-border)] bg-[var(--color-surface)] hover:bg-[var(--color-glass-hover)] text-ink-dim hover:text-ink transition-colors"
              >
                <Sparkles className="h-3 w-3 text-accent" />
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative flex items-end w-full glass rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-glass-input)] p-1 shadow-sm focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI anything..."
          className="w-full max-h-[200px] min-h-[40px] resize-none bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none custom-scrollbar"
          rows={1}
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="m-1 shrink-0 h-8 w-8 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
