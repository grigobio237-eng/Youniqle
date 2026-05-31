import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    email: String,
    journey: String,
    medicalCategory: String,
    treatmentType: String
}, { collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected!');

        const email = 'grigobio237@gmail.com';
        
        // Update both duplicated accounts to normal WELLNESS to ensure complete cleanup
        const result = await User.updateMany(
            { email: new RegExp(email, 'i') },
            { 
                $set: { 
                    journey: 'WELLNESS',
                    medicalCategory: null,
                    treatmentType: null 
                } 
            }
        );

        console.log(`\n✅ Successfully updated ${result.modifiedCount} user documents for ${email}`);
        console.log(`- journey has been reset to: 'WELLNESS'`);
        console.log(`- medicalCategory and treatmentType have been cleared (null)`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    }
}

run();
