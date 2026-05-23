import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found');
  process.exit(1);
}

// Import exact models used by the app
import User from '../src/models/User';
import DailyQuestion from '../src/models/DailyQuestion';
import Diagnosis from '../src/models/Diagnosis';
import Recommendation from '../src/models/Recommendation';
import RecoveryScore from '../src/models/RecoveryScore';
import RecoveryReport from '../src/models/RecoveryReport';

async function main() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB successfully via original models.');

    // 1. List all users first with correct Mongoose mapping
    const allUsers = await User.find({}).lean();
    console.log(`💡 Total Users count in database: ${allUsers.length}`);
    allUsers.forEach((u: any, i: number) => {
      console.log(`  [${i+1}] ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });
    console.log();

    // 2. Query target users
    const emails = ['grigobio237@gmail.com', 'sin93101190@gmail.com'];
    for (const email of emails) {
      const users = await User.find({ email: new RegExp(email, 'i') }).lean() as any[];
      console.log(`==================================================`);
      console.log(`🟢 [EMAIL: ${email}] - Found ${users.length} user documents`);
      console.log(`==================================================`);
      
      for (const user of users) {
        console.log(`👉 USER DETAIL:`);
        console.log(`  - _id: ${user._id}`);
        console.log(`  - name: ${user.name}`);
        console.log(`  - email: ${user.email}`);
        console.log(`  - role: ${user.role}`);
        console.log(`  - grade: ${user.grade}`);
        console.log(`  - tier: ${user.tier}`);
        console.log(`  - passInfo: ${JSON.stringify(user.passInfo)}`);
        console.log(`  - diagnosisResults Count: ${user.diagnosisResults?.length || 0}`);
        if (user.diagnosisResults && user.diagnosisResults.length > 0) {
          console.log(`    diagnosisResults: ${JSON.stringify(user.diagnosisResults.map((r: any) => ({ type: r.type, totalScore: r.totalScore, createdAt: r.createdAt })))}`);
        }
        console.log(`  - scanTimeline Count: ${user.scanTimeline?.length || 0}`);
        console.log();

        const userId = user._id;

        // 3. Find Diagnosis
        const diagnoses = await Diagnosis.find({ userId }).lean() as any[];
        console.log(`  🔎 [DIAGNOSIS RECORDS] - Count: ${diagnoses.length}`);
        diagnoses.forEach((d, idx) => {
          console.log(`    [${idx+1}] ID: ${d._id}, Type: ${d.type}, Score: ${d.score}, TotalScore: ${d.totalScore}, CategoryScores: ${JSON.stringify(d.categoryScores)}, CreatedAt: ${d.createdAt}`);
        });

        // 4. Find DailyQuestion
        const dailyQuestions = await DailyQuestion.find({ userId }).lean() as any[];
        console.log(`  🔎 [DAILYQUESTION RECORDS] - Count: ${dailyQuestions.length}`);

        // 5. Find RecoveryScore
        const recoveryScores = await RecoveryScore.find({ userId }).lean() as any[];
        console.log(`  🔎 [RECOVERY_SCORE RECORDS] - Count: ${recoveryScores.length}`);
        recoveryScores.forEach((rs, idx) => {
          console.log(`    [${idx+1}] ID: ${rs._id}, Score: ${rs.score}, TotalScore: ${rs.totalScore}, Date: ${rs.date || rs.createdAt}`);
          if (rs.answers) {
            console.log(`        Answers (${rs.answers.length} items): ${JSON.stringify(rs.answers)}`);
          }
        });

        // 6. Find RecoveryReport
        const recoveryReports = await RecoveryReport.find({ userId }).lean() as any[];
        console.log(`  🔎 [RECOVERY_REPORT RECORDS] - Count: ${recoveryReports.length}`);
        recoveryReports.forEach((rr, idx) => {
          console.log(`    [${idx+1}] ID: ${rr._id}, Score: ${rr.score}, CreatedAt: ${rr.createdAt}`);
        });
        console.log('--------------------------------------------------\n');
      }
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
