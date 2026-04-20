import React from "react";
import PostCareForm from "@/components/event/PostCareForm";
import Header from "@/components/layout/Header";

export const metadata = {
  title: "시술 후 정밀 진단 및 로드맵 | Youniqle",
  description: "현재 당신의 회복 상태를 정밀 진단하고, 완벽한 결과를 위한 1:1 리커버리 로드맵을 선사합니다.",
};

export default function PostCarePage() {
  return (
    <div className="min-h-screen bg-mist">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 mb-2 text-center space-y-4">
           <div className="inline-block px-4 py-1 bg-obsidian text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
             Post-Procedure Intelligence
           </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter text-obsidian">
            Recovery <span className="text-primary italic">Roadmap</span>
          </h1>
          <p className="text-slate font-medium max-w-xl mx-auto text-lg">
            시술은 끝났지만, 결과는 이제부터 시작입니다.<br />
            유니클 AI가 당신의 회복 데이터를 실시간 분석하여 최적의 경로를 설계합니다.
          </p>
        </div>
        
        <PostCareForm />
      </main>
    </div>
  );
}
