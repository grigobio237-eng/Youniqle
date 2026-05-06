'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Moon, Zap, Coffee, CheckCircle2 } from 'lucide-react';

interface RhythmAction {
  text: string;
  isCompleted?: boolean;
}

interface TodayRhythmCardProps {
  score: number;
  userName: string;
}

export default function TodayRhythmCard({ score, userName }: TodayRhythmCardProps) {
  // Logic to determine rhythm type (placeholder logic)
  let type = "에너지 충전형";
  let description = "전반적으로 안정적인 리듬입니다. 오늘은 깊은 이완에 집중해보세요.";
  let actions: RhythmAction[] = [
    { text: "저녁 8시 이후 블루라이트 차단하기", isCompleted: false },
    { text: "미지근한 물로 10분간 족욕하기", isCompleted: false },
    { text: "사운드 테라피 '심해의 휴식' 청취", isCompleted: false }
  ];
  let icon = <Zap className="w-8 h-8 text-reward-gold" />;
  let themeColor = "bg-status-good/5 border-status-good/20";

  if (score < 40) {
    type = "수면 리듬 주의형";
    description = "수면 부채가 누적되고 있습니다. 오늘은 평소보다 30분 일찍 잠자리에 드는 것을 권장합니다.";
    actions = [
      { text: "카페인 섭취 중단 (오후 2시 이후)", isCompleted: true },
      { text: "침실 온도 20-22도로 조절하기", isCompleted: false },
      { text: "내일 아침 10분간 햇빛 쬐기", isCompleted: false }
    ];
    icon = <Moon className="w-8 h-8 text-chapter-accent" />;
    themeColor = "bg-chapter-accent/5 border-chapter-accent/20";
  } else if (score < 70) {
    type = "리듬 회복 지향형";
    description = "조금씩 회복의 궤도에 진입하고 있습니다. 꾸준한 스냅 기록이 변화를 앞당깁니다.";
    actions = [
      { text: "가벼운 스트레칭 5분 실시", isCompleted: false },
      { text: "단백질 중심의 식단 구성하기", isCompleted: true },
      { text: "오늘의 감사한 일 한 줄 기록하기", isCompleted: false }
    ];
    icon = <Sparkles className="w-8 h-8 text-reward-gold" />;
    themeColor = "bg-reward-gold/5 border-reward-gold/20";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[40px] p-8 md:p-10 border-2 ${themeColor} relative overflow-hidden group shadow-sm`}
    >
      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        {/* Icon & Type */}
        <div className="flex flex-col items-center md:items-start space-y-4 shrink-0">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-line/50 group-hover:rotate-6 transition-transform">
            {icon}
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate/60">Today's Rhythm Type</span>
            <h3 className="text-2xl font-black text-obsidian tracking-tighter mt-1 italic font-serif">{type}</h3>
          </div>
        </div>

        {/* Description & Actions */}
        <div className="flex-1 space-y-8">
          <div className="space-y-3">
            <p className="text-obsidian font-bold text-lg md:text-xl leading-snug">
              "{userName}님, {description}"
            </p>
            <div className="h-[2px] w-12 bg-line" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {actions.map((action, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-line/30 group/item transition-all"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${action.isCompleted ? 'bg-chapter-accent border-chapter-accent' : 'border-line'}`}>
                  {action.isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <span className={`text-sm font-bold ${action.isCompleted ? 'text-slate/40 line-through' : 'text-obsidian'}`}>
                  {action.text}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
    </motion.div>
  );
}
