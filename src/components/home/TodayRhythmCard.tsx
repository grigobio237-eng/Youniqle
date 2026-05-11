'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Moon, Zap, Coffee, CheckCircle2, ArrowRight } from 'lucide-react';

interface RhythmAction {
  text: string;
  isCompleted?: boolean;
}

interface TodayRhythmCardProps {
  score: number;
  userName: string;
}

export default function TodayRhythmCard({ score, userName }: TodayRhythmCardProps) {
  const [missions, setMissions] = React.useState<any[]>([]);
  const [loadingMissions, setLoadingMissions] = React.useState(true);

  React.useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await fetch('/api/user/missions');
        if (res.ok) {
          const data = await res.json();
          setMissions(data.missions);
        }
      } catch (err) {
        console.error('Failed to fetch missions:', err);
      } finally {
        setLoadingMissions(false);
      }
    };
    fetchMissions();
  }, []);

  const getRhythmType = () => {
    if (score < 40) return { 
      type: "수면 리듬 주의형", 
      description: "조금씩 회복의 궤도에 진입하고 있어요. 오늘은 평소보다 일찍 쉬어볼까요?",
      icon: <Moon className="w-8 h-8 text-secondary-container" />
    };
    if (score < 70) return { 
      type: "회복 성장형", 
      description: "건강한 변화가 시작되고 있어요! 작은 기록들이 당신을 더 빛나게 할 거예요.",
      icon: <Sparkles className="w-8 h-8 text-primary" />
    };
    return { 
      type: "에너지 충전형", 
      description: "전반적으로 안정적인 리듬입니다. 오늘은 깊은 이완에 집중해보세요.",
      icon: <Zap className="w-8 h-8 text-primary" />
    };
  };

  const { type, description, icon } = getRhythmType();

  const handleMissionClick = (mission: any) => {
    if (!mission.isCompleted && mission.href) {
      window.location.href = mission.href;
    }
  };

  // Circular Score Logic
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface/40 backdrop-blur-2xl rounded-5xl p-10 md:p-14 border border-white/20 relative overflow-hidden shadow-2xl shadow-primary/5"
    >
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start relative z-10">
        
        {/* Left: Circular Score */}
        <div className="relative flex flex-col items-center shrink-0">
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="50%" cy="50%" r={radius + "%"}
                className="fill-none stroke-background/30 stroke-[8px]"
              />
              <motion.circle
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="50%" cy="50%" r={radius + "%"}
                className="fill-none stroke-primary stroke-[8px] stroke-linecap-round"
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-6xl font-bold text-foreground">{score}</span>
              <span className="text-xs font-bold text-foreground/30 uppercase tracking-[0.3em] mt-2">Recovery</span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary/60">Today's Rhythm</span>
            <h3 className="text-2xl font-bold text-foreground mt-2">{type}</h3>
          </div>
        </div>

        {/* Right: Description & Actions */}
        <div className="flex-1 space-y-12">
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-inner">
                {icon}
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              "{userName}님, {description}"
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em] mb-6">나를 위한 오늘의 작은 행동</p>
            <div className="grid grid-cols-1 gap-4">
              {loadingMissions ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-background/20 rounded-full animate-pulse" />
                ))
              ) : (
                missions.map((mission, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleMissionClick(mission)}
                    className={`flex items-center gap-5 bg-background/40 backdrop-blur-sm p-6 rounded-full border transition-all ${
                      mission.isCompleted 
                        ? 'border-primary/10 opacity-60' 
                        : 'border-white/20 hover:bg-white/60 cursor-pointer hover:scale-[1.02]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      mission.isCompleted 
                        ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                        : 'border-primary/20'
                    }`}>
                      {mission.isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`text-base md:text-lg font-bold transition-all ${
                        mission.isCompleted ? 'text-foreground/30 line-through' : 'text-foreground/70'
                      }`}>
                        {mission.text}
                      </span>
                      {!mission.isCompleted && <ArrowRight className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Light Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-secondary-container/5 blur-[100px] -ml-30 -mb-30 pointer-events-none" />
    </motion.div>
  );
}
