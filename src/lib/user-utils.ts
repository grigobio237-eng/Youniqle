import { IUser } from '@/models/User';

/**
 * 사용자의 상태를 기반으로 최적의 접근 등급(Tier)을 계산합니다.
 * @param user 사용자 객체
 * @returns 'RESET' | 'REBORN' | 'RESTART'
 */
export function calculateUserTier(user: Partial<IUser>): 'RESET' | 'REBORN' | 'RESTART' {
  // 1. RESTART 조건: SIGNATURE 또는 BLACK 패스 보유
  if (user.passInfo?.type === 'SIGNATURE' || user.passInfo?.type === 'BLACK') {
    return 'RESTART';
  }

  // 2. REBORN 조건: START 패스 보유 또는 유료 구독 활성 상태
  if (user.passInfo?.type === 'START' || user.subscription?.status === 'active') {
    return 'REBORN';
  }

  // 3. 그 외 기본값: RESET
  return 'RESET';
}
