import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import mongoose from 'mongoose';
import connectDB from '../src/lib/db';
import User from '../src/models/User';
import Diagnosis from '../src/models/Diagnosis';

async function checkData() {
    await connectDB();
    const users = await User.find({ "diagnosisResults.0": { $exists: true } });
    
    if (users.length === 0) {
        console.log('No users with diagnosis results found');
        process.exit(0);
    }

    users.forEach(user => {
        console.log(`\nUser: ${user.email} (${user._id})`);
        console.log('--- User diagnosisResults ---');
        user.diagnosisResults.forEach((r: any) => {
            console.log(`Type: ${r.type}, CreatedAt: ${r.createdAt}, Score: ${r.totalScore}`);
        });
    });

    console.log('\n--- Diagnosis Collection ---');
    const diagnoses = await Diagnosis.find({ userId: user._id });
    diagnoses.forEach((d: any) => {
        console.log(`Type: ${d.type}, CreatedAt: ${d.createdAt}`);
    });

    process.exit(0);
}

checkData();
