import mongoose from 'mongoose';
import ABTest from '@/models/ABTest';
import ABTestEvent from '@/models/ABTestEvent';

export interface AdvancedTestStats {
  testId: string;
  testName: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  variants: {
    name: string;
    description: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    pValue: number;
    isSignificant: boolean;
    expectedLoss: number;
    risk: 'low' | 'medium' | 'high';
  }[];
  overallStats: {
    totalParticipants: number;
    totalConversions: number;
    overallConversionRate: number;
    statisticalPower: number;
    minimumDetectableEffect: number;
    testDuration: number;
    estimatedCompletionTime?: Date;
  };
  recommendations: {
    action: string;
    reason: string;
    confidence: number;
    expectedImpact: number;
  };
  bayesianStats: {
    probabilityOfBeingBest: number[];
    expectedLoss: number[];
    credibleInterval: {
      lower: number;
      upper: number;
    }[];
  };
}

export class ABTestAdvancedStats {
  // 실시간 통계 계산
  static async calculateAdvancedStats(testId: string): Promise<AdvancedTestStats> {
    const test = await ABTest.findById(testId);
    if (!test) {
      throw new Error('A/B 테스트를 찾을 수 없습니다.');
    }

    // 기본 통계 수집
    const basicStats = await this.getBasicStats(testId);
    
    // 고급 통계 계산
    const advancedStats = await this.calculateAdvancedMetrics(testId, basicStats);
    
    // 베이지안 통계 계산
    const bayesianStats = await this.calculateBayesianStats(testId, basicStats);
    
    // 추천사항 생성
    const recommendations = await this.generateRecommendations(testId, advancedStats, bayesianStats);

    return {
      testId: test._id.toString(),
      testName: test.name,
      status: test.status,
      startDate: test.startDate,
      endDate: test.endDate,
      variants: advancedStats.variants,
      overallStats: advancedStats.overall,
      recommendations,
      bayesianStats
    };
  }

  // 기본 통계 수집
  private static async getBasicStats(testId: string) {
    const events = await ABTestEvent.aggregate([
      { $match: { testId: new mongoose.Types.ObjectId(testId) } },
      {
        $group: {
          _id: '$variantName',
          participants: { $addToSet: '$userId' },
          conversions: {
            $sum: {
              $cond: [
                { $eq: ['$eventType', 'conversion'] },
                1,
                0
              ]
            }
          },
          views: {
            $sum: {
              $cond: [
                { $eq: ['$eventType', 'view'] },
                1,
                0
              ]
            }
          },
          clicks: {
            $sum: {
              $cond: [
                { $eq: ['$eventType', 'click'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return events;
  }

  // 고급 통계 계산
  private static async calculateAdvancedMetrics(testId: string, basicStats: any[]) {
    const test = await ABTest.findById(testId);
    const variants = test?.variants || [];
    
    const variantStats = variants.map((variant: any) => {
      const stats = basicStats.find(s => s._id === variant.name) || {
        participants: [],
        conversions: 0,
        views: 0,
        clicks: 0
      };

      const participants = stats.participants.length;
      const conversions = stats.conversions;
      const conversionRate = participants > 0 ? (conversions / participants) * 100 : 0;

      // 신뢰구간 계산 (Wilson Score Interval)
      const confidenceInterval = this.calculateWilsonScoreInterval(conversions, participants, 0.95);
      
      // P-value 계산 (Chi-square test)
      const pValue = this.calculatePValue(basicStats);
      
      // 통계적 유의성 판단
      const isSignificant = pValue < 0.05;
      
      // 예상 손실 계산
      const expectedLoss = this.calculateExpectedLoss(basicStats, variant.name);
      
      // 리스크 평가
      const risk = this.assessRisk(conversionRate, participants, expectedLoss);

      return {
        name: variant.name,
        description: variant.description || '',
        participants,
        conversions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        confidenceInterval,
        pValue: Math.round(pValue * 10000) / 10000,
        isSignificant,
        expectedLoss: Math.round(expectedLoss * 100) / 100,
        risk
      };
    });

    // 전체 통계
    const totalParticipants = basicStats.reduce((sum, s) => sum + s.participants.length, 0);
    const totalConversions = basicStats.reduce((sum, s) => sum + s.conversions, 0);
    const overallConversionRate = totalParticipants > 0 ? (totalConversions / totalParticipants) * 100 : 0;
    
    // 통계적 검정력 계산
    const statisticalPower = this.calculateStatisticalPower(basicStats);
    
    // 최소 검출 가능 효과 계산
    const minimumDetectableEffect = this.calculateMinimumDetectableEffect(basicStats);
    
    // 테스트 기간 계산
    const testDuration = await this.calculateTestDuration(testId);
    
    // 예상 완료 시간 계산
    const estimatedCompletionTime = this.estimateCompletionTime(testId, statisticalPower);

    return {
      variants: variantStats,
      overall: {
        totalParticipants,
        totalConversions,
        overallConversionRate: Math.round(overallConversionRate * 100) / 100,
        statisticalPower: Math.round(statisticalPower * 100) / 100,
        minimumDetectableEffect: Math.round(minimumDetectableEffect * 100) / 100,
        testDuration,
        estimatedCompletionTime
      }
    };
  }

  // Wilson Score Interval 계산
  private static calculateWilsonScoreInterval(conversions: number, participants: number, confidence: number): { lower: number; upper: number } {
    if (participants === 0) {
      return { lower: 0, upper: 0 };
    }

    const p = conversions / participants;
    const n = participants;
    const z = confidence === 0.95 ? 1.96 : 2.576; // 95% or 99% confidence
    
    const center = (p + (z * z) / (2 * n)) / (1 + (z * z) / n);
    const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n) / (1 + (z * z) / n);
    
    return {
      lower: Math.max(0, (center - margin) * 100),
      upper: Math.min(100, (center + margin) * 100)
    };
  }

  // P-value 계산 (Chi-square test)
  private static calculatePValue(basicStats: any[]): number {
    if (basicStats.length < 2) return 1;
    
    const totalConversions = basicStats.reduce((sum, s) => sum + s.conversions, 0);
    const totalParticipants = basicStats.reduce((sum, s) => sum + s.participants.length, 0);
    
    if (totalParticipants === 0) return 1;
    
    const expectedRate = totalConversions / totalParticipants;
    let chiSquare = 0;
    
    for (const stats of basicStats) {
      const observed = stats.conversions;
      const expected = stats.participants.length * expectedRate;
      
      if (expected > 0) {
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    }
    
    // 간단한 Chi-square 분포 근사 (실제로는 더 정확한 계산 필요)
    const df = basicStats.length - 1;
    const pValue = this.chiSquarePValue(chiSquare, df);
    
    return pValue;
  }

  // Chi-square P-value 근사 계산
  private static chiSquarePValue(chiSquare: number, df: number): number {
    // 간단한 근사 계산 (실제로는 더 정확한 알고리즘 사용)
    if (df === 1) {
      return chiSquare > 3.84 ? 0.05 : chiSquare > 6.63 ? 0.01 : 0.1;
    }
    return chiSquare > 5.99 ? 0.05 : chiSquare > 9.21 ? 0.01 : 0.1;
  }

  // 예상 손실 계산
  private static calculateExpectedLoss(basicStats: any[], variantName: string): number {
    const variantStats = basicStats.find(s => s._id === variantName);
    if (!variantStats) return 0;
    
    const variantRate = variantStats.participants.length > 0 
      ? variantStats.conversions / variantStats.participants.length 
      : 0;
    
    // 다른 변형들과 비교하여 예상 손실 계산
    let totalLoss = 0;
    for (const stats of basicStats) {
      if (stats._id !== variantName) {
        const otherRate = stats.participants.length > 0 
          ? stats.conversions / stats.participants.length 
          : 0;
        const loss = Math.max(0, otherRate - variantRate);
        totalLoss += loss * stats.participants.length;
      }
    }
    
    return totalLoss;
  }

  // 리스크 평가
  private static assessRisk(conversionRate: number, participants: number, expectedLoss: number): 'low' | 'medium' | 'high' {
    if (participants < 100) return 'high';
    if (expectedLoss > 0.1) return 'high';
    if (conversionRate < 1 || conversionRate > 50) return 'medium';
    return 'low';
  }

  // 통계적 검정력 계산
  private static calculateStatisticalPower(basicStats: any[]): number {
    if (basicStats.length < 2) return 0;
    
    const totalParticipants = basicStats.reduce((sum, s) => sum + s.participants.length, 0);
    const totalConversions = basicStats.reduce((sum, s) => sum + s.conversions, 0);
    
    if (totalParticipants === 0) return 0;
    
    const baseRate = totalConversions / totalParticipants;
    const effectSize = this.calculateEffectSize(basicStats);
    
    // 간단한 검정력 계산 (실제로는 더 정확한 계산 필요)
    const power = Math.min(0.95, Math.max(0.1, effectSize * Math.sqrt(totalParticipants / 100)));
    
    return power;
  }

  // 효과 크기 계산
  private static calculateEffectSize(basicStats: any[]): number {
    if (basicStats.length < 2) return 0;
    
    const rates = basicStats.map(s => 
      s.participants.length > 0 ? s.conversions / s.participants.length : 0
    );
    
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    
    return avgRate > 0 ? (maxRate - minRate) / avgRate : 0;
  }

  // 최소 검출 가능 효과 계산
  private static calculateMinimumDetectableEffect(basicStats: any[]): number {
    const totalParticipants = basicStats.reduce((sum, s) => sum + s.participants.length, 0);
    const totalConversions = basicStats.reduce((sum, s) => sum + s.conversions, 0);
    
    if (totalParticipants === 0) return 0;
    
    const baseRate = totalConversions / totalParticipants;
    const mde = 1.96 * Math.sqrt(2 * baseRate * (1 - baseRate) / totalParticipants);
    
    return mde * 100; // 퍼센트로 변환
  }

  // 테스트 기간 계산
  private static async calculateTestDuration(testId: string): Promise<number> {
    const test = await ABTest.findById(testId);
    if (!test) return 0;
    
    const startDate = new Date(test.startDate);
    const endDate = test.endDate ? new Date(test.endDate) : new Date();
    
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // 완료 시간 예측
  private static estimateCompletionTime(testId: string, statisticalPower: number): Date | undefined {
    if (statisticalPower >= 0.8) return undefined; // 이미 충분한 검정력
    
    const test = ABTest.findById(testId);
    if (!test) return undefined;
    
    const daysNeeded = Math.ceil((0.8 - statisticalPower) * 30); // 대략적인 계산
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysNeeded);
    
    return estimatedDate;
  }

  // 베이지안 통계 계산
  private static async calculateBayesianStats(testId: string, basicStats: any[]) {
    const variants = basicStats.map(stats => ({
      name: stats._id,
      participants: stats.participants.length,
      conversions: stats.conversions
    }));

    // 베이지안 추정 (Beta 분포 사용)
    const bayesianResults = variants.map(variant => {
      const alpha = variant.conversions + 1; // Beta 분포의 alpha 파라미터
      const beta = variant.participants - variant.conversions + 1; // Beta 분포의 beta 파라미터
      
      // 최고 확률 추정
      const probabilityOfBeingBest = this.calculateProbabilityOfBeingBest(variants, variant.name);
      
      // 예상 손실
      const expectedLoss = this.calculateBayesianExpectedLoss(variants, variant.name);
      
      // 신뢰구간 (95%)
      const credibleInterval = this.calculateCredibleInterval(alpha, beta, 0.95);
      
      return {
        probabilityOfBeingBest: Math.round(probabilityOfBeingBest * 100) / 100,
        expectedLoss: Math.round(expectedLoss * 100) / 100,
        credibleInterval
      };
    });

    return {
      probabilityOfBeingBest: bayesianResults.map(r => r.probabilityOfBeingBest),
      expectedLoss: bayesianResults.map(r => r.expectedLoss),
      credibleInterval: bayesianResults.map(r => r.credibleInterval)
    };
  }

  // 베이지안 최고 확률 계산
  private static calculateProbabilityOfBeingBest(variants: any[], variantName: string): number {
    // 간단한 베이지안 계산 (실제로는 더 복잡한 Monte Carlo 시뮬레이션 필요)
    const variant = variants.find(v => v.name === variantName);
    if (!variant) return 0;
    
    const variantRate = variant.participants > 0 ? variant.conversions / variant.participants : 0;
    const otherRates = variants
      .filter(v => v.name !== variantName)
      .map(v => v.participants > 0 ? v.conversions / v.participants : 0);
    
    const maxOtherRate = Math.max(...otherRates, 0);
    
    if (variantRate > maxOtherRate) {
      return Math.min(0.95, 0.5 + (variantRate - maxOtherRate) * 10);
    }
    
    return Math.max(0.05, 0.5 - (maxOtherRate - variantRate) * 10);
  }

  // 베이지안 예상 손실 계산
  private static calculateBayesianExpectedLoss(variants: any[], variantName: string): number {
    const variant = variants.find(v => v.name === variantName);
    if (!variant) return 0;
    
    const variantRate = variant.participants > 0 ? variant.conversions / variant.participants : 0;
    const otherRates = variants
      .filter(v => v.name !== variantName)
      .map(v => v.participants > 0 ? v.conversions / v.participants : 0);
    
    const maxOtherRate = Math.max(...otherRates, 0);
    const loss = Math.max(0, maxOtherRate - variantRate);
    
    return loss * variant.participants;
  }

  // 신뢰구간 계산 (Beta 분포)
  private static calculateCredibleInterval(alpha: number, beta: number, confidence: number): { lower: number; upper: number } {
    // 간단한 근사 계산 (실제로는 더 정확한 Beta 분포 역함수 사용)
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
    const stdDev = Math.sqrt(variance);
    
    const z = confidence === 0.95 ? 1.96 : 2.576;
    const margin = z * stdDev;
    
    return {
      lower: Math.max(0, (mean - margin) * 100),
      upper: Math.min(100, (mean + margin) * 100)
    };
  }

  // 추천사항 생성
  private static async generateRecommendations(
    testId: string, 
    advancedStats: any, 
    bayesianStats: any
  ): Promise<{ action: string; reason: string; confidence: number; expectedImpact: number }> {
    const test = await ABTest.findById(testId);
    if (!test) {
      return {
        action: 'continue',
        reason: '테스트 정보를 찾을 수 없습니다.',
        confidence: 0,
        expectedImpact: 0
      };
    }

    const { variants, overall } = advancedStats;
    const { probabilityOfBeingBest } = bayesianStats;

    // 통계적 유의성 확인
    const significantVariants = variants.filter((v: any) => v.isSignificant);
    const bestVariant = variants.reduce((best: any, current: any) => 
      current.conversionRate > best.conversionRate ? current : best
    );

    // 테스트 기간 확인
    const testDuration = overall.testDuration;
    const minDuration = 7; // 최소 7일
    const maxDuration = 30; // 최대 30일

    // 추천 로직
    if (testDuration < minDuration) {
      return {
        action: 'continue',
        reason: `테스트가 ${minDuration}일 미만으로 실행되었습니다. 더 많은 데이터가 필요합니다.`,
        confidence: 0.3,
        expectedImpact: 0
      };
    }

    if (testDuration >= maxDuration) {
      return {
        action: 'stop',
        reason: `테스트가 ${maxDuration}일 이상 실행되었습니다. 결과를 분석하고 결정을 내려야 합니다.`,
        confidence: 0.8,
        expectedImpact: bestVariant.conversionRate
      };
    }

    if (significantVariants.length > 0) {
      const bestSignificant = significantVariants.reduce((best: any, current: any) => 
        current.conversionRate > best.conversionRate ? current : best
      );
      
      const probability = probabilityOfBeingBest[variants.findIndex((v: any) => v.name === bestSignificant.name)];
      
      if (probability > 0.8) {
        return {
          action: 'declare_winner',
          reason: `'${bestSignificant.name}' 변형이 통계적으로 유의하고 베이지안 확률이 높습니다.`,
          confidence: probability,
          expectedImpact: bestSignificant.conversionRate
        };
      }
    }

    if (overall.statisticalPower < 0.5) {
      return {
        action: 'extend',
        reason: '통계적 검정력이 낮습니다. 더 많은 참가자가 필요합니다.',
        confidence: 0.6,
        expectedImpact: 0
      };
    }

    return {
      action: 'continue',
      reason: '테스트를 계속 진행하여 더 명확한 결과를 얻어야 합니다.',
      confidence: 0.5,
      expectedImpact: bestVariant.conversionRate
    };
  }

  // 실시간 이벤트 처리
  static async processRealtimeEvent(testId: string, eventType: string, variantName: string, userId: string) {
    try {
      // 이벤트 저장
      const event = new ABTestEvent({
        testId,
        userId,
        sessionId: `session_${Date.now()}`,
        variantName,
        eventType,
        metadata: {
          timestamp: new Date(),
          userAgent: 'realtime',
          ipAddress: '127.0.0.1'
        }
      });

      await event.save();

      // 실시간 통계 업데이트
      const stats = await this.calculateAdvancedStats(testId);
      
      return {
        success: true,
        stats,
        eventId: event._id
      };
    } catch (error) {
      console.error('Real-time event processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 테스트 자동 종료 검사
  static async checkAutoTermination(testId: string): Promise<boolean> {
    const stats = await this.calculateAdvancedStats(testId);
    const { recommendations } = stats;

    if (recommendations.action === 'declare_winner' && recommendations.confidence > 0.8) {
      // 테스트 자동 종료
      await ABTest.findByIdAndUpdate(testId, {
        status: 'completed',
        endDate: new Date(),
        winner: stats.variants.reduce((best: any, current: any) => 
          current.conversionRate > best.conversionRate ? current : best
        ).name
      });

      return true;
    }

    return false;
  }
}
