// A/B 테스트 통계 계산 유틸리티

export interface TestVariant {
  name: string;
  sampleSize: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
  avgOrderValue?: number;
}

export interface TestResults {
  variants: Array<{
    variantName: string;
    sampleSize: number;
    conversions: number;
    conversionRate: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    pValue: number;
    isSignificant: boolean;
    lift: number;
    revenue?: number;
    avgOrderValue?: number;
  }>;
  overallConversionRate: number;
  statisticalSignificance: boolean;
  winner?: string;
  recommendation?: string;
  testDuration: number;
}

export class ABTestStatsCalculator {
  // Z-score 계산 (정규분포)
  static calculateZScore(p1: number, p2: number, n1: number, n2: number): number {
    const p = (p1 * n1 + p2 * n2) / (n1 + n2);
    const se = Math.sqrt(p * (1 - p) * (1/n1 + 1/n2));
    return (p1 - p2) / se;
  }

  // P-value 계산 (양측 검정)
  static calculatePValue(zScore: number): number {
    // 정규분포의 누적분포함수 근사
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = zScore >= 0 ? 1 : -1;
    const x = Math.abs(zScore) / Math.sqrt(2);
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 2 * (1 - y) * sign;
  }

  // 신뢰구간 계산 (Wilson Score Interval)
  static calculateConfidenceInterval(
    conversions: number, 
    sampleSize: number, 
    confidenceLevel: number = 0.95
  ): { lower: number; upper: number } {
    const z = this.getZScore(confidenceLevel);
    const p = conversions / sampleSize;
    const n = sampleSize;
    
    const center = (p + (z * z) / (2 * n)) / (1 + (z * z) / n);
    const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n) / (1 + (z * z) / n);
    
    return {
      lower: Math.max(0, center - margin),
      upper: Math.min(1, center + margin)
    };
  }

  // Z-score 값 가져오기
  private static getZScore(confidenceLevel: number): number {
    const zScores: { [key: number]: number } = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    return zScores[confidenceLevel] || 1.96;
  }

  // 통계적 유의성 검정
  static isStatisticallySignificant(
    control: TestVariant,
    variant: TestVariant,
    significanceLevel: number = 0.05
  ): boolean {
    const zScore = this.calculateZScore(
      variant.conversionRate,
      control.conversionRate,
      variant.sampleSize,
      control.sampleSize
    );
    
    const pValue = this.calculatePValue(zScore);
    return pValue < significanceLevel;
  }

  // 최소 샘플 크기 계산
  static calculateMinSampleSize(
    baselineConversionRate: number,
    expectedLift: number,
    significanceLevel: number = 0.05,
    power: number = 0.8
  ): number {
    const zAlpha = this.getZScore(1 - significanceLevel / 2);
    const zBeta = this.getZScore(power);
    
    const p1 = baselineConversionRate;
    const p2 = baselineConversionRate * (1 + expectedLift / 100);
    const p = (p1 + p2) / 2;
    
    const numerator = Math.pow(zAlpha * Math.sqrt(2 * p * (1 - p)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
    const denominator = Math.pow(p1 - p2, 2);
    
    return Math.ceil(numerator / denominator);
  }

  // 테스트 결과 계산
  static calculateTestResults(
    variants: TestVariant[],
    significanceLevel: number = 0.05,
    confidenceLevel: number = 0.95,
    testDuration: number = 0
  ): TestResults {
    if (variants.length < 2) {
      throw new Error('최소 2개의 변형이 필요합니다.');
    }

    // 대조군 찾기 (첫 번째 변형을 대조군으로 가정)
    const control = variants[0];
    const testVariants = variants.slice(1);

    const results: TestResults = {
      variants: [],
      overallConversionRate: 0,
      statisticalSignificance: false,
      testDuration
    };

    // 전체 전환율 계산
    const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);
    const totalSampleSize = variants.reduce((sum, v) => sum + v.sampleSize, 0);
    results.overallConversionRate = totalConversions / totalSampleSize;

    // 각 변형별 결과 계산
    for (const variant of variants) {
      const confidenceInterval = this.calculateConfidenceInterval(
        variant.conversions,
        variant.sampleSize,
        confidenceLevel
      );

      // 대조군과의 비교 (대조군이 아닌 경우)
      let pValue = 1;
      let isSignificant = false;
      let lift = 0;

      if (variant !== control) {
        pValue = this.calculatePValue(
          this.calculateZScore(
            variant.conversionRate,
            control.conversionRate,
            variant.sampleSize,
            control.sampleSize
          )
        );
        isSignificant = pValue < significanceLevel;
        lift = ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100;
      }

      results.variants.push({
        variantName: variant.name,
        sampleSize: variant.sampleSize,
        conversions: variant.conversions,
        conversionRate: variant.conversionRate,
        confidenceInterval,
        pValue,
        isSignificant,
        lift,
        revenue: variant.revenue,
        avgOrderValue: variant.avgOrderValue
      });
    }

    // 통계적 유의성 확인
    results.statisticalSignificance = results.variants.some(v => v.isSignificant);

    // 승자 결정
    if (results.statisticalSignificance) {
      const significantVariants = results.variants.filter(v => v.isSignificant);
      const winner = significantVariants.reduce((best, current) => 
        current.conversionRate > best.conversionRate ? current : best
      );
      results.winner = winner.variantName;
    }

    // 권장사항 생성
    results.recommendation = this.generateRecommendation(results);

    return results;
  }

  // 권장사항 생성
  private static generateRecommendation(results: TestResults): string {
    if (!results.statisticalSignificance) {
      return '통계적으로 유의한 차이가 없습니다. 더 많은 데이터를 수집하거나 테스트를 계속 진행하세요.';
    }

    if (results.winner) {
      const winner = results.variants.find(v => v.variantName === results.winner);
      if (winner) {
        return `"${winner.variantName}" 변형이 ${winner.lift.toFixed(1)}% 개선되었습니다. 이 변형을 적용하는 것을 권장합니다.`;
      }
    }

    return '테스트 결과를 분석하여 최적의 변형을 선택하세요.';
  }

  // 베이지안 통계 계산 (선택적)
  static calculateBayesianStats(
    control: TestVariant,
    variant: TestVariant,
    priorAlpha: number = 1,
    priorBeta: number = 1
  ): {
    probabilityOfBeingBetter: number;
    expectedLoss: number;
    credibleInterval: { lower: number; upper: number };
  } {
    // 베이지안 추론을 위한 베타 분포 파라미터
    const alphaControl = priorAlpha + control.conversions;
    const betaControl = priorBeta + control.sampleSize - control.conversions;
    const alphaVariant = priorAlpha + variant.conversions;
    const betaVariant = priorBeta + variant.sampleSize - variant.conversions;

    // 변형이 더 좋을 확률 계산 (Monte Carlo 시뮬레이션)
    const samples = 10000;
    let betterCount = 0;
    
    for (let i = 0; i < samples; i++) {
      const controlSample = this.sampleBeta(alphaControl, betaControl);
      const variantSample = this.sampleBeta(alphaVariant, betaVariant);
      if (variantSample > controlSample) {
        betterCount++;
      }
    }

    const probabilityOfBeingBetter = betterCount / samples;

    // 예상 손실 계산
    const expectedLoss = this.calculateExpectedLoss(
      alphaControl, betaControl, alphaVariant, betaVariant
    );

    // 신뢰구간 계산
    const credibleInterval = this.calculateCredibleInterval(alphaVariant, betaVariant);

    return {
      probabilityOfBeingBetter,
      expectedLoss,
      credibleInterval
    };
  }

  // 베타 분포 샘플링 (Beta-Bernoulli 공액)
  private static sampleBeta(alpha: number, beta: number): number {
    // 간단한 근사 방법 (실제로는 더 정교한 알고리즘 사용)
    const gamma1 = this.sampleGamma(alpha, 1);
    const gamma2 = this.sampleGamma(beta, 1);
    return gamma1 / (gamma1 + gamma2);
  }

  // 감마 분포 샘플링 (간단한 근사)
  private static sampleGamma(shape: number, scale: number): number {
    // Marsaglia and Tsang's method
    if (shape < 1) {
      return Math.pow(Math.random(), 1 / shape) * this.sampleGamma(shape + 1, scale);
    }
    
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      let x, v;
      do {
        x = this.sampleNormal();
        v = 1 + c * x;
      } while (v <= 0);
      
      v = v * v * v;
      const u = Math.random();
      
      if (u < 1 - 0.0331 * (x * x) * (x * x)) {
        return d * v * scale;
      }
      
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  }

  // 정규분포 샸플링 (Box-Muller 변환)
  private static sampleNormal(): number {
    if (this.normalSample !== null) {
      const sample = this.normalSample;
      this.normalSample = null;
      return sample;
    }
    
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    
    this.normalSample = z1;
    return z0;
  }

  private static normalSample: number | null = null;

  // 예상 손실 계산
  private static calculateExpectedLoss(
    alphaControl: number, betaControl: number,
    alphaVariant: number, betaVariant: number
  ): number {
    // 간단한 근사 계산
    const controlMean = alphaControl / (alphaControl + betaControl);
    const variantMean = alphaVariant / (alphaVariant + betaVariant);
    return Math.max(0, controlMean - variantMean);
  }

  // 신뢰구간 계산
  private static calculateCredibleInterval(
    alpha: number, beta: number, confidence: number = 0.95
  ): { lower: number; upper: number } {
    const lower = this.inverseBetaCDF((1 - confidence) / 2, alpha, beta);
    const upper = this.inverseBetaCDF(1 - (1 - confidence) / 2, alpha, beta);
    return { lower, upper };
  }

  // 베타 분포의 역누적분포함수 (근사)
  private static inverseBetaCDF(p: number, alpha: number, beta: number): number {
    // 간단한 근사 방법
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
    const stdDev = Math.sqrt(variance);
    
    // 정규분포 근사
    const z = this.inverseNormalCDF(p);
    return Math.max(0, Math.min(1, mean + z * stdDev));
  }

  // 정규분포의 역누적분포함수 (근사)
  private static inverseNormalCDF(p: number): number {
    // Beasley-Springer-Moro 알고리즘의 간단한 근사
    const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614201e+01, 2.506628277459239];
    const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

    if (p < 0.02425) {
      const q = Math.sqrt(-2 * Math.log(p));
      return (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) / ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    } else if (p < 0.97575) {
      const q = p - 0.5;
      const r = q * q;
      return (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q / (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
    } else {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) / ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    }
  }
}











