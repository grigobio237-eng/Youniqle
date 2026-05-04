import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkNotices() {
  const { connectDB } = await import('./src/lib/db');
  const Notice = (await import('./src/models/Notice')).default;
  
  await connectDB();
  const now = new Date();
  console.log('Current Time:', now);

  const allNotices = await Notice.find({ status: 'published' }).sort({ createdAt: -1 });
  console.log('All Published Notices:', allNotices.length);

  allNotices.forEach(n => {
    // @ts-ignore
    const isVisible = (!n.startDate || n.startDate <= now) && (!n.endDate || n.endDate >= now);
    console.log(`- Title: ${n.title}`);
    // @ts-ignore
    console.log(`  isPinned: ${n.isPinned}`);
    // @ts-ignore
    console.log(`  startDate: ${n.startDate}`);
    // @ts-ignore
    console.log(`  endDate: ${n.endDate}`);
    console.log(`  isVisible (Logic): ${isVisible}`);
  });

  process.exit(0);
}

checkNotices().catch(err => {
  console.error(err);
  process.exit(1);
});
