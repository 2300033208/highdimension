import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Copy, Check, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser ? 'bg-accent text-white' : 'bg-[var(--color-glass-active)] text-accent'}`}>
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-2 ${isUser ? 'bg-accent text-white rounded-tr-none' : 'glass rounded-tl-none border border-[var(--color-glass-border)] bg-[var(--color-surface)]/60 text-ink'}`}>
          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const [copied, setCopied] = useState(false);
                  
                  const handleCopy = () => {
                    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  };

                  if (!inline && match) {
                    return (
                      <div className="relative group mt-2 mb-2">
                        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                          >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg !bg-gray-900 !m-0 !p-3 text-[13px]"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  return (
                    <code className="bg-black/10 dark:bg-white/10 rounded px-1.5 py-0.5 text-[13px]" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
