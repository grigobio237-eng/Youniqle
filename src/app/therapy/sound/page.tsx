'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Volume2, ArrowLeft, Moon, Sun, Wind, Waves, 
  Coffee, Zap, Timer, Headphones, Sparkles, CloudRain, Trees, Flame, 
  Droplets, Bird, Cloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SoundVisualizer } from '@/components/therapy/SoundVisualizer';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const FREQUENCIES = [
  { id: 'delta', name: '432Hz', desc: '깊은 수면과 세포 재생', freq: 432 },
  { id: 'theta', name: '528Hz', desc: 'DNA 회복 및 기적의 주파수', freq: 528 },
  { id: 'alpha', name: '639Hz', desc: '관계 회복 및 사랑의 파동', freq: 639 },
  { id: 'solfeggio', name: '741Hz', desc: '직관 및 정화의 주파수', freq: 741 },
];

const BASIC_NOISES = [
  { id: 'white', name: 'White', icon: <Wind className="w-5 h-5" /> },
  { id: 'pink', name: 'Pink', icon: <Waves className="w-5 h-5" /> },
  { id: 'brown', name: 'Brown', icon: <Headphones className="w-5 h-5" /> },
];

const NATURE_LAYERS = [
  { id: 'rain', name: 'Rain', icon: <CloudRain className="w-5 h-5" />, color: 'text-blue-400' },
  { id: 'forest', name: 'Forest', icon: <Trees className="w-5 h-5" />, color: 'text-green-400' },
  { id: 'fire', name: 'Fire', icon: <Flame className="w-5 h-5" />, color: 'text-orange-400' },
];

export default function SoundTherapyPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  
  // Mixer State (Re-balanced defaults)
  const [selectedFreq, setSelectedFreq] = useState(FREQUENCIES[0]);
  const [freqVolume, setFreqVolume] = useState(0.15); // Lowered so it doesn't "beep" too loud
  
  const [selectedNoise, setSelectedNoise] = useState(BASIC_NOISES[1]); 
  const [noiseVolume, setNoiseVolume] = useState(0.1); // Lowered noise base
  
  const [selectedNature, setSelectedNature] = useState(NATURE_LAYERS[0]); 
  const [natureVolume, setNatureVolume] = useState(0.7); // Increased nature for dominance
  
  const [timeLeft, setTimeLeft] = useState(1200);

  // Web Audio Refs
  const audioCtx = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const noiseSource = useRef<AudioBufferSourceNode | null>(null);
  const natureSource = useRef<AudioBufferSourceNode | null>(null);
  
  // Gain Nodes
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
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
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
    
    // Stop old
    if (natureSource.current) {
        try { natureSource.current.stop(); } catch(e) {}
    }

    natureSource.current = audioCtx.current.createBufferSource();
    // Use White for rain/fire for crispness, Pink for forest
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
        // Wind LFO
        const lfo = audioCtx.current.createOscillator();
        const lfoGain = audioCtx.current.createGain();
        lfo.frequency.value = 0.1; 
        lfoGain.gain.value = 400;
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

    // Fade in all
    const now = audioCtx.current.currentTime;
    freqGain.current?.gain.setValueAtTime(0, now);
    freqGain.current?.gain.linearRampToValueAtTime(freqVolume, now + 1);
    noiseGain.current?.gain.setValueAtTime(0, now);
    noiseGain.current?.gain.linearRampToValueAtTime(noiseVolume, now + 1);
    natureGain.current?.gain.setValueAtTime(0, now);
    natureGain.current?.gain.linearRampToValueAtTime(natureVolume, now + 1);

    setIsPlaying(true);
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
      masterGainNode.current?.gain.setValueAtTime(masterVolume, audioCtx.current.currentTime);
    }, 1100);
  };

  const togglePlay = () => {
    if (isPlaying) stopTherapy();
    else startTherapy();
  };

  // Real-time Updates (The fix for "Beep" and no change)
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
    if (isPlaying && audioCtx.current) {
        const now = audioCtx.current.currentTime;
        masterGainNode.current?.gain.linearRampToValueAtTime(masterVolume, now + 0.1);
        freqGain.current?.gain.linearRampToValueAtTime(freqVolume, now + 0.1);
        noiseGain.current?.gain.linearRampToValueAtTime(noiseVolume, now + 0.1);
        natureGain.current?.gain.linearRampToValueAtTime(natureVolume, now + 0.1);
    }
  }, [masterVolume, freqVolume, noiseVolume, natureVolume, isPlaying]);

  // Timer
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && isPlaying) {
      stopTherapy();
      toast.success("명상이 종료되었습니다.");
    }
  }, [isPlaying, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const labelStyle = "text-xs font-black uppercase tracking-widest text-white/80 flex items-center gap-2";
  const cardStyle = "space-y-6 bg-white/[0.08] p-8 rounded-[40px] border border-white/10 shadow-lg backdrop-blur-sm";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-chapter-accent">
      <header className="fixed top-0 left-0 right-0 z-50 p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <Button variant="ghost" onClick={() => { if(isPlaying) stopTherapy(); router.back(); }} className="text-white hover:bg-white/10 rounded-full font-bold">
          <ArrowLeft className="w-6 h-6 mr-2" /> 돌아가기
        </Button>
        <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-chapter-accent animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-white/70">Deep Recovery Room</span>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-32 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-12 xl:col-span-5 space-y-12 sticky top-32">
            <div className="relative aspect-square flex items-center justify-center">
                <SoundVisualizer isPlaying={isPlaying} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
                    <AnimatePresence mode="wait">
                        {isPlaying ? (
                            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <p className="text-7xl font-serif italic text-white tracking-tighter drop-shadow-2xl">{formatTime(timeLeft)}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-chapter-accent mt-4">Harmonizing Now</p>
                            </motion.div>
                        ) : (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h1 className="text-6xl font-serif italic font-light tracking-tight text-white mb-2">Silent<br/>Recovery</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Ready to heal</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Button 
                onClick={togglePlay}
                size="lg"
                className={`w-full h-24 rounded-[32px] text-2xl font-serif italic transition-all duration-700 shadow-2xl ${
                    isPlaying ? 'bg-chapter-accent text-white border-chapter-accent' : 'bg-white text-black hover:scale-[1.02]'
                }`}
            >
                {isPlaying ? <><Pause className="mr-4 w-8 h-8" /> Pause Session</> : <><Play className="mr-4 w-8 h-8" /> Start Therapy</>}
            </Button>
          </div>

          <div className="lg:col-span-12 xl:col-span-7 space-y-10">
            <div className={cardStyle}>
                <div className="flex justify-between items-center">
                    <div className={labelStyle}><Zap className="w-5 h-5 text-chapter-accent" /> Frequency Layer</div>
                    <span className="text-xs font-black text-chapter-accent bg-chapter-accent/10 px-3 py-1 rounded-full">{Math.round(freqVolume * 100)}%</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {FREQUENCIES.map(f => (
                        <button key={f.id} onClick={() => setSelectedFreq(f)}
                            className={`p-5 rounded-2xl text-center border-2 transition-all duration-300 ${
                                selectedFreq.id === f.id ? 'bg-white text-black border-white shadow-xl scale-[1.02]' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <p className="text-xl font-serif italic font-bold">{f.name}</p>
                        </button>
                    ))}
                </div>
                <Slider value={[freqVolume]} max={1} step={0.01} onValueChange={v => setFreqVolume(v[0])} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={cardStyle}>
                    <div className="flex justify-between items-center">
                        <div className={labelStyle}><Headphones className="w-5 h-5 text-white/60" /> Noise Base</div>
                        <span className="text-xs font-black text-white/80 bg-white/10 px-3 py-1 rounded-full">{Math.round(noiseVolume * 100)}%</span>
                    </div>
                    <div className="flex gap-2">
                        {BASIC_NOISES.map(n => (
                            <button key={n.id} onClick={() => setSelectedNoise(n)}
                                className={`flex-1 h-16 rounded-2xl border-2 transition-all flex items-center justify-center ${
                                    selectedNoise.id === n.id ? 'bg-white/30 text-white border-white/40 shadow-lg scale-105' : 'bg-white/5 text-white/30 border-transparent hover:bg-white/10 hover:text-white/60'
                                }`}
                            >
                                {n.icon}
                            </button>
                        ))}
                    </div>
                    <Slider value={[noiseVolume]} max={1} step={0.01} onValueChange={v => setNoiseVolume(v[0])} />
                </div>

                <div className={`${cardStyle} bg-chapter-accent/10 border-chapter-accent/20`}>
                    <div className="flex justify-between items-center">
                        <div className={`${labelStyle} text-chapter-accent`}><CloudRain className="w-5 h-5" /> Nature Layer</div>
                        <span className="text-xs font-black text-chapter-accent bg-chapter-accent/10 px-3 py-1 rounded-full">{Math.round(natureVolume * 100)}%</span>
                    </div>
                    <div className="flex gap-2">
                        {NATURE_LAYERS.map(n => (
                            <button key={n.id} onClick={() => setSelectedNature(n)}
                                className={`flex-1 h-16 rounded-2xl border-2 transition-all flex items-center justify-center ${
                                    selectedNature.id === n.id ? 'bg-chapter-accent text-white border-chapter-accent/40 shadow-lg scale-105' : 'bg-white/5 text-white/30 border-transparent hover:bg-white/10 hover:text-white/60'
                                }`}
                            >
                                {n.icon}
                            </button>
                        ))}
                    </div>
                    <Slider value={[natureVolume]} max={1} step={0.01} onValueChange={v => setNatureVolume(v[0])} />
                </div>
            </div>

            <div className={`${cardStyle} bg-white/[0.12]`}>
                <div className="flex justify-between items-center">
                    <div className={labelStyle}><Volume2 className="w-6 h-6 text-white/80" /> Master Output Level</div>
                    <span className="text-lg font-black text-white">{Math.round(masterVolume * 100)}%</span>
                </div>
                <Slider value={[masterVolume]} max={1} step={0.01} onValueChange={v => setMasterVolume(v[0])} />
                <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setTimeLeft(t => t + 300)} className="flex-1 h-16 rounded-2xl border-white/20 text-white font-black text-lg hover:bg-white/10">+ 5 MIN SESSION</Button>
                    <Button variant="outline" onClick={() => { stopTherapy(); setTimeLeft(1200); }} className="w-16 h-16 rounded-2xl border-white/20 text-white hover:bg-white/10"><RotateCcw className="w-6 h-6"/></Button>
                </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        body { background-color: black; overflow-x: hidden; }
      `}</style>
    </div>
  );
}
