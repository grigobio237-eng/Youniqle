'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemberPage() {
  const router = useRouter();

  useEffect(() => {
    // 코드가 없는 경우 메인으로 리다이렉트 (약간의 지연 후)
    const timer = setTimeout(() => {
      router.replace('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-sm"
      >
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
          <QrCode className="w-10 h-10 text-white/20" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tighter flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            초대 코드가 필요합니다
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            유효한 초대 QR 코드를 다시 스캔해 주세요.<br />
            잠시 후 메인 화면으로 이동합니다.
          </p>
        </div>
        
        <div className="pt-4">
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
              className="bg-[#D4AF37] h-full"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
