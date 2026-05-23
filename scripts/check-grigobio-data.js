const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found');
  process.exit(1);
}

// User Schema & Model
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

// DailyQuestion Model
const DailyQuestionSchema = new mongoose.Schema({}, { strict: false });
const DailyQuestion = mongoose.models.DailyQuestion || mongoose.model('DailyQuestion', DailyQuestionSchema, 'dailyquestions');

// Diagnosis Model
const DiagnosisSchema = new mongoose.Schema({}, { strict: false });
const Diagnosis = mongoose.models.Diagnosis || mongoose.model('Diagnosis', DiagnosisSchema, 'diagnoses');

// Recommendation Model
const RecommendationSchema = new mongoose.Schema({}, { strict: false });
const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema, 'recommendations');

// RecoveryScore Model
const RecoveryScoreSchema = new mongoose.Schema({}, { strict: false });
const RecoveryScore = mongoose.models.RecoveryScore || mongoose.model('RecoveryScore', RecoveryScoreSchema, 'recoveryscores');

// RecoveryReport Model
const RecoveryReportSchema = new mongoose.Schema({}, { strict: false });
const RecoveryReport = mongoose.models.RecoveryReport || mongoose.model('RecoveryReport', RecoveryReportSchema, 'recoveryreports');

async function checkGrigobioData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MONGODB');

    // 1. List all users
    const allUsers = await User.find({});
    console.log(`💡 Total Users in DB: ${allUsers.length}`);
    allUsers.forEach((u, i) => {
      console.log(`  [${i+1}] ID: ${u._id}, Name: ${u.name}, Email: ${JSON.stringify(u.email)}, Role: ${u.role}`);
    });
    console.log();

    const emailPattern = /grigobio237/i;
    const user = await User.findOne({ email: emailPattern });
    if (!user) {
      console.log(`❌ User matching grigobio237 not found!`);
      process.exit(0);
    }

    console.log('==================================================');
    console.log('🟢 [USER INFORMATION]');
    console.log('==================================================');
    console.log(`- _id: ${user._id}`);
    console.log(`- name: ${user.name}`);
    console.log(`- email: ${JSON.stringify(user.email)}`);
    console.log(`- role: ${user.role}`);
    console.log(`- grade/tier: ${user.grade || user.tier || 'None'}`);
    console.log(`- createdAt: ${user.createdAt}`);
    console.log();

    const userId = user._id.toString();

    // 1. Diagnosis
    const diagnoses = await Diagnosis.find({ userId });
    console.log('==================================================');
    console.log(`🟢 [DIAGNOSIS RECORDS] - Count: ${diagnoses.length}`);
    console.log('==================================================');
    diagnoses.forEach((d, idx) => {
      console.log(`[${idx+1}] ID: ${d._id}, Score: ${d.score || d.totalScore}, Category: ${d.category || d.type}, CreatedAt: ${d.createdAt || d.updatedAt}`);
      if (d.metadata) console.log(`    Metadata: ${JSON.stringify(d.metadata)}`);
      if (d.categoryScores) console.log(`    CategoryScores: ${JSON.stringify(d.categoryScores)}`);
    });
    console.log();

    // 2. Recommendation
    const recommendations = await Recommendation.find({ userId });
    console.log('==================================================');
    console.log(`🟢 [RECOMMENDATION RECORDS] - Count: ${recommendations.length}`);
    console.log('==================================================');
    recommendations.forEach((r, idx) => {
      console.log(`[${idx+1}] ID: ${r._id}, Type: ${r.type || r.category}, Score: ${r.score || r.totalScore}, CreatedAt: ${r.createdAt}`);
      if (r.metadata) console.log(`    Metadata: ${JSON.stringify(r.metadata)}`);
    });
    console.log();

    // 3. DailyQuestion
    const dailyQuestions = await DailyQuestion.find({ userId });
    console.log('==================================================');
    console.log(`🟢 [DAILYQUESTION (RHYTHM LOG) RECORDS] - Count: ${dailyQuestions.length}`);
    console.log('==================================================');
    dailyQuestions.forEach((dq, idx) => {
      console.log(`[${idx+1}] ID: ${dq._id}, Date: ${dq.date}, Theme: ${dq.theme}, Score: ${dq.score || dq.totalScore || 'N/A'}, CreatedAt: ${dq.createdAt}`);
      if (dq.questions) {
        console.log(`    Questions (${dq.questions.length} items):`);
        dq.questions.forEach((q) => {
          console.log(`      - [${q.id || q.questionId}] ${q.text || q.question} (Answer Score: ${q.answerScore || q.score || 'N/A'})`);
        });
      }
    });
    console.log();

    // 4. RecoveryScore
    const recoveryScores = await RecoveryScore.find({ userId });
    console.log('==================================================');
    console.log(`🟢 [RECOVERY_SCORE RECORDS] - Count: ${recoveryScores.length}`);
    console.log('==================================================');
    recoveryScores.forEach((rs, idx) => {
      console.log(`[${idx+1}] ID: ${rs._id}, Score: ${rs.score}, Date: ${rs.date || rs.createdAt}`);
    });
    console.log();

    // 5. RecoveryReport
    const recoveryReports = await RecoveryReport.find({ userId });
    console.log('==================================================');
    console.log(`🟢 [RECOVERY_REPORT RECORDS] - Count: ${recoveryReports.length}`);
    console.log('==================================================');
    recoveryReports.forEach((rr, idx) => {
      console.log(`[${idx+1}] ID: ${rr._id}, Score: ${rr.score || rr.totalScore}, CreatedAt: ${rr.createdAt}`);
      if (rr.metadata) console.log(`    Metadata: ${JSON.stringify(rr.metadata)}`);
    });
    console.log();

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkGrigobioData();
