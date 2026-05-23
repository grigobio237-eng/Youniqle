import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment!');
  process.exit(1);
}

// Import exact models used by the app
import User from '../src/models/User';
import Diagnosis from '../src/models/Diagnosis';
import RecoveryScore from '../src/models/RecoveryScore';
import RecoveryReport from '../src/models/RecoveryReport';
import SurveyResponse from '../src/models/SurveyResponse';
import PreConsultation from '../src/models/PreConsultation';
import PostCareSurvey from '../src/models/PostCareSurvey';

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected successfully.\n');

    // 1. Fetch all users
    const allUsers = await User.find({}).lean() as any[];
    console.log(`💡 Total Users in database: ${allUsers.length}`);

    // 2. Group by email (case-insensitive)
    const emailGroups: Record<string, any[]> = {};
    allUsers.forEach(u => {
      if (!u.email) return;
      const normalizedEmail = u.email.toLowerCase().trim();
      if (!emailGroups[normalizedEmail]) {
        emailGroups[normalizedEmail] = [];
      }
      emailGroups[normalizedEmail].push(u);
    });

    console.log('📋 User count per normalized email:');
    for (const [em, list] of Object.entries(emailGroups)) {
      console.log(`  - [${em}]: count=${list.length}, IDs=${list.map(x => x._id.toString()).join(', ')}`);
    }

    let totalDeleted = 0;

    // 3. Analyze each group
    for (const [email, users] of Object.entries(emailGroups)) {
      if (users.length <= 1) {
        // No duplication for this email
        continue;
      }

      console.log(`\n==================================================`);
      console.log(`🚨 DUP EMAIL DETECTED: [${email}] - Found ${users.length} accounts`);
      console.log(`==================================================`);

      const userStats: any[] = [];

      // Query statistics for each user document in the duplicate group
      for (const u of users) {
        const userId = u._id;

        const [
          diagCount,
          scoreCount,
          reportCount,
          surveyCount,
          preConsultationCount,
          postCareCount
        ] = await Promise.all([
          Diagnosis.countDocuments({ userId }),
          RecoveryScore.countDocuments({ userId }),
          RecoveryReport.countDocuments({ userId }),
          SurveyResponse.countDocuments({ userId }),
          PreConsultation.countDocuments({ userId }),
          PostCareSurvey.countDocuments({ userId })
        ]);

        const diagnosisResultsCount = u.diagnosisResults?.length || 0;
        const scanTimelineCount = u.scanTimeline?.length || 0;

        // Weight scores to determine which is the active account
        const activityScore = 
          (diagnosisResultsCount * 10) +
          (scanTimelineCount * 5) +
          (diagCount * 10) +
          (scoreCount * 2) +
          (reportCount * 15) +
          (surveyCount * 10) +
          (preConsultationCount * 10) +
          (postCareCount * 10);

        userStats.push({
          user: u,
          userId: userId.toString(),
          name: u.name || 'N/A',
          role: u.role || 'N/A',
          diagnosisResultsCount,
          scanTimelineCount,
          diagCount,
          scoreCount,
          reportCount,
          surveyCount,
          preConsultationCount,
          postCareCount,
          activityScore
        });
      }

      // Sort by activity score descending (highest activity score gets to be kept)
      userStats.sort((a, b) => b.activityScore - a.activityScore);

      const keeper = userStats[0];
      const shells = userStats.slice(1);

      console.log(`🟢 KEEPER (Active Account):`);
      console.log(`  - ID: ${keeper.userId}`);
      console.log(`  - Name: ${keeper.name}`);
      console.log(`  - Role: ${keeper.role}`);
      console.log(`  - Activity Score: ${keeper.activityScore}`);
      console.log(`  - Details: Diagnosis(${keeper.diagCount}), RecoveryScore(${keeper.scoreCount}), Reports(${keeper.surveyCount})`);

      console.log(`🔴 SHELLS TO CLEAN (Duplicate/Inactive Accounts):`);
      for (const shell of shells) {
        console.log(`  - ID: ${shell.userId}`);
        console.log(`  - Name: ${shell.name}`);
        console.log(`  - Role: ${shell.role}`);
        console.log(`  - Activity Score: ${shell.activityScore}`);
        console.log(`  - Details: Diagnosis(${shell.diagCount}), RecoveryScore(${shell.scoreCount}), Reports(${shell.surveyCount})`);
        
        // Safety check - if shell has some activity, warning
        if (shell.activityScore > 0) {
          console.log(`  ⚠️ WARNING: Shell has active record score of ${shell.activityScore}! Cleaning anyway as Keeper has more.`);
        }

        // Delete the shell user
        await User.deleteOne({ _id: shell.user._id });
        console.log(`    🗑️ Successfully deleted User document: ${shell.userId}`);
        totalDeleted++;
      }
    }

    console.log(`\n==================================================`);
    console.log(`🎉 Cleanup completed. Total shell accounts deleted: ${totalDeleted}`);
    console.log(`==================================================`);

    process.exit(0);
  } catch (e) {
    console.error('❌ Error during shell cleanup:', e);
    process.exit(1);
  }
}

main();
