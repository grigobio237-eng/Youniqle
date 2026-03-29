import React from "react";
import PreProcedureForm from "@/components/event/PreProcedureForm";
import Header from "@/components/layout/Header";

export const metadata = {
  title: "회복 설계 문진표 | Youniqle",
  description: "당신의 완벽한 시술 결과를 위한 정밀 회복 설계를 시작하세요.",
};

export default function ConsultationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Perfect <span className="text-primary italic">Recovery</span> Design
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            시술은 결과만 보는 것이 아니라 과정을 설계하는 것입니다. 
            유니클과 함께 당신만의 전문적인 회복 여정을 시작하세요.
          </p>
        </div>
        
        <PreProcedureForm />
      </main>
    </div>
  );
}
