import { IUser } from '@/models/User';

export type UserGroup = 'NONE' | 'RESET' | 'REBORN' | 'RESTART' | 'BLACK';

export interface TierLimits {
  scannerLimit: number;
  diagnosisLimit: number;
  webtoonLimitHours: number; // 기다무 시간 (시간 단위)
  webtoonGenerationLimit: number; // 일일 생성 제한
  dataRetentionDays: number;
}

export const TIER_LIMITS: Record<UserGroup, TierLimits> = {
  NONE: {
    scannerLimit: 1,
    diagnosisLimit: 0,
    webtoonLimitHours: 72,
    webtoonGenerationLimit: 0,
    dataRetentionDays: 1
  },
  RESET: {
    scannerLimit: 3,
    diagnosisLimit: 1,
    webtoonLimitHours: 48,
    webtoonGenerationLimit: 0,
    dataRetentionDays: 7
  },
  REBORN: {
    scannerLimit: 10,
    diagnosisLimit: 3,
    webtoonLimitHours: 0, // 무제한
    webtoonGenerationLimit: 2,
    dataRetentionDays: 90
  },
  RESTART: {
    scannerLimit: 9999, // 사실상 무제한
    diagnosisLimit: 9999,
    webtoonLimitHours: 0,
    webtoonGenerationLimit: 9999,
    dataRetentionDays: 9999 // 전체 기간
  },
  BLACK: {
    scannerLimit: 9999,
    diagnosisLimit: 9999,
    webtoonLimitHours: 0,
    webtoonGenerationLimit: 9999,
    dataRetentionDays: 9999
  }
};

export const FEATURE_COSTS = {
  scanner: 100,
  diagnosis: 200,
  webtoon: 300
};

export class AccessControl {
  /**
   * 유저의 패스 타입에 따른 그룹 반환
   */
  static getUserGroup(user: any): UserGroup {
    const passType = user.passInfo?.type || 'NONE';
    if (passType === 'BLACK') return 'BLACK';
    if (passType === 'RESTART') return 'RESTART';
    if (passType === 'REBORN' || user.subscription?.status === 'active') return 'REBORN';
    if (passType === 'RESET') return 'RESET';
    return 'NONE';
  }

  /**
   * 해당 유저의 티어별 제한 수치 반환
   */
  static getLimits(user: IUser): TierLimits {
    const group = this.getUserGroup(user);
    return TIER_LIMITS[group];
  }

  /**
   * 일일 사용량 초기화 필요 여부 확인 및 리셋
   */
  static async checkAndResetDailyStats(user: IUser): Promise<boolean> {
    const now = new Date();
    const lastReset = user.dailyStats?.lastResetDate || new Date(0);
    
    // 날짜가 바뀌었는지 확인 (KST 기준 권장이나 여기서는 UTC/Local 기준)
    if (now.toDateString() !== lastReset.toDateString()) {
      user.dailyStats = {
        scannerCount: 0,
        diagnosisCount: 0,
        webtoonCount: 0,
        lastResetDate: now
      };
      return true; // 리셋됨
    }
    return false;
  }

  /**
   * 특정 기능 사용 가능 여부 확인
   */
  static canUseFeature(user: IUser, feature: 'scanner' | 'diagnosis' | 'webtoon'): boolean {
    const limits = this.getLimits(user);
    const stats = user.dailyStats || { scannerCount: 0, diagnosisCount: 0, webtoonCount: 0 };

    switch (feature) {
      case 'scanner':
        return stats.scannerCount < limits.scannerLimit;
      case 'diagnosis':
        return stats.diagnosisCount < limits.diagnosisLimit;
      case 'webtoon':
        // 웹툰 생성 제한 체크 (감상은 무제한/기다무 로직 별도 필요)
        return stats.webtoonCount < limits.webtoonGenerationLimit;
      default:
        return false;
    }
  }
}
