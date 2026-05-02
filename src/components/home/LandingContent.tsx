'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Sparkles, BarChart3, Map, Lightbulb, Zap, Shield, Crown, Users, Camera, Activity, Video, Music, ArrowRight, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnalysisResult } from './HeroScanner';
import ClinicConsultationSection from './ClinicConsultationSection';

interface LandingContentProps {
  onStart: (data?: AnalysisResult) => void;
  onStartTherapy?: () => void;
  isDiagnosing?: boolean;
}

export default function LandingContent({ onStart, onStartTherapy, isDiagnosing = false }: LandingContentProps) {
  const router = useRouter();
  
  const toolsLink = "/utils";

  return (
    <div className="bg-mist pb-16 pt-10" />
  );
}
