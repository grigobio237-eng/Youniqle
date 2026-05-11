'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, PenLine, ArrowRight, X, Image as ImageIcon, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SnapInputProps {
  onComplete: (data: { type: 'PHOTO' | 'TEXT'; content: string | File }) => void;
  onCancel: () => void;
  initialImage?: string;
  isDiagnosing?: boolean;
}

export default function SnapInput({ onComplete, onCancel, initialImage, isDiagnosing = false }: SnapInputProps) {
  const [mode, setMode] = useState<'SELECT' | 'PHOTO' | 'TEXT'>(initialImage ? 'PHOTO' : 'SELECT');
  const [memo, setMemo] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);

  const [loadingText, setLoadingText] = useState('회복 리듬 분석 중...');

  // Progress animation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDiagnosing) {
      setProgress(0);
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        let newProgress = 0;
        if (elapsed < 3000) newProgress = (elapsed / 3000) * 80; // 3초 동안 80%까지
        else if (elapsed < 10000) newProgress = 80 + ((elapsed - 3000) / 7000) * 18; // 이후 10초까지 천천히
        else newProgress = 98;
        
        setProgress(newProgress);

        // Dynamic loading text
        if (newProgress < 30) setLoadingText('유니클이 이미지를 해석 중입니다...');
        else if (newProgress < 60) setLoadingText('오늘의 회복 컨텍스트 구성 중...');
        else if (newProgress < 90) setLoadingText('맞춤형 리듬체크 설계 중...');
        else setLoadingText('거의 다 되었습니다...');

      }, 100);
    } else {
      setLoadingText('회복 리듬 분석 중...');
    }
    return () => clearInterval(interval);
  }, [isDiagnosing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMode('PHOTO');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (mode === 'PHOTO' && selectedImage) {
      onComplete({ type: 'PHOTO', content: selectedImage });
    } else if (mode === 'TEXT' && memo.trim()) {
      onComplete({ type: 'TEXT', content: memo });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-start md:justify-center pt-24 pb-12 px-6 md:p-12 overflow-y-auto">
      <button 
        onClick={onCancel}
        className="absolute top-6 right-6 md:top-8 md:right-8 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
        title="닫기"
        aria-label="닫기"
      >
        <X className="w-6 h-6 text-slate" />
      </button>

      <div className="max-w-2xl w-full space-y-12">
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1 bg-chapter-accent/10 rounded-full"
          >
            <span className="text-[10px] font-black text-chapter-accent uppercase tracking-widest">Step 01. Today's Snap</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-obsidian tracking-tighter italic font-serif leading-tight"
          >
            사진은 평가가 아니라 기록입니다.<br />
            얼굴이 아니어도 괜찮아요.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate font-medium"
          >
            음식, 물컵, 책상, 혹은 지금 보이는 창밖 풍경까지.<br />
            당신의 오늘을 대변하는 하나면 충분합니다.
          </motion.p>
        </div>

        {/* Input Section */}
        <AnimatePresence mode="wait">
          {mode === 'SELECT' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group p-8 md:p-12 border-2 border-line border-dashed rounded-[32px] md:rounded-[48px] hover:border-chapter-accent hover:bg-chapter-accent/[0.02] transition-all text-center space-y-6"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-[24px] md:rounded-[32px] flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-chapter-accent/10 transition-all">
                  <Camera className="w-8 h-8 md:w-10 md:h-10 text-slate group-hover:text-chapter-accent" />
                </div>
                <div className="space-y-1">
                  <span className="block text-xl font-black text-obsidian">사진으로 남기기</span>
                  <span className="text-sm text-slate font-medium opacity-60">이미지 한 장으로 기록</span>
                </div>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
                title="사진 업로드"
              />

              <button
                onClick={() => setMode('TEXT')}
                className="group p-8 md:p-12 border-2 border-line border-dashed rounded-[32px] md:rounded-[48px] hover:border-obsidian hover:bg-obsidian/[0.02] transition-all text-center space-y-6"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-[24px] md:rounded-[32px] flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-obsidian/10 transition-all">
                  <PenLine className="w-8 h-8 md:w-10 md:h-10 text-slate group-hover:text-obsidian" />
                </div>
                <div className="space-y-1">
                  <span className="block text-xl font-black text-obsidian">한 줄로 남기기</span>
                  <span className="text-sm text-slate font-medium opacity-60">텍스트 한 줄로 간편하게</span>
                </div>
              </button>
            </motion.div>
          )}

          {mode === 'PHOTO' && (
            <motion.div 
              key="photo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="relative aspect-[4/3] w-full max-w-md mx-auto bg-slate-100 rounded-[32px] overflow-hidden shadow-2xl">
                {selectedImage && (
                  <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                )}
                <button 
                  onClick={() => {
                    setMode('SELECT');
                    setSelectedImage(null);
                    setImageFile(null);
                  }}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-md"
                  title="사진 취소"
                  aria-label="사진 취소"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isDiagnosing}
                  className={`w-full max-w-[300px] h-16 rounded-[24px] text-lg font-black shadow-2xl transition-all group relative overflow-hidden ${isDiagnosing ? 'bg-slate-100' : 'bg-obsidian hover:bg-obsidian/90 text-white shadow-obsidian/20'}`}
                >
                  {isDiagnosing ? (
                    <>
                      {/* Progress Bar Layer */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="absolute inset-y-0 left-0 bg-chapter-accent z-0"
                        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                      />
                      
                      {/* Base Text (Black) - Inactive Layer */}
                      <div className="absolute inset-0 flex items-center justify-center z-10 text-slate/40">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{loadingText}</span>
                          <span className="tabular-nums opacity-60">{Math.round(progress)}%</span>
                        </div>
                      </div>

                      {/* Inverted Text (White) - Active Layer */}
                      <motion.div 
                        className="absolute inset-y-0 left-0 overflow-hidden z-20 flex items-center bg-chapter-accent"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="w-[300px] flex items-center justify-center text-white">
                          <div className="flex items-center gap-2 w-full justify-center">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="whitespace-nowrap">{loadingText}</span>
                            <span className="tabular-nums font-black">{Math.round(progress)}%</span>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <div className="relative z-10 flex items-center justify-center">
                      <span>이 사진으로 결정</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
                <p className="text-xs text-slate font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-chapter-accent" /> 사진은 당신의 보관함에만 안전하게 저장됩니다.
                </p>
              </div>
            </motion.div>
          )}

          {mode === 'TEXT' && (
            <motion.div 
              key="text"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Textarea 
                  placeholder="오늘의 기분이나 남기고 싶은 한 줄을 적어주세요..."
                  title="기록 내용 입력"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="min-h-[200px] text-xl font-medium border-2 border-line rounded-[32px] p-8 focus-visible:ring-obsidian focus-visible:border-obsidian bg-slate-50/30"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-slate font-bold opacity-30">{memo.length} characters</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={!memo.trim() || isDiagnosing}
                  className={`w-full max-w-[340px] h-16 rounded-[24px] text-lg font-black shadow-2xl transition-all group relative overflow-hidden ${isDiagnosing ? 'bg-slate-100' : 'bg-obsidian hover:bg-obsidian/90 text-white shadow-obsidian/20'}`}
                >
                  {isDiagnosing ? (
                    <>
                      {/* Progress Bar Layer */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="absolute inset-y-0 left-0 bg-chapter-accent z-0"
                        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                      />
                      
                      {/* Base Text (Slate) - Inactive Layer */}
                      <div className="absolute inset-0 flex items-center justify-center z-10 text-slate/40">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{loadingText}</span>
                          <span className="tabular-nums opacity-60">{Math.round(progress)}%</span>
                        </div>
                      </div>

                      {/* Inverted Text (White) - Active Layer */}
                      <motion.div 
                        className="absolute inset-y-0 left-0 overflow-hidden z-20 flex items-center bg-chapter-accent"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="w-[340px] flex items-center justify-center text-white">
                          <div className="flex items-center gap-2 w-full justify-center">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="whitespace-nowrap">{loadingText}</span>
                            <span className="tabular-nums font-black">{Math.round(progress)}%</span>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <div className="relative z-10 flex items-center justify-center">
                      <span>이 기록으로 결정</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
                <button 
                  onClick={() => setMode('SELECT')}
                  disabled={isDiagnosing}
                  className="text-slate font-bold text-sm opacity-40 hover:opacity-100 transition-opacity disabled:pointer-events-none"
                >
                  사진 촬영으로 돌아가기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Nudge Footer - Hidden when in sub-modes to focus */}
        {mode === 'SELECT' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-12 border-t border-line text-center"
          >
            <p className="text-sm font-black text-obsidian/40 italic tracking-widest uppercase">
              RECOVER YOUR RHYTHM © YOUNIQLE
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
