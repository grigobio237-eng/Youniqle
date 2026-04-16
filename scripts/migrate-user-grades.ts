import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Define temporary schemas to avoid model compilation errors
    const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
    const PointTransactionSchema = new mongoose.Schema({}, { strict: false, collection: 'pointtransactions' });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const PointTransaction = mongoose.models.PointTransaction || mongoose.model('PointTransaction', PointTransactionSchema);

    // 1. Migrate User Grades
    console.log('⏳ Migrating User grades...');
    
    const essenceUpdate = await User.updateMany({ grade: 'essence' }, { $set: { grade: 'start' } });
    console.log(`- essence -> start: ${essenceUpdate.modifiedCount} users updated`);

    const balanceUpdate = await User.updateMany({ grade: 'balance' }, { $set: { grade: 'signature' } });
    console.log(`- balance -> signature: ${balanceUpdate.modifiedCount} users updated`);

    const miracleUpdate = await User.updateMany({ grade: 'miracle' }, { $set: { grade: 'black' } });
    console.log(`- miracle -> black: ${miracleUpdate.modifiedCount} users updated`);

    // 2. Update PointTransaction descriptions
    console.log('⏳ Updating PointTransaction descriptions...');
    
    // 구매 적립 (essence, balance, miracle -> start, signature, black)
    // 추천보상1단계 (essence, balance, miracle) -> start, signature, black
    
    const txMappings = [
      { old: 'ESSENCE', new: 'START' },
      { old: 'BALANCE', new: 'SIGNATURE' },
      { old: 'MIRACLE', new: 'BLACK' },
      { old: 'essence', new: 'start' },
      { old: 'balance', new: 'signature' },
      { old: 'miracle', new: 'black' }
    ];

    for (const mapping of txMappings) {
      const txUpdate = await PointTransaction.updateMany(
        { description: { $regex: mapping.old, $options: 'i' } },
        [
          {
            $set: {
              description: {
                $replaceOne: {
                  input: '$description',
                  find: mapping.old,
                  replacement: mapping.new
                }
              }
            }
          }
        ]
      );
      console.log(`- Updated description "${mapping.old}" -> "${mapping.new}": ${txUpdate.modifiedCount} transactions`);
    }

    console.log('🚀 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
