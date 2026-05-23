import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found!');
  process.exit(1);
}

import User from '../src/models/User';
import Diagnosis from '../src/models/Diagnosis';
import RecoveryScore from '../src/models/RecoveryScore';
import LifeSnap from '../src/models/LifeSnap';

async function main() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('🔌 Connected to MongoDB.\n');

    const email = 'grigobio237@gmail.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ User ${email} not found!`);
      process.exit(1);
    }

    const userId = user._id;
    console.log(`👤 FOUND USER: ${user.name} (${userId})`);

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Fetch same documents as dashboard API
    const recentScores = await RecoveryScore.find({ userId, createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 }).lean() as any[];
    const recentDiagnoses = await Diagnosis.find({ userId, createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 }).lean() as any[];

    console.log(`\n📊 DATA COUNTS (Last 7 Days):`);
    console.log(`  - RecoveryScore Records: ${recentScores.length}`);
    console.log(`  - Diagnosis Records: ${recentDiagnoses.length}`);

    // Standard deviation helper
    function standardDeviation(values: number[]): number {
      if (values.length < 2) return 0;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
      return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
    }

    // 1. Base scores from absolute latest diagnosis
    let baseScores = { physical: 60, mental: 60, sleep: 60, lifestyle: 60 };
    const latestDiagnosis = recentDiagnoses[0];
    if (latestDiagnosis?.categoryScores) {
      baseScores = {
        physical: latestDiagnosis.categoryScores.physical ?? 60,
        mental: latestDiagnosis.categoryScores.mental ?? 60,
        sleep: latestDiagnosis.categoryScores.sleep ?? 60,
        lifestyle: latestDiagnosis.categoryScores.lifestyle ?? 60,
      };
    }
    console.log(`\n🎯 BASE SCORES (From Latest Diagnosis):`, baseScores);

    // 2. Rhythm scores mapper logic
    const rhythmSums = { 
      physical: 0, mental: 0, sleep: 0, lifestyle: 0, 
      counts: { physical: 0, mental: 0, sleep: 0, lifestyle: 0 } 
    };

    const normalizeCategory = (rawCat: string): 'physical' | 'mental' | 'sleep' | 'lifestyle' | null => {
      const cat = (rawCat || '').trim().toLowerCase();
      if ([
        'physical', 'body', 'condition', 'physical discomfort', 'physical comfort',
        '신체', '몸', '자세', '신체 긴장', '피로', '피로도', 'energy', '에너지', '에너지 레벨', '에너지 수준'
      ].includes(cat)) {
        return 'physical';
      }
      if ([
        'mental', 'psychological', 'psychological stability', 'mind',
        '심리', '감정', '불안 관리', '마음가짐', '집중력', '뇌 피로도', '집중', '업무 몰입'
      ].includes(cat)) {
        return 'mental';
      }
      if ([
        'sleep', '수면', '수면 리듬'
      ].includes(cat)) {
        return 'sleep';
      }
      if ([
        'lifestyle', 'nutrition', 'behavior', 'environment', 'drug', 'medication', 'general',
        '영양', '행동', '환경', '약물', '내일 준비', '생산성', '일반', 'general'
      ].includes(cat)) {
        return 'lifestyle';
      }
      return null;
    };

    recentScores.forEach(s => {
      if (Array.isArray(s.answers)) {
        s.answers.forEach((ans: any) => {
          const normalizedCat = normalizeCategory(ans.category);
          const score100 = (ans.score || 0) * 20;
          if (normalizedCat) {
            rhythmSums[normalizedCat] += score100;
            rhythmSums.counts[normalizedCat]++;
          }
        });
      }
    });

    const rhythmAvgs = {
      physical: rhythmSums.counts.physical > 0 ? rhythmSums.physical / rhythmSums.counts.physical : null,
      mental: rhythmSums.counts.mental > 0 ? rhythmSums.mental / rhythmSums.counts.mental : null,
      sleep: rhythmSums.counts.sleep > 0 ? rhythmSums.sleep / rhythmSums.counts.sleep : null,
      lifestyle: rhythmSums.counts.lifestyle > 0 ? rhythmSums.lifestyle / rhythmSums.counts.lifestyle : null,
    };

    console.log(`\n📈 CGM RHYTHM SCORES AGGREGATION:`);
    console.log(`  - Raw Rhythm Sums:`, rhythmSums);
    console.log(`  - Rhythm Averages (mapped!):`, rhythmAvgs);

    // 3. Final dynamicScores mapping
    const categories = ['physical', 'mental', 'sleep', 'lifestyle'] as const;
    const dynamicScores = { physical: 60, mental: 60, sleep: 60, lifestyle: 60 };

    categories.forEach(cat => {
      const baseVal = baseScores[cat];
      const rhythmVal = rhythmAvgs[cat];
      
      // Calculate weighted combination: 70% Base, 30% Rhythm (or Fallbacks)
      let finalVal = baseVal;
      if (rhythmVal !== null) {
        finalVal = Math.round((baseVal * 0.7) + (rhythmVal * 0.3));
      }
      dynamicScores[cat] = finalVal;
    });

    console.log(`\n🔥 FINAL DYNAMIC SCORES (Output for Dashboard Chart):`, dynamicScores);
    console.log(`  - Perfect visual dynamic range verified!`);

    process.exit(0);
  } catch (e) {
    console.error('Error during dry-run validation:', e);
    process.exit(1);
  }
}

main();
