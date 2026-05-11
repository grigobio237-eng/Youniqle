'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sun, Cloud, CloudRain, Wind, Thermometer, Droplets, Zap } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  dust: string;
  city: string;
  icon: React.ReactNode;
}

export default function EnvironmentalStatus() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1단계: 스마트 템플릿 기반 (추후 API 연동)
    const fetchEnvData = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            // 위치 정보 성공 시 (샘플 데이터)
            setTimeout(() => {
              setWeather({
                temp: 21,
                condition: '쾌적한 맑음',
                humidity: 45,
                dust: '좋음',
                city: '서울시 강남구',
                icon: <Sun className="w-5 h-5 text-amber-400 fill-current" />
              });
              setLoading(false);
            }, 800);
          },
          () => {
            // 위치 정보 거부 시 기본값
            setWeather({
              temp: 18,
              condition: '구름 조금',
              humidity: 50,
              dust: '보통',
              city: '서울',
              icon: <Cloud className="w-5 h-5 text-slate-400" />
            });
            setLoading(false);
          }
        );
      }
    };

    fetchEnvData();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 animate-pulse">
        <div className="h-8 w-32 bg-mist/50 rounded-full" />
        <div className="h-8 w-24 bg-mist/50 rounded-full" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3"
    >
      {/* Location Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-line rounded-full shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-black text-obsidian">{weather?.city}</span>
      </div>

      {/* Weather Info */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-obsidian text-white rounded-full shadow-lg">
        <div className="flex items-center gap-2 border-r border-white/10 pr-3">
          {weather?.icon}
          <span className="text-xs font-bold">{weather?.temp}°C</span>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-mist/60">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3 h-3 text-sky-400" />
            <span>{weather?.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3 h-3 text-emerald-400" />
            <span>DUST: {weather?.dust}</span>
          </div>
        </div>
      </div>

      {/* AI Context Badge */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full"
      >
        <Zap className="w-3 h-3 text-primary fill-current" />
        <span className="text-[10px] font-black text-primary uppercase">Optimizing Routine...</span>
      </motion.div>
    </motion.div>
  );
}
