'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Volume2, Moon, Sun, Wind, Waves, 
  Headphones, Sparkles, CloudRain, Trees, Flame, Zap, X, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SoundVisualizer } from '@/components/therapy/SoundVisualizer';
import { toast } from 'sonner';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useSession } from 'next-auth/react';
import { AccessControl } from '@/lib/logic/access-control';
import MembershipUpsellDialog from '@/components/auth/MembershipUpsellDialog';


const FREQUENCIES = [
  { id: 'delta', name: '편안한', desc: '깊은 수면과 세포 재생 (432Hz)', freq: 432 },
  { id: 'theta', name: '상쾌한', desc: '창의력 및 에너지 회복 (528Hz)', freq: 528 },
  { id: 'alpha', name: '차분한', desc: '마음의 안정과 조화 (639Hz)', freq: 639 },
  { id: 'solfeggio', name: '맑은', desc: '직관력 향상 및 정화 (741Hz)', freq: 741 },
];

const BASIC_NOISES = [
  { id: 'white', name: '백색 소음', icon: <Wind className="w-5 h-5" /> },
  { id: 'pink', name: '핑크 노이즈', icon: <Waves className="w-5 h-5" /> },
  { id: 'brown', name: '브라운 노이즈', icon: <Headphones className="w-5 h-5" /> },
];

const NATURE_LAYERS = [
  { id: 'rain', name: '빗소리', icon: <CloudRain className="w-5 h-5" />, color: 'text-blue-400' },
  { id: 'forest', name: '숲소리', icon: <Trees className="w-5 h-5" />, color: 'text-green-400' },
  { id: 'fire', name: '모닥불', icon: <Flame className="w-5 h-5" />, color: 'text-orange-400' },
];

export default function SoundTherapy() {
  const { data: session } = useSession();
  const userTier = AccessControl.getUserGroup(session?.user);
  const isFreeUser = userTier === 'RESET' || userTier === 'NONE';

  // 맛보기 모드: 432Hz(delta)와 백색소음(white)만 무료, 나머지 잠금
  const isFreqLocked = (freqId: string) => isFreeUser && freqId !== 'delta';
  const isNatureLocked = (natureId: string) => isFreeUser; // 자연음은 전부 프리미엄

  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [showUpsell, setShowUpsell] = useState(false);
  const { trackEvent } = useActivityTracker();
  const startTimeRef = useRef<number | null>(null);

  
  // Mixer State
  const [selectedFreq, setSelectedFreq] = useState(FREQUENCIES[0]);
  const [freqVolume, setFreqVolume] = useState(0.15);
  const [selectedNoise, setSelectedNoise] = useState(BASIC_NOISES[1]); 
  const [noiseVolume, setNoiseVolume] = useState(0.1);
  const [selectedNature, setSelectedNature] = useState(NATURE_LAYERS[0]); 
  const [natureVolume, setNatureVolume] = useState(0.7);
  const [timeLeft, setTimeLeft] = useState(1200);

  // Web Audio Refs
  const audioCtx = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const noiseSource = useRef<AudioBufferSourceNode | null>(null);
  const natureSource = useRef<AudioBufferSourceNode | null>(null);
  const freqGain = useRef<GainNode | null>(null);
  const noiseGain = useRef<GainNode | null>(null);
  const natureGain = useRef<GainNode | null>(null);
  const masterGainNode = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGainNode.current = audioCtx.current.createGain();
        masterGainNode.current.connect(audioCtx.current.destination);
        masterGainNode.current.gain.setValueAtTime(masterVolume, audioCtx.current.currentTime);
        freqGain.current = audioCtx.current.createGain();
        freqGain.current.connect(masterGainNode.current);
        noiseGain.current = audioCtx.current.createGain();
        noiseGain.current.connect(masterGainNode.current);
        natureGain.current = audioCtx.current.createGain();
        natureGain.current.connect(masterGainNode.current);
    }
  };

  const createBuffer = (type: 'white' | 'pink' | 'brown') => {
    if (!audioCtx.current) return null;
    const ctx = audioCtx.current;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    } else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }
    } else if (type === 'brown') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            const out = (lastOut + (0.02 * white)) / 1.02;
            output[i] = out * 3.5;
            lastOut = out;
        }
    }
    return buffer;
  };

  const startNatureSound = () => {
    if (!audioCtx.current || !natureGain.current) return;
    if (natureSource.current) {
        try { natureSource.current.stop(); } catch(e) {}
    }
    natureSource.current = audioCtx.current.createBufferSource();
    const bufferType = selectedNature.id === 'forest' ? 'pink' : 'white';
    natureSource.current.buffer = createBuffer(bufferType);
    natureSource.current.loop = true;
    const filter = audioCtx.current.createBiquadFilter();
    if (selectedNature.id === 'rain') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, audioCtx.current.currentTime);
        filter.Q.setValueAtTime(1, audioCtx.current.currentTime);
    } else if (selectedNature.id === 'forest') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, audioCtx.current.currentTime);
        // Wind LFO for dynamic movement
        const lfo = audioCtx.current.createOscillator();
        const lfoGain = audioCtx.current.createGain();
        lfo.frequency.value = 0.12; 
        lfoGain.gain.value = 450;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
    } else if (selectedNature.id === 'fire') {
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, audioCtx.current.currentTime);
    }
    natureSource.current.connect(filter);
    filter.connect(natureGain.current);
    natureSource.current.start();
  };

  const startNoiseSound = () => {
    if (!audioCtx.current || !noiseGain.current) return;
    if (noiseSource.current) {
        try { noiseSource.current.stop(); } catch(e) {}
    }
    noiseSource.current = audioCtx.current.createBufferSource();
    noiseSource.current.buffer = createBuffer(selectedNoise.id as any);
    noiseSource.current.loop = true;
    noiseSource.current.connect(noiseGain.current);
    noiseSource.current.start();
  };

  const startFrequency = () => {
    if (!audioCtx.current || !freqGain.current) return;
    if (oscillator.current) {
        try { oscillator.current.stop(); } catch(e) {}
    }
    oscillator.current = audioCtx.current.createOscillator();
    oscillator.current.type = 'sine';
    oscillator.current.frequency.setValueAtTime(selectedFreq.freq, audioCtx.current.currentTime);
    oscillator.current.connect(freqGain.current);
    oscillator.current.start();
  };

  const startTherapy = () => {
    initAudio();
    if (!audioCtx.current) return;
    audioCtx.current.resume();
    startFrequency();
    startNoiseSound();
    startNatureSound();
    const now = audioCtx.current.currentTime;
    
    // Reset master gain to current volume immediately
    masterGainNode.current?.gain.cancelScheduledValues(now);
    masterGainNode.current?.gain.setValueAtTime(masterVolume, now);

    // Fade in tracks
    freqGain.current?.gain.cancelScheduledValues(now);
    freqGain.current?.gain.setValueAtTime(0, now);
    freqGain.current?.gain.linearRampToValueAtTime(freqVolume, now + 1);
    
    noiseGain.current?.gain.cancelScheduledValues(now);
    noiseGain.current?.gain.setValueAtTime(0, now);
    noiseGain.current?.gain.linearRampToValueAtTime(noiseVolume, now + 1);
    
    natureGain.current?.gain.cancelScheduledValues(now);
    natureGain.current?.gain.setValueAtTime(0, now);
    natureGain.current?.gain.linearRampToValueAtTime(natureVolume, now + 1);
    setIsPlaying(true);
    startTimeRef.current = Date.now();

    // 트래킹: 치유 세션 시작
    trackEvent('sound_therapy_start', {
      itemType: 'content',
      itemData: {
        frequency: selectedFreq.name,
        frequencyValue: selectedFreq.freq,
        noiseType: selectedNoise.name,
        natureType: selectedNature.name,
        volumes: { master: masterVolume, freq: freqVolume, noise: noiseVolume, nature: natureVolume }
      }
    });
  };


  const stopTherapy = () => {
    if (!audioCtx.current || !masterGainNode.current) return;
    const now = audioCtx.current.currentTime;
    masterGainNode.current.gain.exponentialRampToValueAtTime(0.0001, now + 1);
    setTimeout(() => {
      oscillator.current?.stop();
      noiseSource.current?.stop();
      natureSource.current?.stop();
      setIsPlaying(false);
      
      // 트래킹: 세션 종료 및 소요 시간 기록
      if (startTimeRef.current) {
        const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        trackEvent('sound_therapy_stop', {
          itemType: 'content',
          behaviorData: {
            duration: durationSeconds,
            completionRate: Math.min(100, (durationSeconds / 1200) * 100)
          },
          itemData: {
            frequency: selectedFreq.id,
            noise: selectedNoise.id,
            nature: selectedNature.id
          }
        });
        startTimeRef.current = null;
      }

      if (audioCtx.current) {
        masterGainNode.current?.gain.setValueAtTime(masterVolume, audioCtx.current.currentTime);
      }
    }, 1100);
  };


  useEffect(() => {
    if (isPlaying) startFrequency();
  }, [selectedFreq]);

  useEffect(() => {
    if (isPlaying) startNoiseSound();
  }, [selectedNoise]);

  useEffect(() => {
    if (isPlaying) startNatureSound();
  }, [selectedNature]);

  useEffect(() => {
    if (isPlaying && audioCtx.current && masterGainNode.current) {
        const now = audioCtx.current.currentTime;
        
        // Use a small ramp for smooth changes without clicks
        masterGainNode.current.gain.cancelScheduledValues(now);
        masterGainNode.current.gain.setValueAtTime(masterGainNode.current.gain.value, now);
        masterGainNode.current.gain.linearRampToValueAtTime(masterVolume, now + 0.1);

        freqGain.current?.gain.cancelScheduledValues(now);
        freqGain.current?.gain.setValueAtTime(freqGain.current.gain.value, now);
        freqGain.current?.gain.linearRampToValueAtTime(freqVolume, now + 0.1);

        noiseGain.current?.gain.cancelScheduledValues(now);
        noiseGain.current?.gain.setValueAtTime(noiseGain.current.gain.value, now);
        noiseGain.current?.gain.linearRampToValueAtTime(noiseVolume, now + 0.1);

        natureGain.current?.gain.cancelScheduledValues(now);
        natureGain.current?.gain.setValueAtTime(natureGain.current.gain.value, now);
        natureGain.current?.gain.linearRampToValueAtTime(natureVolume, now + 0.1);
    }
  }, [masterVolume, freqVolume, noiseVolume, natureVolume, isPlaying]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && isPlaying) {
      stopTherapy();
      toast.success("명상이 종료되었습니다.");
    }
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    return () => {
        if (isPlaying) stopTherapy();
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const labelStyle = "text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-2";
  const cardStyle = "space-y-4 bg-white/[0.05] p-6 rounded-[32px] border border-white/10 backdrop-blur-sm";

  return (
    <div className="w-full max-w-4xl mx-auto bg-black text-white p-6 md:p-10 rounded-[40px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          <div className="relative aspect-square flex items-center justify-center bg-white/[0.03] rounded-[40px] border border-white/5">
              <SoundVisualizer isPlaying={isPlaying} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2">
                  <AnimatePresence mode="wait">
                      {isPlaying ? (
                          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <p className="font-serif italic text-white tracking-tighter drop-shadow-2xl text-xl">{formatTime(timeLeft)}</p>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-chapter-accent mt-4">Harmonizing Now</p>
                          </motion.div>
                      ) : (
                          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Moon className="w-8 h-8 text-white/20" />
                              </div>
                              <h2 className="font-serif italic font-light tracking-tight text-white mb-2 text-4xl">Deep Recovery</h2>
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">심층 사운드 테라피</p>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          </div>

          <Button 
              onClick={isPlaying ? stopTherapy : startTherapy}
              size="lg"
              className={`w-full h-20 rounded-[24px] text-xl font-serif italic transition-all duration-700 shadow-2xl ${
                  isPlaying ? 'bg-chapter-accent text-white border-chapter-accent' : 'bg-white text-black hover:scale-[1.02]'
              }`}
          >
              {isPlaying ? <><Pause className="mr-3 w-6 h-6" /> 세션 종료</> : <><Play className="mr-3 w-6 h-6" /> 회복 세션 시작</>}
          </Button>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className={cardStyle}>
              <div className="flex justify-between items-center">
                  <div className={labelStyle}><Zap className="w-4 h-4 text-chapter-accent" /> 기본 치유 주파수 (Frequency)</div>
                  <span className="text-[10px] font-black text-white/40">{Math.round(freqVolume * 100)}%</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {FREQUENCIES.map(f => {
                      const locked = isFreqLocked(f.id);
                      return (
                          <button key={f.id} onClick={() => {
                              if (locked) { setShowUpsell(true); return; }
                              setSelectedFreq(f);
                          }}
                              className={`py-3 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1 relative ${
                                  locked ? 'bg-white/[0.02] text-white/20 border-white/5 cursor-not-allowed' :
                                  selectedFreq.id === f.id ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10'
                              }`}
                          >
                              {locked && <Lock className="w-3 h-3 absolute top-1.5 right-1.5 text-white/30" />}
                              <p className="text-sm font-serif italic font-bold">{f.name}</p>
                              <p className="text-[8px] opacity-40">{f.freq}Hz</p>
                          </button>
                      );
                  })}
              </div>
              <Slider value={[freqVolume]} max={1} step={0.01} onValueChange={v => setFreqVolume(v[0])} className="pt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={cardStyle}>
                  <div className="flex justify-between items-center">
                      <div className={labelStyle}><Headphones className="w-4 h-4" /> 배경 소음 (Noise)</div>
                      <span className="text-[10px] font-black text-white/40">{Math.round(noiseVolume * 100)}%</span>
                  </div>
                  <div className="flex gap-2">
                      {BASIC_NOISES.map(n => (
                          <button key={n.id} onClick={() => setSelectedNoise(n)}
                              className={`flex-1 flex flex-col gap-2 py-3 rounded-xl border transition-all items-center justify-center ${
                                  selectedNoise.id === n.id ? 'bg-white/20 text-white border-white/20' : 'bg-white/5 text-white/20 border-transparent hover:bg-white/10'
                              }`}
                          >
                              {n.icon}
                              <span className="text-[9px] font-bold opacity-60">{n.name}</span>
                          </button>
                      ))}
                  </div>
                  <Slider value={[noiseVolume]} max={1} step={0.01} onValueChange={v => setNoiseVolume(v[0])} className="pt-2" />
              </div>

              <div className={`${cardStyle} bg-chapter-accent/5`}>
                  <div className="flex justify-between items-center">
                      <div className={`${labelStyle} text-chapter-accent/80`}><CloudRain className="w-4 h-4" /> 자연의 소리 (Nature)</div>
                      <span className="text-[10px] font-black text-chapter-accent/60">{Math.round(natureVolume * 100)}%</span>
                  </div>
                  <div className="flex gap-2">
                      {NATURE_LAYERS.map(n => {
                          const locked = isNatureLocked(n.id);
                          return (
                              <button key={n.id} onClick={() => {
                                  if (locked) { setShowUpsell(true); return; }
                                  setSelectedNature(n);
                              }}
                                  className={`flex-1 flex flex-col gap-2 py-3 rounded-xl border transition-all items-center justify-center relative ${
                                      locked ? 'bg-white/[0.02] text-white/20 border-white/5 cursor-not-allowed' :
                                      selectedNature.id === n.id ? 'bg-chapter-accent text-white border-chapter-accent/40' : 'bg-white/5 text-white/20 border-transparent hover:bg-white/10'
                                  }`}
                              >
                                  {locked && <Lock className="w-3 h-3 absolute top-1.5 right-1.5 text-white/30" />}
                                  {n.icon}
                                  <span className="text-[9px] font-bold opacity-80">{n.name}</span>
                              </button>
                          );
                      })}
                  </div>
                  <Slider value={[natureVolume]} max={1} step={0.01} onValueChange={v => setNatureVolume(v[0])} className="pt-2" />
              </div>
          </div>

          <div className={`${cardStyle} bg-white/[0.08]`}>
              <div className="flex justify-between items-center">
                  <div className={labelStyle}><Volume2 className="w-5 h-5" /> 전체 볼륨 조절</div>
                  <span className="text-sm font-black italic">{Math.round(masterVolume * 100)}%</span>
              </div>
              <Slider value={[masterVolume]} max={1} step={0.01} onValueChange={v => setMasterVolume(v[0])} className="pt-2" />
              <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setTimeLeft(t => t + 300)} className="flex-1 h-12 rounded-xl border-white/10 text-white font-bold text-xs hover:bg-white/5">+ 5 MIN</Button>
                  <Button variant="outline" onClick={() => setTimeLeft(1200)} className="w-12 h-12 rounded-xl border-white/10 text-white hover:bg-white/5 p-0 flex items-center justify-center"><RotateCcw className="w-4 h-4"/></Button>
              </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <MembershipUpsellDialog 
        open={showUpsell} 
        onOpenChange={setShowUpsell} 
        title="사운드 테라피는 리본 등급 전용입니다"
        description="회복 주파수와 심층 명상 사운드 스케이프를 이용하시려면 멤버십을 업그레이드하세요."
      />
    </div>
  );
}
