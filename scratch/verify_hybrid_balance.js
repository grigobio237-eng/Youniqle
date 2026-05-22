const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Standard deviation helper
function standardDeviation(array) {
  const n = array.length;
  if (!array || n === 0) return 0;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

// Schemas & Models
const UserSchema = new mongoose.Schema({}, { strict: false });
const DiagnosisSchema = new mongoose.Schema({}, { strict: false });
const LifeSnapSchema = new mongoose.Schema({}, { strict: false });
const RecoveryScoreSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');
const Diagnosis = mongoose.models.Diagnosis || mongoose.model('Diagnosis', DiagnosisSchema, 'diagnoses');
const LifeSnap = mongoose.models.LifeSnap || mongoose.model('LifeSnap', LifeSnapSchema, 'lifesnaps');
const RecoveryScore = mongoose.models.RecoveryScore || mongoose.model('RecoveryScore', RecoveryScoreSchema, 'recoveryscores');

async function verify() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing in .env.local');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected successfully!');

  const email = 'grigobio237@gmail.com';
  console.log(`🔍 Finding user with email: ${email}`);
  const user = await User.findOne({ email }).lean();
  
  if (!user) {
    console.error('❌ User not found!');
    await mongoose.disconnect();
    process.exit(1);
  }
  
  const userId = user._id;
  console.log(`👤 User ID: ${userId}, Name: ${user.name}`);

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);

  console.log(`📅 Analysis window: ${sevenDaysAgo.toISOString()} to ${now.toISOString()}`);

  // Query datasets
  const [recentScores, prevWeekScores] = await Promise.all([
    RecoveryScore.find({ userId, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }).lean(),
    RecoveryScore.find({ userId, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }).sort({ createdAt: -1 }).lean()
  ]);

  const latestDiagnosis = await Diagnosis.findOne({ userId }).sort({ createdAt: -1 }).lean();
  const prevDiagnosis = await Diagnosis.findOne({ userId, _id: { $ne: latestDiagnosis?._id } }).sort({ createdAt: -1 }).lean();
  const recentDiagnoses = await Diagnosis.find({ userId, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }).lean();
  const latestScans = await LifeSnap.find({ userId }).sort({ createdAt: -1 }).limit(3).lean();
  const recentScans = await LifeSnap.find({ userId, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }).lean();

  console.log(`📊 Retrieved Datasets Count:`);
  console.log(`- 60s Rhythm Checks (7 days): ${recentScores.length}`);
  console.log(`- Diagnosis records (7 days): ${recentDiagnoses.length}`);
  console.log(`- Smart Scan records (7 days): ${recentScans.length}`);

  // A. Base scores (60% weight)
  let baseScores = { physical: 60, mental: 60, sleep: 60, lifestyle: 60 };
  const absoluteLatestPrecisionDiagnosis = await Diagnosis.findOne({
    userId,
    $or: [
      { type: { $in: ['FREE', 'PRECISION', 'PRECISE'] } },
      { 'answers.20': { $exists: true } }
    ]
  }).sort({ createdAt: -1 }).lean();

  if (absoluteLatestPrecisionDiagnosis?.categoryScores) {
    baseScores = {
      physical: absoluteLatestPrecisionDiagnosis.categoryScores.physical ?? 60,
      mental: absoluteLatestPrecisionDiagnosis.categoryScores.mental ?? 60,
      sleep: absoluteLatestPrecisionDiagnosis.categoryScores.sleep ?? 60,
      lifestyle: absoluteLatestPrecisionDiagnosis.categoryScores.lifestyle ?? 60,
    };
    console.log('📌 Using Precision Diagnosis Base:', baseScores);
  } else if (latestDiagnosis?.categoryScores) {
    baseScores = {
      physical: latestDiagnosis.categoryScores.physical ?? 60,
      mental: latestDiagnosis.categoryScores.mental ?? 60,
      sleep: latestDiagnosis.categoryScores.sleep ?? 60,
      lifestyle: latestDiagnosis.categoryScores.lifestyle ?? 60,
    };
    console.log('📌 Using Latest Diagnosis Base (fallback):', baseScores);
  } else {
    console.log('📌 Using default fallback Base scores:', baseScores);
  }

  // B. Daily check (16-question) (20% weight)
  const daily16s = recentDiagnoses.filter(d => d.answers?.length === 16);
  const daily16Sums = { physical: 0, mental: 0, sleep: 0, lifestyle: 0, count: 0 };
  daily16s.forEach(d => {
    if (d.categoryScores) {
      daily16Sums.physical += d.categoryScores.physical || 0;
      daily16Sums.mental += d.categoryScores.mental || 0;
      daily16Sums.sleep += d.categoryScores.sleep || 0;
      daily16Sums.lifestyle += d.categoryScores.lifestyle || 0;
      daily16Sums.count++;
    }
  });
  const daily16Avgs = daily16Sums.count > 0 ? {
    physical: daily16Sums.physical / daily16Sums.count,
    mental: daily16Sums.mental / daily16Sums.count,
    sleep: daily16Sums.sleep / daily16Sums.count,
    lifestyle: daily16Sums.lifestyle / daily16Sums.count,
  } : null;
  console.log('📈 Daily Check 16s Averages:', daily16Avgs);

  // C. 60s Rhythm Check answers (10% weight)
  const rhythmSums = { 
    physical: 0, mental: 0, sleep: 0, lifestyle: 0, 
    counts: { physical: 0, mental: 0, sleep: 0, lifestyle: 0 } 
  };
  recentScores.forEach(s => {
    if (Array.isArray(s.answers)) {
      s.answers.forEach((ans) => {
        const cat = (ans.category || '').toLowerCase();
        const score100 = (ans.score || 0) * 20;
        if (cat in rhythmSums) {
          rhythmSums[cat] += score100;
          rhythmSums.counts[cat]++;
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
  console.log('💓 60s Rhythm Check Averages:', rhythmAvgs);

  // D. Smart Scanner / LifeSnap mapping (10% weight)
  const scannerSums = { 
    physical: 0, mental: 0, sleep: 0, lifestyle: 0, 
    counts: { physical: 0, mental: 0, sleep: 0, lifestyle: 0 } 
  };
  recentScans.forEach(snap => {
    const cat = snap.category;
    const score = snap.score ?? 50;
    
    if (['ACTIVITY', 'BODY', 'SKIN', 'MEDICAL_DOC'].includes(cat)) {
      scannerSums.physical += score;
      scannerSums.counts.physical++;
    } else if (cat === 'SLEEP') {
      scannerSums.sleep += score;
      scannerSums.counts.sleep++;
    } else if (['MEAL', 'HYDRATION', 'ROUTINE'].includes(cat)) {
      scannerSums.lifestyle += score;
      scannerSums.counts.lifestyle++;
    }
    
    scannerSums.mental += score;
    scannerSums.counts.mental++;
  });

  const scannerAvgs = {
    physical: scannerSums.counts.physical > 0 ? scannerSums.physical / scannerSums.counts.physical : null,
    mental: scannerSums.counts.mental > 0 ? scannerSums.mental / scannerSums.counts.mental : null,
    sleep: scannerSums.counts.sleep > 0 ? scannerSums.sleep / scannerSums.counts.sleep : null,
    lifestyle: scannerSums.counts.lifestyle > 0 ? scannerSums.lifestyle / scannerSums.counts.lifestyle : null,
  };
  console.log('📸 Scanner (LifeSnap) Averages:', scannerAvgs);

  // E. Dynamic Scores with Normalized Weight Aggregation
  const categories = ['physical', 'mental', 'sleep', 'lifestyle'];
  const dynamicScores = { physical: 60, mental: 60, sleep: 60, lifestyle: 60 };

  categories.forEach(cat => {
    const baseVal = baseScores[cat];
    const daily16Val = daily16Avgs ? daily16Avgs[cat] : null;
    const rhythmVal = rhythmAvgs[cat];
    const scannerVal = scannerAvgs[cat];

    const sources = [
      { name: 'base', val: baseVal, weight: 0.6 },
      { name: 'daily16', val: daily16Val, weight: 0.2 },
      { name: 'rhythm', val: rhythmVal, weight: 0.1 },
      { name: 'scanner', val: scannerVal, weight: 0.1 }
    ];

    let activeWeightSum = 0;
    let activeScoreSum = 0;

    sources.forEach(src => {
      if (src.val !== null && src.val !== undefined) {
        activeScoreSum += src.val * src.weight;
        activeWeightSum += src.weight;
      }
    });

    dynamicScores[cat] = activeWeightSum > 0
      ? Math.round(activeScoreSum / activeWeightSum)
      : Math.round(baseVal);
      
    console.log(`⚖️ Category [${cat}]:`);
    console.log(`  - Sources:`, sources.map(s => `${s.name}: ${s.val} (w: ${s.weight})`));
    console.log(`  - Active weight sum: ${activeWeightSum}, active score sum: ${activeScoreSum}`);
    console.log(`  - Final Dynamic Score: ${dynamicScores[cat]} (Original Base: ${baseVal})`);
  });

  console.log('\n🏆 FINAL AGGREGATION RESULT:');
  console.log(dynamicScores);

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

verify().catch(console.error);
