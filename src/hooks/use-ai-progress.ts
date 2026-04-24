import { useState, useEffect, useCallback } from 'react';

/**
 * AI 분석 진행 상황을 시뮬레이션하는 훅입니다.
 * 0%에서 시작하여 타겟(보통 90-95%)까지 부드럽게 증가하다가,
 * 실제 처리가 완료되면 100%로 도달하도록 돕습니다.
 */
export function useAIProgress(active: boolean, initialProgress = 5) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('초기화 중...');

  const messages = [
    '유니클 엔진 연결 중...',
    '이미지 특징 데이터 추출 중...',
    '회복 패턴 데이터베이스 분석 중...',
    '개인 맞춤형 결과 조합 중...',
    '거의 다 되었습니다...',
    '최적화된 조언 생성 중...'
  ];

  useEffect(() => {
    if (!active) {
      setProgress(0);
      setStatusMessage(messages[0]);
      return;
    }

    setProgress(initialProgress);
    let currentProgress = initialProgress;
    let messageIdx = 0;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // 95% 이상으로는 자동으로 올라가지 않음 (실제 완료 시점을 기다림)
        if (prev >= 95) return prev;
        
        // 진행률이 높아질수록 증가 속도가 느려짐 (로그 비스무리한 효과)
        const increment = Math.max(0.5, (95 - prev) / 15);
        const next = Math.min(95, prev + increment);
        return next;
      });
    }, 400);

    const messageInterval = setInterval(() => {
      messageIdx = (messageIdx + 1) % messages.length;
      setStatusMessage(messages[messageIdx]);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [active, initialProgress]);

  const finish = useCallback(() => {
    setProgress(100);
    setStatusMessage('완료!');
  }, []);

  return { progress, statusMessage, finish };
}
