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

// Helper to create synthetic reverb impulse response buffer
const createReverbBuffer = (ctx: AudioContext, duration: number, decay: number) => {
  const sampleRate = ctx.sampleRate;
  const len = sampleRate * duration;
  const buffer = ctx.createBuffer(2, len, sampleRate);
  for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
  }
  return buffer;
};

export default function SoundTherapy() {
  const { data: session } = useSession();
  const reportAccessLevel = AccessControl.getReportAccessLevel(session?.user);

  // Gating rules: Delta & White noise are free. Nature layers are REBORN(FOUNDER) above.
  const isFreqLocked = (freqId: string) => reportAccessLevel === 'BASIC' && freqId !== 'delta';
  const isNatureLocked = (natureId: string) => reportAccessLevel === 'BASIC';
  const isPremium = reportAccessLevel === 'PREMIUM';

  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellConfig, setUpsellConfig] = useState({ title: '', desc: '' });
  const { trackEvent } = useActivityTracker();
  const startTimeRef = useRef<number | null>(null);

  // Advanced audio states
  const [isBinaural, setIsBinaural] = useState(false);
  const [reverbSpace, setReverbSpace] = useState<'none' | 'forest' | 'cave' | 'ocean'>('none');
  const [meditationScript, setMeditationScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [meditationAudioBuffer, setMeditationAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isMeditationPlaying, setIsMeditationPlaying] = useState(false);
  const [isLoadingNature, setIsLoadingNature] = useState(false);

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
  const oscillatorLeft = useRef<OscillatorNode | null>(null);
  const oscillatorRight = useRef<OscillatorNode | null>(null);
  const pannerLeft = useRef<StereoPannerNode | null>(null);
  const pannerRight = useRef<StereoPannerNode | null>(null);
  
  const noiseSource = useRef<AudioBufferSourceNode | null>(null);
  const natureSource = useRef<AudioBufferSourceNode | null>(null);
  
  const freqGain = useRef<GainNode | null>(null);
  const noiseGain = useRef<GainNode | null>(null);
  const natureGain = useRef<GainNode | null>(null);
  const masterGainNode = useRef<GainNode | null>(null);
  
  // Advanced audio graph nodes
  const reverbNode = useRef<ConvolverNode | null>(null);
  const reverbWetGain = useRef<GainNode | null>(null);
  const voiceGainNode = useRef<GainNode | null>(null);
  const meditationSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const natureBuffers = useRef<Record<string, AudioBuffer>>({});

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

        // Connect voiceGainNode
        voiceGainNode.current = audioCtx.current.createGain();
        voiceGainNode.current.connect(masterGainNode.current);

        // Reverb convolver
        reverbNode.current = audioCtx.current.createConvolver();
        reverbWetGain.current = audioCtx.current.createGain();
        reverbWetGain.current.gain.setValueAtTime(0, audioCtx.current.currentTime); // Off by default

        // Connect wet paths to convolver
        freqGain.current.connect(reverbWetGain.current);
        noiseGain.current.connect(reverbWetGain.current);
        natureGain.current.connect(reverbWetGain.current);
        
        reverbWetGain.current.connect(reverbNode.current);
        reverbNode.current.connect(masterGainNode.current);
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

  // Pre-load natural audio assets (Graceful degradation on load failure)
  const loadNatureSound = async (id: string): Promise<AudioBuffer | null> => {
    if (natureBuffers.current[id]) return natureBuffers.current[id];
    
    const urls: Record<string, string> = {
        rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
        forest: 'https://actions.google.com/sounds/v1/nature/forest_morning_birds.ogg',
        fire: 'https://actions.google.com/sounds/v1/ambient/ambient_fireplace.ogg'
    };
    
    const url = urls[id];
    if (!url) return null;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch failed');
        const arrayBuffer = await response.arrayBuffer();
        if (!audioCtx.current) return null;
        const decoded = await audioCtx.current.decodeAudioData(arrayBuffer);
        natureBuffers.current[id] = decoded;
        return decoded;
    } catch (e) {
        console.warn(`Failed to load high-fi nature sound for ${id}, falling back to synth:`, e);
        return null;
    }
  };

  const startNatureSound = async () => {
    if (!audioCtx.current || !natureGain.current) return;
    if (natureSource.current) {
        try { natureSource.current.stop(); } catch(e) {}
    }
    
    setIsLoadingNature(true);
    const hifiBuffer = await loadNatureSound(selectedNature.id);
    setIsLoadingNature(false);
    
    if (!audioCtx.current) return;
    
    natureSource.current = audioCtx.current.createBufferSource();
    
    if (hifiBuffer) {
        natureSource.current.buffer = hifiBuffer;
        natureSource.current.loop = true;
        natureSource.current.connect(natureGain.current);
    } else {
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
    }
    
    if (isPlaying) {
        natureSource.current.start();
    }
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
    
    // Stop all previous oscillators
    if (oscillator.current) {
        try { oscillator.current.stop(); } catch(e) {}
        oscillator.current = null;
    }
    if (oscillatorLeft.current) {
        try { oscillatorLeft.current.stop(); } catch(e) {}
        oscillatorLeft.current = null;
    }
    if (oscillatorRight.current) {
        try { oscillatorRight.current.stop(); } catch(e) {}
        oscillatorRight.current = null;
    }

    const ctx = audioCtx.current;
    
    if (isBinaural) {
        // Binaural beats configuration: split Left and Right channels with a slight delta
        oscillatorLeft.current = ctx.createOscillator();
        oscillatorRight.current = ctx.createOscillator();
        
        oscillatorLeft.current.type = 'sine';
        oscillatorLeft.current.frequency.setValueAtTime(selectedFreq.freq, ctx.currentTime);
        
        // Alpha wave brain entrainment: 8Hz differential
        const offset = 8;
        oscillatorRight.current.type = 'sine';
        oscillatorRight.current.frequency.setValueAtTime(selectedFreq.freq + offset, ctx.currentTime);
        
        pannerLeft.current = ctx.createStereoPanner();
        pannerLeft.current.pan.setValueAtTime(-1, ctx.currentTime);
        
        pannerRight.current = ctx.createStereoPanner();
        pannerRight.current.pan.setValueAtTime(1, ctx.currentTime);
        
        oscillatorLeft.current.connect(pannerLeft.current);
        pannerLeft.current.connect(freqGain.current);
        
        oscillatorRight.current.connect(pannerRight.current);
        pannerRight.current.connect(freqGain.current);
        
        oscillatorLeft.current.start();
        oscillatorRight.current.start();
    } else {
        oscillator.current = ctx.createOscillator();
        oscillator.current.type = 'sine';
        oscillator.current.frequency.setValueAtTime(selectedFreq.freq, ctx.currentTime);
        oscillator.current.connect(freqGain.current);
        oscillator.current.start();
    }
  };

  const applyReverbSpace = () => {
    if (!audioCtx.current || !reverbNode.current || !reverbWetGain.current) return;
    
    const ctx = audioCtx.current;
    
    if (reverbSpace === 'none') {
        reverbWetGain.current.gain.cancelScheduledValues(ctx.currentTime);
        reverbWetGain.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        return;
    }
    
    let duration = 1.5;
    let decay = 1.5;
    let wetVolume = 0.25;
    
    if (reverbSpace === 'forest') {
        duration = 1.2;
        decay = 1.8;
        wetVolume = 0.2;
    } else if (reverbSpace === 'cave') {
        duration = 3.0;
        decay = 3.2;
        wetVolume = 0.4;
    } else if (reverbSpace === 'ocean') {
        duration = 2.2;
        decay = 2.0;
        wetVolume = 0.3;
    }
    
    reverbWetGain.current.gain.cancelScheduledValues(ctx.currentTime);
    reverbWetGain.current.gain.linearRampToValueAtTime(wetVolume, ctx.currentTime + 0.2);
    reverbNode.current.buffer = createReverbBuffer(ctx, duration, decay);
  };

  const startTherapy = () => {
    initAudio();
    if (!audioCtx.current) return;
    audioCtx.current.resume();
    
    startFrequency();
    startNoiseSound();
    startNatureSound();
    applyReverbSpace();
    
    const now = audioCtx.current.currentTime;
    
    // Reset master gain to current volume immediately
    masterGainNode.current?.gain.cancelScheduledValues(now);
    masterGainNode.current?.gain.setValueAtTime(masterVolume, now);

    const factor = isMeditationPlaying ? 0.25 : 1.0;

    // Fade in tracks
    freqGain.current?.gain.cancelScheduledValues(now);
    freqGain.current?.gain.setValueAtTime(0, now);
    freqGain.current?.gain.linearRampToValueAtTime(freqVolume * factor, now + 1);
    
    noiseGain.current?.gain.cancelScheduledValues(now);
    noiseGain.current?.gain.setValueAtTime(0, now);
    noiseGain.current?.gain.linearRampToValueAtTime(noiseVolume * factor, now + 1);
    
    natureGain.current?.gain.cancelScheduledValues(now);
    natureGain.current?.gain.setValueAtTime(0, now);
    natureGain.current?.gain.linearRampToValueAtTime(natureVolume * factor, now + 1);
    
    setIsPlaying(true);
    startTimeRef.current = Date.now();

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
    
    masterGainNode.current.gain.cancelScheduledValues(now);
    masterGainNode.current.gain.exponentialRampToValueAtTime(0.0001, now + 1);
    
    stopMeditationGuide();
    
    setTimeout(() => {
      oscillator.current?.stop();
      oscillator.current = null;
      
      oscillatorLeft.current?.stop();
      oscillatorLeft.current = null;
      
      oscillatorRight.current?.stop();
      oscillatorRight.current = null;
      
      noiseSource.current?.stop();
      noiseSource.current = null;
      
      natureSource.current?.stop();
      natureSource.current = null;
      
      setIsPlaying(false);
      
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

  // AI Voice Guide Generation & Ducking Playback
  const generateMeditation = async () => {
    if (isGeneratingScript) return;
    setIsGeneratingScript(true);
    toast.info("오늘의 기질 맞춤형 명상 가이드를 생성 중입니다...");
    
    try {
        const response = await fetch('/api/ai/meditation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        if (data.success) {
            setMeditationScript(data.script);
            
            if (data.audioContent) {
                // Decode base64 audio content
                const binaryString = window.atob(data.audioContent);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                initAudio();
                if (audioCtx.current) {
                    const decodedBuffer = await audioCtx.current.decodeAudioData(bytes.buffer);
                    setMeditationAudioBuffer(decodedBuffer);
                    toast.success("명상 가이드 생성이 완료되었습니다!");
                }
            } else {
                toast.success("명상 가이드 스크립트가 로드되었습니다. (음성 합성 미지원 환경)");
            }
        } else {
            throw new Error(data.error || 'Failed to generate meditation');
        }
    } catch (e: any) {
        console.error(e);
        toast.error("가이드 생성 중 오류가 발생했습니다.");
    } finally {
        setIsGeneratingScript(false);
    }
  };

  const playMeditationGuide = () => {
    if (!audioCtx.current || !meditationAudioBuffer) return;
    
    audioCtx.current.resume();
    
    if (meditationSourceRef.current) {
        try { meditationSourceRef.current.stop(); } catch(e) {}
    }
    
    const ctx = audioCtx.current;
    const source = ctx.createBufferSource();
    source.buffer = meditationAudioBuffer;
    
    if (!voiceGainNode.current) {
        voiceGainNode.current = ctx.createGain();
        voiceGainNode.current.connect(masterGainNode.current);
    }
    source.connect(voiceGainNode.current);
    meditationSourceRef.current = source;
    
    const now = ctx.currentTime;
    const duration = meditationAudioBuffer.duration;
    
    // Audio Ducking: decrease other gain nodes to 25% volume over 0.5s
    freqGain.current?.gain.cancelScheduledValues(now);
    freqGain.current?.gain.setValueAtTime(freqGain.current.gain.value, now);
    freqGain.current?.gain.linearRampToValueAtTime(freqVolume * 0.25, now + 0.5);
    
    noiseGain.current?.gain.cancelScheduledValues(now);
    noiseGain.current?.gain.setValueAtTime(noiseGain.current.gain.value, now);
    noiseGain.current?.gain.linearRampToValueAtTime(noiseVolume * 0.25, now + 0.5);
    
    natureGain.current?.gain.cancelScheduledValues(now);
    natureGain.current?.gain.setValueAtTime(natureGain.current.gain.value, now);
    natureGain.current?.gain.linearRampToValueAtTime(natureVolume * 0.25, now + 0.5);
    
    // Recovery: restore volume levels 0.8s before guide ending
    const recoveryStart = now + Math.max(0, duration - 0.8);
    const recoveryEnd = now + duration;
    
    freqGain.current?.gain.setValueAtTime(freqVolume * 0.25, recoveryStart);
    freqGain.current?.gain.linearRampToValueAtTime(freqVolume, recoveryEnd);
    
    noiseGain.current?.gain.setValueAtTime(noiseVolume * 0.25, recoveryStart);
    noiseGain.current?.gain.linearRampToValueAtTime(noiseVolume, recoveryEnd);
    
    natureGain.current?.gain.setValueAtTime(natureVolume * 0.25, recoveryStart);
    natureGain.current?.gain.linearRampToValueAtTime(natureVolume, recoveryEnd);
    
    source.onended = () => {
        setIsMeditationPlaying(false);
    };
    
    setIsMeditationPlaying(true);
    source.start(now);
    toast.info("마음챙김 가이드 낭독이 시작됩니다.");
  };

  const stopMeditationGuide = () => {
    if (meditationSourceRef.current) {
        try { meditationSourceRef.current.stop(); } catch(e) {}
    }
    setIsMeditationPlaying(false);
  };

  useEffect(() => {
    if (isPlaying) startFrequency();
  }, [selectedFreq, isBinaural]);

  useEffect(() => {
    if (isPlaying) startNoiseSound();
  }, [selectedNoise]);

  useEffect(() => {
    if (isPlaying) startNatureSound();
  }, [selectedNature]);

  useEffect(() => {
    if (isPlaying) applyReverbSpace();
  }, [reverbSpace, isPlaying]);

  useEffect(() => {
    if (isPlaying && audioCtx.current && masterGainNode.current) {
        const now = audioCtx.current.currentTime;
        const factor = isMeditationPlaying ? 0.25 : 1.0;
        
        masterGainNode.current.gain.cancelScheduledValues(now);
        masterGainNode.current.gain.setValueAtTime(masterGainNode.current.gain.value, now);
        masterGainNode.current.gain.linearRampToValueAtTime(masterVolume, now + 0.1);

        freqGain.current?.gain.cancelScheduledValues(now);
        freqGain.current?.gain.setValueAtTime(freqGain.current.gain.value, now);
        freqGain.current?.gain.linearRampToValueAtTime(freqVolume * factor, now + 0.1);

        noiseGain.current?.gain.cancelScheduledValues(now);
        noiseGain.current?.gain.setValueAtTime(noiseGain.current.gain.value, now);
        noiseGain.current?.gain.linearRampToValueAtTime(noiseVolume * factor, now + 0.1);

        natureGain.current?.gain.cancelScheduledValues(now);
        natureGain.current?.gain.setValueAtTime(natureGain.current.gain.value, now);
        natureGain.current?.gain.linearRampToValueAtTime(natureVolume * factor, now + 0.1);
    }
  }, [masterVolume, freqVolume, noiseVolume, natureVolume, isPlaying, isMeditationPlaying]);

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
  const cardStyle = "space-y-4 bg-white/[0.05] p-6 rounded-[32px] border border-white/10 backdrop-blur-sm transition-all duration-300";

  return (
    <div className="w-full max-w-4xl mx-auto bg-black text-white p-6 md:p-10 rounded-[40px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          <div className="relative aspect-square flex items-center justify-center bg-white/[0.03] rounded-[40px] border border-white/5 overflow-hidden">
              <SoundVisualizer isPlaying={isPlaying} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2 z-10">
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
                  isPlaying ? 'bg-chapter-accent text-white border-chapter-accent shadow-chapter-accent/20' : 'bg-white text-black hover:scale-[1.02]'
              }`}
          >
              {isPlaying ? <><Pause className="mr-3 w-6 h-6" /> 세션 종료</> : <><Play className="mr-3 w-6 h-6" /> 회복 세션 시작</>}
          </Button>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          
          {/* Frequencies Card */}
          <div className={cardStyle}>
              <div className="flex justify-between items-center">
                  <div className={labelStyle}><Zap className="w-4 h-4 text-chapter-accent" /> 기본 치유 주파수 (Frequency)</div>
                  <div className="flex items-center gap-2">
                      <button 
                          onClick={() => {
                              if (reportAccessLevel === 'BASIC') { 
                                  setUpsellConfig({
                                      title: "바이노럴 비트 기능 잠금",
                                      desc: "좌우 독립형 뇌파 동조 입체음향을 경험하시려면 리본 등급 이상으로 업그레이드하세요."
                                  });
                                  setShowUpsell(true); 
                                  return; 
                              }
                              setIsBinaural(prev => !prev);
                          }}
                          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                              isBinaural ? 'bg-chapter-accent text-white border-chapter-accent shadow-lg shadow-chapter-accent/20' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                          }`}
                      >
                          <Sparkles className="w-2.5 h-2.5" /> Binaural {isBinaural ? 'ON' : 'OFF'}
                      </button>
                      <span className="text-[10px] font-black text-white/40">{Math.round(freqVolume * 100)}%</span>
                  </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {FREQUENCIES.map(f => {
                      const locked = isFreqLocked(f.id);
                      return (
                          <button key={f.id} onClick={() => {
                              if (locked) { 
                                  setUpsellConfig({
                                      title: "사운드 테라피 고급 주파수 잠금",
                                      desc: "Theta, Alpha, Solfeggio 주파수 힐링을 이용하시려면 리본 등급 이상으로 업그레이드하세요."
                                  });
                                  setShowUpsell(true); 
                                  return; 
                              }
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
              
              {/* Background Noise Card */}
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

              {/* Nature Sounds Card with Reverb Selector */}
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
                                  if (locked) { 
                                      setUpsellConfig({
                                          title: "자연의 소리 믹싱 기능 잠금",
                                          desc: "고음질 빗소리, 숲소리, 모닥불 소리를 믹스해 전용 힐링 세션을 디자인하려면 리본 등급 이상으로 업그레이드하세요."
                                      });
                                      setShowUpsell(true); 
                                      return; 
                                  }
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
                  
                  {/* Space Reverb Control */}
                  <div className="pt-2 flex flex-col gap-2 border-t border-white/5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-white/40">
                          <span>3D 입체 반향 (Reverb Space)</span>
                          <span className="uppercase text-chapter-accent font-black">{reverbSpace === 'none' ? '일반' : reverbSpace === 'forest' ? '숲 속' : reverbSpace === 'cave' ? '동굴' : '해변'}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                          {['none', 'forest', 'cave', 'ocean'].map(space => {
                              const locked = reportAccessLevel === 'BASIC' && space !== 'none';
                              return (
                                  <button 
                                      key={space} 
                                      onClick={() => {
                                          if (locked) { 
                                              setUpsellConfig({
                                                  title: "3D 공간 잔향 효과 잠금",
                                                  desc: "숲속, 동굴, 안개 낀 해변의 입체 잔향감을 소리에 부여하려면 리본 등급 이상으로 업그레이드하세요."
                                              });
                                              setShowUpsell(true); 
                                              return; 
                                          }
                                          setReverbSpace(space as any);
                                      }}
                                      className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all relative ${
                                          locked ? 'bg-white/[0.02] text-white/20 border-white/5 cursor-not-allowed' :
                                          reverbSpace === space ? 'bg-chapter-accent text-white border-chapter-accent/40' : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10'
                                      }`}
                                  >
                                      {locked && <Lock className="w-2 h-2 absolute top-0.5 right-0.5 text-white/30" />}
                                      {space === 'none' ? '일반' : space === 'forest' ? '숲' : space === 'cave' ? '동굴' : '바다'}
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>

          {/* Master Volume and Session time */}
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

          {/* Premium AI Voice Strategy */}
          {isPremium ? (
              <div className={`${cardStyle} bg-reward-gold/10 border-reward-gold/30 mt-6 space-y-4`}>
                  <div className="flex justify-between items-center">
                      <div className={`${labelStyle} text-reward-gold`}><Sparkles className="w-4 h-4" /> AI 보이스 스트래티지</div>
                      <span className="text-[10px] font-black uppercase text-reward-gold bg-reward-gold/20 px-2 py-0.5 rounded-full">PREMIUM</span>
                  </div>
                  
                  <div className="flex gap-3">
                      <Button 
                          onClick={generateMeditation}
                          disabled={isGeneratingScript}
                          className="flex-1 bg-reward-gold hover:bg-yellow-500 text-black font-black rounded-xl h-12 text-xs transition-transform active:scale-95"
                      >
                          {isGeneratingScript ? "AI 힐링 가이드 생성 중..." : "오늘의 기질 맞춤 명상 생성"}
                      </Button>
                      
                      {meditationAudioBuffer && (
                          <Button 
                              onClick={isMeditationPlaying ? stopMeditationGuide : playMeditationGuide}
                              disabled={!isPlaying}
                              className={`px-6 rounded-xl h-12 text-xs font-black transition-all ${
                                  !isPlaying ? 'bg-white/10 text-white/40 cursor-not-allowed' :
                                  isMeditationPlaying ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-white text-black hover:bg-white/80 shadow-lg'
                              }`}
                          >
                              {isMeditationPlaying ? "낭독 정지" : "가이드 낭독"}
                          </Button>
                      )}
                  </div>
                  
                  <AnimatePresence>
                      {meditationScript && (
                          <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-4 bg-black/60 rounded-2xl border border-reward-gold/20 text-xs italic text-reward-gold/80 max-h-28 overflow-y-auto leading-relaxed shadow-inner"
                          >
                              <div className="flex items-center gap-1.5 mb-1.5 not-italic text-[10px] font-bold text-reward-gold/60 uppercase">
                                  <Sparkles className="w-3 h-3 text-reward-gold" /> 실시간 맞춤 가이드 스크립트
                              </div>
                              "{meditationScript}"
                          </motion.div>
                      )}
                  </AnimatePresence>
                  
                  <p className="text-[10px] text-reward-gold/70 text-center">회원님의 30개 세부 기질을 바탕으로 지금 나에게 가장 필요한 1:1 보이스 스크립트를 생성합니다. (낭독 중 배경음 70% 자동 감쇄)</p>
              </div>
          ) : (
              <div className={`${cardStyle} bg-white/5 border-white/5 mt-6 cursor-pointer hover:bg-white/10 transition-all hover:border-reward-gold/20`} 
                  onClick={() => {
                      setUpsellConfig({
                          title: "AI 보이스 스트래티지는 리스타트 전용입니다",
                          desc: "회원님의 30개 세부 기질을 진단 분석하여 1:1 마음챙김 음성을 오버레이하는 오디오 테라피를 이용해 보세요."
                      });
                      setShowUpsell(true);
                  }}
              >
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-reward-gold/20 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-reward-gold" />
                      </div>
                      <div className="flex-1">
                          <h4 className="text-sm font-bold text-reward-gold mb-1">AI 보이스 스트래티지 잠금</h4>
                          <p className="text-[10px] text-white/50">프리미엄으로 업그레이드하고 맞춤 음성을 오버레이하세요.</p>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <MembershipUpsellDialog 
        open={showUpsell} 
        onOpenChange={setShowUpsell} 
        title={upsellConfig.title || "사운드 테라피 멤버십 제한"}
        description={upsellConfig.desc || "회복 주파수와 심층 명상 사운드 스케이프를 이용하시려면 멤버십을 업그레이드하세요."}
      />
    </div>
  );
}
