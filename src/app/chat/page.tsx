'use client';

import RealTimeChat from '@/components/chat/RealTimeChat';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">실시간 유니클 채팅</h1>
          <p className="text-gray-600">
            유니클과 실시간으로 대화하며 문의사항을 해결해보세요.
          </p>
        </div>
        
        <RealTimeChat />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>유니클이 실시간으로 답변을 제공합니다.</p>
          <p>복잡한 문의사항은 관리자가 직접 답변드릴 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}




