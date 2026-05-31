import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

import User from '../src/models/User';
import LifeSnap from '../src/models/LifeSnap';

async function main() {
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected to DB');

  const user = await User.findOne({ email: 'grigobio237@gmail.com' });
  if (!user) {
    console.log('User not found');
    process.exit(0);
  }

  console.log('User ID:', user._id);
  console.log('scanTimeline count:', user.scanTimeline?.length);
  if (user.scanTimeline) {
    user.scanTimeline.forEach((s: any, idx: number) => {
      console.log(`Timeline [${idx}] - Type: ${s.type || s.category}, Score: ${s.score}, CreatedAt: ${s.createdAt}`);
    });
  }

  const snaps = await LifeSnap.find({ userId: user._id });
  console.log('LifeSnap count:', snaps.length);
  snaps.forEach((s: any, idx: number) => {
    console.log(`LifeSnap [${idx}] - Category: ${s.category}, Score: ${s.score}, CreatedAt: ${s.createdAt}`);
  });

  process.exit(0);
}

main();
