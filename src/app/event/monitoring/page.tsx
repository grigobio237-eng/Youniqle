import React from "react";
import RecoveryMonitoring from "@/components/event/RecoveryMonitoring";
import Header from "@/components/layout/Header";

export const metadata = {
  title: "72시간 집중 리커버리 모니터링 | Youniqle",
  description: "시술 직후 가장 중요한 72시간, 유니클이 당신의 곁에서 실시간으로 함께합니다.",
};

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 mb-2 text-center">
          <h1 className="text-4xl font-black mb-4 tracking-tighter">
            Real-time <span className="text-primary">Recovery</span> Guard
          </h1>
          <p className="text-text-secondary font-medium max-w-xl mx-auto">
            시술 후 72시간은 당신의 결과가 완성되는 시간입니다.<br />
            매일의 변화를 기록하고 가장 최적화된 가이드를 받아보세요.
          </p>
        </div>
        
        <RecoveryMonitoring />
      </main>
    </div>
  );
}
