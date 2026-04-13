'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, History, Lock, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MembershipUpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MembershipUpsellDialog({ open, onOpenChange }: MembershipUpsellDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-[40px] overflow-hidden border-none p-0 bg-transparent">
        <div className="bg-obsidian p-8 text-center space-y-6 relative overflow-hidden">
          {/* Custom Close Button for Dark Background */}
          <button 
            onClick={() => onOpenChange(false)}
            aria-label="닫기"
            className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
          >
            <X className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
          </button>

          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-chapter-accent/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-reward-gold/10 blur-2xl rounded-full -ml-12 -mb-12" />
          
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-xl">
              <Lock className="w-8 h-8 text-reward-gold" />
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-reward-gold/20 text-reward-gold text-[10px] font-black uppercase tracking-widest mb-2 border border-reward-gold/30">
                Premium Feature
              </div>
              <DialogTitle className="text-2xl font-black text-white tracking-tight leading-tight">
                스캔 타임라인 기록은<br />유니클 Pass & 구독 회원 전용 기능입니다
              </DialogTitle>
            </div>

            <DialogDescription className="text-white/60 text-sm font-medium leading-relaxed break-keep px-4">
              회복의 핵심은 지속적인 '추적 관찰'에 있습니다.<br />
              매일의 스캔 데이터를 타임라인에 누적하여<br />
              나만의 건강 변화를 정밀하게 분석해보세요.
            </DialogDescription>
          </div>
        </div>

        <div className="bg-white p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-mist/50 border border-line/50">
              <div className="mt-1 w-8 h-8 rounded-xl bg-chapter-accent/10 flex items-center justify-center flex-shrink-0">
                <History className="w-4 h-4 text-chapter-accent" />
              </div>
              <div>
                <h4 className="text-sm font-black text-obsidian">무제한 타임라인 기록</h4>
                <p className="text-[11px] text-slate/60 font-bold">스캔한 모든 데이터를 날짜별로 영구히 보관합니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-mist/50 border border-line/50">
              <div className="mt-1 w-8 h-8 rounded-xl bg-reward-gold/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-reward-gold" />
              </div>
              <div>
                <h4 className="text-sm font-black text-obsidian">정밀 추적 리포트</h4>
                <p className="text-[11px] text-slate/60 font-bold">기록된 데이터를 기반으로 시각화된 회복 추이를 제공합니다.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={() => {
                onOpenChange(false);
                // 현재 멤버십 페이지가 없으므로 토스트 메시지로 대체하거나 
                // 향후 생성될 멤버십 페이지(/pass)로 연결합니다.
                router.push('/?action=pass-info'); 
              }}
              className="w-full h-16 bg-obsidian hover:bg-black text-white rounded-[20px] font-black italic tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-obsidian/20 group transition-all"
            >
              유니클 멤버십 혜택 알아보기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <button 
              onClick={() => onOpenChange(false)}
              className="w-full mt-4 text-[10px] font-black text-slate/40 hover:text-obsidian uppercase tracking-[0.2em] transition-colors"
            >
              다음에 할게요
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
