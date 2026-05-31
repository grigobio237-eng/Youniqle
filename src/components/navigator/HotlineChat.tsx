'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Brain,
  MessageCircle,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function HotlineChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const userName = session?.user?.name || '네비게이터';

  useEffect(() => {
    // Initial greeting if empty
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `반갑습니다, ${userName}님. 유니클 줄기세포 기술 자문위원입니다. 궁금한 점이 있다면 무엇이든 편하게 물어보세요. 제가 알기 쉽게 설명해 드리고, 고객 안내 시 도움이 될 수 있는 핵심 포인트도 짚어드리겠습니다.`,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }, [userName]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/navigator/hotline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputMessage,
          history: messages.slice(-10) // Context limited to last 10 messages
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          role: 'assistant',
          content: data.response || '응답을 가져올 수 없습니다.',
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        toast.error('유니클 응답 도중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('대화 내용을 초기화하시겠습니까? (이 기록은 저장되지 않습니다)')) {
      setMessages([
        {
          role: 'assistant',
          content: `반갑습니다, ${userName}님. 새롭게 궁금하신 점이 있으실까요?`,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-[40px] border border-line shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="px-4 py-4 sm:px-8 sm:py-6 bg-obsidian text-white flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-mist" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-xl font-serif tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                자문위 유니클 핫라인
              </h2>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-chapter-accent text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white shadow-md w-fit shrink-0">
                <Brain className="w-2.5 h-2.5" />
                Technical Expert
              </div>
            </div>
            <p className="text-mist/70 text-[8px] sm:text-[10px] uppercase font-bold tracking-widest mt-0.5 truncate">
               Consultation Assistant Engine
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleReset}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all text-white/70 hover:text-white shrink-0"
          title="대화 초기화"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-hide bg-[#F8FAFC]"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isAI = msg.role === 'assistant';
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-9 h-9 rounded-xl bg-obsidian flex items-center justify-center shrink-0 shadow-lg shadow-obsidian/20">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] space-y-1.5 ${!isAI && 'text-right'}`}>
                   <div className={`px-6 py-4 rounded-[28px] text-[15px] leading-relaxed shadow-sm border ${
                     isAI 
                      ? 'bg-white border-line text-obsidian rounded-tl-none font-medium' 
                      : 'bg-chapter-accent border-chapter-accent text-white rounded-tr-none font-black'
                   }`}>
                     {msg.content.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-3' : ''}>{line}</p>
                     ))}
                   </div>
                   <span className="text-[10px] font-black uppercase text-slate/50 tracking-widest px-2">
                     {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>

                {!isAI && (
                  <div className="w-9 h-9 rounded-xl bg-mist flex items-center justify-center shrink-0 border border-line">
                    <User className="w-5 h-5 text-obsidian" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex gap-4 justify-start"
          >
            <div className="w-9 h-9 rounded-xl bg-obsidian flex items-center justify-center shrink-0 animate-pulse">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-line px-6 py-4 rounded-[28px] rounded-tl-none shadow-sm flex items-center gap-3">
               <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-slate/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-slate/20 rounded-full animate-bounce" />
               </div>
               <span className="text-[10px] font-black text-slate/60 uppercase tracking-widest">
                  Analyzing consultation point...
               </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 pb-10 bg-white border-t border-line shrink-0">
         <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-4 bg-mist/30 border border-line p-2 pl-6 rounded-[32px] focus-within:ring-4 focus-within:ring-chapter-accent/5 transition-all"
        >
          <Input 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            placeholder="궁금한 내용을 쉽게 물어보세요 (예: 줄기세포의 종류와 차이점)"
            className="flex-1 border-none focus-visible:ring-0 bg-transparent font-bold placeholder:text-slate/60 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
          />
          <Button 
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-12 h-12 rounded-[24px] bg-obsidian text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-obsidian/10"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        
        <div className="mt-4 flex items-center justify-center gap-6">
           <div className="flex items-center gap-1.5 text-slate/60">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Technical Support ID: Expert-2.0</span>
           </div>
           <div className="w-1 h-1 bg-line rounded-full" />
           <p className="text-[10px] font-black uppercase text-slate/60 tracking-widest italic">
              YOUNIQLE responses are for reference only.
           </p>
        </div>

      </div>

      {/* Decor Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-chapter-accent/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-chapter-accent/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
    </div>
  );
}
