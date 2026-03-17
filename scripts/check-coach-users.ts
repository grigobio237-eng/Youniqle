
import { connectDB } from '../src/lib/db';
import User from '../src/models/User';
import mongoose from 'mongoose';

async function checkCoachUsers() {
    try {
        await connectDB();
        console.log('--- Checking Coach Users ---');
        const coaches = await User.find({ role: 'coach' }).lean();
        console.log(`Found ${coaches.length} coach users.`);
        coaches.forEach((u, idx) => {
            console.log(`${idx + 1}. ${u.name} (Email: ${u.email})`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCoachUsers();
