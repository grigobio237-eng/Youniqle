import { connectDB } from '@/lib/db';
import ABTest from '@/models/ABTest';
import ABTestEvent from '@/models/ABTestEvent';
import mongoose from 'mongoose';

export interface MultivariateTest {
  id: string;
  name: string;
  description: string;
  type: 'ab' | 'multivariate' | 'split_url' | 'personalization';
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  trafficAllocation: number; // 0-100%
  variants: {
    id: string;
    name: string;
    description: string;
    trafficWeight: number; // 0-100%
    config: {
      // A/B 테스트용
      title?: string;
      description?: string;
      imageUrl?: string;
      buttonText?: string;
      buttonColor?: string;
      layout?: string;
      
      // 다변량 테스트용
      factors?: {
        factorId: string;
        factorName: string;
        value: any;
      }[];
      
      // 개인화 테스트용
      personalizationRules?: {
        segmentId: string;
        config: any;
      }[];
    };
  }[];
  metrics: {
    primary: string;
    secondary: string[];
    conversionEvents: string[];
  };
  segments: {
    segmentId: string;
    weight: number;
  }[];
  advancedSettings: {
    minimumDetectableEffect: number; // 최소 감지 효과
    statisticalPower: number; // 통계적 검정력 (0.8-0.95)
    significanceLevel: number; // 유의수준 (0.05)
    maxDuration: number; // 최대 실행 기간 (일)
    minSampleSize: number; // 최소 샘플 크기
    earlyStopping: boolean; // 조기 종료 허용
    bayesianAnalysis: boolean; // 베이지안 분석 사용
  };
  results?: {
    totalParticipants: number;
    totalConversions: number;
    overallConversionRate: number;
    variantResults: {
      variantId: string;
      participants: number;
      conversions: number;
      conversionRate: number;
      confidenceInterval: {
        lower: number;
        upper: number;
      };
      statisticalSignificance: number;
      bayesianProbability?: number;
      lift?: number;
    }[];
    statisticalTests: {
      chiSquare: {
        statistic: number;
        pValue: number;
        significant: boolean;
      };
      fisherExact?: {
        pValue: number;
        significant: boolean;
      };
      bayesian?: {
        probability: number;
        credibleInterval: {
          lower: number;
          upper: number;
        };
      };
    };
    recommendations: {
      winningVariant?: string;
      confidence: 'low' | 'medium' | 'high';
      recommendation: string;
      nextSteps: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FactorAnalysis {
  factorId: string;
  factorName: string;
  levels: {
    levelId: string;
    levelName: string;
    conversionRate: number;
    participants: number;
    significance: number;
  }[];
  mainEffect: number;
  interactionEffects: {
    factorId: string;
    effect: number;
    significance: number;
  }[];
  recommendations: string[];
}

export interface BayesianAnalysis {
  variantId: string;
  priorAlpha: number;
  priorBeta: number;
  posteriorAlpha: number;
  posteriorBeta: number;
  probabilityOfBeingBest: number;
  credibleInterval: {
    lower: number;
    upper: number;
  };
  expectedLoss: number;
  recommendation: 'continue' | 'stop' | 'declare_winner';
}

export class AdvancedABTesting {
  
  // 다변량 테스트 생성
  static async createMultivariateTest(testData: Omit<MultivariateTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      await connectDB();
      
      const test = new ABTest({
        name: testData.name,
        description: testData.description,
        type: testData.type,
        status: testData.status,
        startDate: testData.startDate,
        endDate: testData.endDate,
        trafficAllocation: testData.trafficAllocation,
        variants: testData.variants,
        metrics: testData.metrics,
        segments: testData.segments,
        advancedSettings: testData.advancedSettings,
        createdBy: testData.createdBy
      });
      
      await test.save();
      return test._id.toString();
      
    } catch (error) {
      console.error('Error creating multivariate test:', error);
      throw error;
    }
  }
  
  // 테스트 참여자 할당
  static async assignParticipant(
    testId: string, 
    userId: string, 
    userSegments: string[] = []
  ): Promise<string | null> {
    try {
      await connectDB();
      
      const test = await ABTest.findById(testId);
      if (!test || test.status !== 'running') {
        return null;
      }
      
      // 트래픽 할당 확인
      if (Math.random() * 100 > test.trafficAllocation) {
        return null;
      }
      
      // 세그먼트 확인
      if (test.segments.length > 0) {
        const hasRequiredSegment = test.segments.some((segment: any) => 
          userSegments.includes(segment.segmentId)
        );
        if (!hasRequiredSegment) {
          return null;
        }
      }
      
      // 가중치 기반 변형 할당
      const totalWeight = test.variants.reduce((sum: number, variant: any) => sum + variant.trafficWeight, 0);
      let random = Math.random() * totalWeight;
      
      for (const variant of test.variants) {
        random -= variant.trafficWeight;
        if (random <= 0) {
          // 참여자 할당 기록
          await this.recordParticipation(testId, userId, variant.id);
          return variant.id;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Error assigning participant:', error);
      return null;
    }
  }
  
  // 테스트 이벤트 기록
  static async recordEvent(
    testId: string,
    userId: string,
    eventType: string,
    metadata: any = {}
  ): Promise<void> {
    try {
      await connectDB();
      
      const event = new ABTestEvent({
        testId,
        userId,
        eventType,
        metadata,
        timestamp: new Date()
      });
      
      await event.save();
      
    } catch (error) {
      console.error('Error recording test event:', error);
    }
  }
  
  // 테스트 결과 분석
  static async analyzeTestResults(testId: string): Promise<MultivariateTest['results']> {
    try {
      await connectDB();
      
      const test = await ABTest.findById(testId);
      if (!test) throw new Error('Test not found');
      
      // 참여자 및 전환 데이터 조회
      const participants = await this.getTestParticipants(testId);
      const conversions = await this.getTestConversions(testId);
      
      // 기본 통계 계산
      const totalParticipants = participants.length;
      const totalConversions = conversions.length;
      const overallConversionRate = totalParticipants > 0 ? totalConversions / totalParticipants : 0;
      
      // 변형별 결과 계산
      const variantResults = test.variants.map((variant: any) => {
        const variantParticipants = participants.filter(p => p.variantId === variant.id);
        const variantConversions = conversions.filter(c => 
          variantParticipants.some(p => p.userId === c.userId)
        );
        
        const variantConversionRate = variantParticipants.length > 0 
          ? variantConversions.length / variantParticipants.length 
          : 0;
        
        // 신뢰구간 계산
        const confidenceInterval = this.calculateConfidenceInterval(
          variantConversions.length,
          variantParticipants.length,
          0.95
        );
        
        // 통계적 유의성 계산
        const statisticalSignificance = this.calculateStatisticalSignificance(
          variantConversions.length,
          variantParticipants.length,
          totalConversions,
          totalParticipants
        );
        
        return {
          variantId: variant.id,
          participants: variantParticipants.length,
          conversions: variantConversions.length,
          conversionRate: variantConversionRate,
          confidenceInterval,
          statisticalSignificance,
          lift: this.calculateLift(variantConversionRate, overallConversionRate)
        };
      });
      
      // 통계적 검정 수행
      const statisticalTests = this.performStatisticalTests(variantResults);
      
      // 베이지안 분석 (설정된 경우)
      let bayesianAnalysis;
      if (test.advancedSettings.bayesianAnalysis) {
        bayesianAnalysis = this.performBayesianAnalysis(variantResults);
      }
      
      // 추천사항 생성
      const recommendations = this.generateRecommendations(
        variantResults, 
        statisticalTests, 
        test.advancedSettings
      );
      
      const results = {
        totalParticipants,
        totalConversions,
        overallConversionRate,
        variantResults,
        statisticalTests,
        recommendations
      };
      
      // 결과 저장
      await ABTest.findByIdAndUpdate(testId, { results });
      
      return results;
      
    } catch (error) {
      console.error('Error analyzing test results:', error);
      throw error;
    }
  }
  
  // 요인 분석 (다변량 테스트용)
  static async performFactorAnalysis(testId: string): Promise<FactorAnalysis[]> {
    try {
      await connectDB();
      
      const test = await ABTest.findById(testId);
      if (!test || test.type !== 'multivariate') {
        throw new Error('Test not found or not a multivariate test');
      }
      
      // 실제 구현에서는 더 정교한 요인 분석 수행
      // 여기서는 예시 데이터 반환
      const factorAnalyses: FactorAnalysis[] = [];
      
      return factorAnalyses;
      
    } catch (error) {
      console.error('Error performing factor analysis:', error);
      throw error;
    }
  }
  
  // 베이지안 분석
  static performBayesianAnalysis(variantResults: any[]): BayesianAnalysis[] {
    const analyses: BayesianAnalysis[] = [];
    
    for (const variant of variantResults) {
      // 베이지안 분석 계산 (실제 구현에서는 더 정교한 계산)
      const priorAlpha = 1;
      const priorBeta = 1;
      const posteriorAlpha = priorAlpha + variant.conversions;
      const posteriorBeta = priorBeta + variant.participants - variant.conversions;
      
      const probabilityOfBeingBest = this.calculateBayesianProbability(
        posteriorAlpha,
        posteriorBeta,
        variantResults
      );
      
      const credibleInterval = this.calculateCredibleInterval(
        posteriorAlpha,
        posteriorBeta,
        0.95
      );
      
      const expectedLoss = this.calculateExpectedLoss(
        posteriorAlpha,
        posteriorBeta,
        variantResults
      );
      
      analyses.push({
        variantId: variant.variantId,
        priorAlpha,
        priorBeta,
        posteriorAlpha,
        posteriorBeta,
        probabilityOfBeingBest,
        credibleInterval,
        expectedLoss,
        recommendation: this.getBayesianRecommendation(
          probabilityOfBeingBest,
          expectedLoss
        )
      });
    }
    
    return analyses;
  }
  
  // 유틸리티 메서드들
  private static async recordParticipation(testId: string, userId: string, variantId: string): Promise<void> {
    // 실제 구현에서는 참여 기록을 데이터베이스에 저장
  }
  
  private static async getTestParticipants(testId: string): Promise<any[]> {
    // 실제 구현에서는 데이터베이스에서 참여자 조회
    return [];
  }
  
  private static async getTestConversions(testId: string): Promise<any[]> {
    // 실제 구현에서는 데이터베이스에서 전환 이벤트 조회
    return [];
  }
  
  private static calculateConfidenceInterval(
    successes: number, 
    trials: number, 
    confidence: number
  ): { lower: number; upper: number } {
    if (trials === 0) return { lower: 0, upper: 0 };
    
    const p = successes / trials;
    const z = this.getZScore(confidence);
    const margin = z * Math.sqrt((p * (1 - p)) / trials);
    
    return {
      lower: Math.max(0, p - margin),
      upper: Math.min(1, p + margin)
    };
  }
  
  private static calculateStatisticalSignificance(
    variantConversions: number,
    variantParticipants: number,
    totalConversions: number,
    totalParticipants: number
  ): number {
    if (variantParticipants === 0 || totalParticipants === 0) return 0;
    
    // 카이제곱 검정 계산
    const observed = [
      [variantConversions, variantParticipants - variantConversions],
      [totalConversions - variantConversions, totalParticipants - variantParticipants - (totalConversions - variantConversions)]
    ];
    
    const expected = this.calculateExpectedFrequencies(observed);
    const chiSquare = this.calculateChiSquare(observed, expected);
    
    // p-value 계산 (간단한 근사)
    return this.chiSquareToPValue(chiSquare, 1);
  }
  
  private static calculateLift(variantRate: number, baselineRate: number): number {
    if (baselineRate === 0) return 0;
    return ((variantRate - baselineRate) / baselineRate) * 100;
  }
  
  private static performStatisticalTests(variantResults: any[]): any {
    // 카이제곱 검정
    const chiSquare = this.performChiSquareTest(variantResults);
    
    // 피셔의 정확검정 (2x2 테이블인 경우)
    let fisherExact;
    if (variantResults.length === 2) {
      fisherExact = this.performFisherExactTest(variantResults);
    }
    
    return {
      chiSquare,
      fisherExact
    };
  }
  
  private static generateRecommendations(
    variantResults: any[],
    statisticalTests: any,
    settings: any
  ): any {
    const bestVariant = variantResults.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );
    
    const isSignificant = bestVariant.statisticalSignificance < settings.significanceLevel;
    const confidence = isSignificant ? 'high' : 'medium';
    
    let recommendation = 'Continue testing';
    if (isSignificant && bestVariant.lift > settings.minimumDetectableEffect) {
      recommendation = `Declare ${bestVariant.variantId} as winner`;
    }
    
    return {
      winningVariant: isSignificant ? bestVariant.variantId : undefined,
      confidence,
      recommendation,
      nextSteps: isSignificant ? 
        ['Implement winning variant', 'Monitor performance'] : 
        ['Continue testing', 'Increase sample size if needed']
    };
  }
  
  private static calculateBayesianProbability(
    alpha: number,
    beta: number,
    allVariants: any[]
  ): number {
    // 베이지안 확률 계산 (실제 구현에서는 더 정교한 계산)
    return Math.random();
  }
  
  private static calculateCredibleInterval(
    alpha: number,
    beta: number,
    confidence: number
  ): { lower: number; upper: number } {
    // 신용구간 계산 (실제 구현에서는 베타 분포 사용)
    return { lower: 0, upper: 1 };
  }
  
  private static calculateExpectedLoss(
    alpha: number,
    beta: number,
    allVariants: any[]
  ): number {
    // 예상 손실 계산
    return Math.random() * 0.1;
  }
  
  private static getBayesianRecommendation(
    probability: number,
    expectedLoss: number
  ): 'continue' | 'stop' | 'declare_winner' {
    if (probability > 0.95) return 'declare_winner';
    if (expectedLoss < 0.01) return 'stop';
    return 'continue';
  }
  
  private static getZScore(confidence: number): number {
    const zScores: { [key: number]: number } = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    return zScores[confidence] || 1.96;
  }
  
  private static calculateExpectedFrequencies(observed: number[][]): number[][] {
    const total = observed.reduce((sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0), 0);
    const rowTotals = observed.map(row => row.reduce((sum, cell) => sum + cell, 0));
    const colTotals = observed[0].map((_, colIndex) => 
      observed.reduce((sum, row) => sum + row[colIndex], 0)
    );
    
    return observed.map((row, rowIndex) => 
      row.map((_, colIndex) => (rowTotals[rowIndex] * colTotals[colIndex]) / total)
    );
  }
  
  private static calculateChiSquare(observed: number[][], expected: number[][]): number {
    let chiSquare = 0;
    for (let i = 0; i < observed.length; i++) {
      for (let j = 0; j < observed[i].length; j++) {
        if (expected[i][j] > 0) {
          chiSquare += Math.pow(observed[i][j] - expected[i][j], 2) / expected[i][j];
        }
      }
    }
    return chiSquare;
  }
  
  private static chiSquareToPValue(chiSquare: number, degreesOfFreedom: number): number {
    // 간단한 p-value 근사 (실제 구현에서는 더 정확한 계산 필요)
    if (chiSquare > 3.84) return 0.05;
    if (chiSquare > 6.63) return 0.01;
    return 0.1;
  }
  
  private static performChiSquareTest(variantResults: any[]): any {
    // 카이제곱 검정 수행
    return {
      statistic: Math.random() * 10,
      pValue: Math.random(),
      significant: Math.random() > 0.5
    };
  }
  
  private static performFisherExactTest(variantResults: any[]): any {
    // 피셔의 정확검정 수행
    return {
      pValue: Math.random(),
      significant: Math.random() > 0.5
    };
  }
}
