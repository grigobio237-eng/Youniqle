/**
 * ACWR (Acute:Chronic Workload Ratio) 계산 유틸리티
 * 
 * - Acute Load: 최근 7일간 세션 부하 합계
 * - Chronic Load: 최근 28일간 세션 부하 평균 (주당)
 * - ACWR = Acute / Chronic
 * 
 * 위험 존 해석:
 * - < 0.8: 언더트레이닝 (부상 위험 증가)
 * - 0.8 ~ 1.3: 스윗스팟 (최적 범위)
 * - 1.3 ~ 1.5: 주의 (과부하 시작)
 * - > 1.5: 위험 (부상 위험 높음)
 */

export interface ACWRResult {
  acuteLoad: number;         // 최근 7일 합계
  chronicLoad: number;       // 최근 28일 주당 평균
  acwr: number;              // Acute / Chronic
  zone: 'undertrained' | 'optimal' | 'caution' | 'danger';
  zoneLabel: string;
  zoneColor: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  dailyLoads: { date: string; load: number }[];
}

export interface LoadEntry {
  date: string;
  sessionLoad: number;
}

/**
 * ACWR 계산
 * @param loads - 최근 28일 이상의 일별 세션 부하 데이터
 * @returns ACWRResult
 */
export function calculateACWR(loads: LoadEntry[]): ACWRResult {
  // 날짜순 정렬 (최신순)
  const sorted = [...loads].sort((a, b) => b.date.localeCompare(a.date));

  // 최근 7일 데이터 (Acute)
  const today = new Date();
  const acute7Days: LoadEntry[] = [];
  const chronic28Days: LoadEntry[] = [];

  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      acute7Days.push(entry);
    }
    if (diffDays < 28) {
      chronic28Days.push(entry);
    }
  }

  // Acute Load: 7일간 합계
  const acuteLoad = acute7Days.reduce((sum, e) => sum + (e.sessionLoad || 0), 0);

  // Chronic Load: 28일간 주당 평균
  const chronic28Total = chronic28Days.reduce((sum, e) => sum + (e.sessionLoad || 0), 0);
  const weeksInChronic = Math.max(chronic28Days.length > 0 ? 4 : 1, 1);
  const chronicLoad = chronic28Total / weeksInChronic;

  // ACWR 계산
  const acwr = chronicLoad > 0 ? Math.round((acuteLoad / chronicLoad) * 100) / 100 : 0;

  // 존 판별
  let zone: ACWRResult['zone'];
  let zoneLabel: string;
  let zoneColor: string;

  if (acwr < 0.8) {
    zone = 'undertrained';
    zoneLabel = '언더트레이닝';
    zoneColor = '#3B82F6'; // blue
  } else if (acwr <= 1.3) {
    zone = 'optimal';
    zoneLabel = '최적 범위';
    zoneColor = '#22C55E'; // green
  } else if (acwr <= 1.5) {
    zone = 'caution';
    zoneLabel = '주의';
    zoneColor = '#F59E0B'; // yellow
  } else {
    zone = 'danger';
    zoneLabel = '위험';
    zoneColor = '#EF4444'; // red
  }

  // 트렌드 계산 (지난 주 vs 이번 주)
  const thisWeekLoad = acuteLoad;
  const lastWeekLoads = chronic28Days
    .filter((e) => {
      const diffDays = Math.floor((today.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 7 && diffDays < 14;
    })
    .reduce((sum, e) => sum + (e.sessionLoad || 0), 0);

  let trend: ACWRResult['trend'];
  if (thisWeekLoad > lastWeekLoads * 1.1) {
    trend = 'increasing';
  } else if (thisWeekLoad < lastWeekLoads * 0.9) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }

  // 일별 부하 차트 데이터 (최근 28일)
  const dailyLoads = chronic28Days
    .map((e) => ({ date: e.date, load: e.sessionLoad || 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    acuteLoad,
    chronicLoad: Math.round(chronicLoad),
    acwr,
    zone,
    zoneLabel,
    zoneColor,
    trend,
    dailyLoads,
  };
}

/**
 * 웰니스 점수 기반 신호등 색상 반환
 * 4-5: 🟢 Green (양호)
 * 3-3.9: 🟡 Yellow (주의)
 * 1-2.9: 🔴 Red (경고)
 */
export function getWellnessTrafficLight(score: number): {
  color: 'green' | 'yellow' | 'red';
  label: string;
  emoji: string;
} {
  if (score >= 4) {
    return { color: 'green', label: '양호', emoji: '🟢' };
  } else if (score >= 3) {
    return { color: 'yellow', label: '주의', emoji: '🟡' };
  } else {
    return { color: 'red', label: '경고', emoji: '🔴' };
  }
}

/**
 * 날짜 포맷 유틸리티 (YYYY-MM-DD)
 */
export function getKSTDateString(date?: Date): string {
  const d = date || new Date();
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}
