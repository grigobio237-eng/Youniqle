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

// User Schema (including journey and diagnosis history)
const UserSchema = new mongoose.Schema({
    email: String,
    name: String,
    role: String,
    journey: String,
    medicalCategory: String,
    treatmentType: String,
    tier: String,
    grade: String,
    passInfo: mongoose.Schema.Types.Mixed,
    diagnosisResults: [{
        type: { type: String },
        totalScore: Number,
        createdAt: Date
    }]
}, { collection: 'users' });

const DiagnosisSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    score: Number,
    totalScore: Number,
    categoryScores: mongoose.Schema.Types.Mixed,
    createdAt: Date
}, { collection: 'diagnoses' });

const RecoveryReportSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    score: Number,
    createdAt: Date
}, { collection: 'recoveryreports' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Diagnosis = mongoose.models.Diagnosis || mongoose.model('Diagnosis', DiagnosisSchema);

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected!');

        const email = 'grigobio237@gmail.com';
        const user = await User.findOne({ email: new RegExp(email, 'i') }).lean() as any;

        if (!user) {
            console.log(`❌ User not found for email: ${email}`);
            return;
        }

        console.log('\n==================================================');
        console.log(`🟢 USER INFO FOR: ${email}`);
        console.log('==================================================');
        console.log(`- _id: ${user._id}`);
        console.log(`- name: ${user.name}`);
        console.log(`- email: ${user.email}`);
        console.log(`- role: ${user.role}`);
        console.log(`- grade: ${user.grade}`);
        console.log(`- tier: ${user.tier}`);
        console.log(`- journey (여정 상태): ${user.journey || 'N/A'}`);
        console.log(`- medicalCategory (의료 카테고리): ${user.medicalCategory || 'N/A'}`);
        console.log(`- treatmentType (시술/수술 타입): ${user.treatmentType || 'N/A'}`);
        console.log(`- passInfo: ${JSON.stringify(user.passInfo, null, 2)}`);
        
        console.log('\n- diagnosisResults count in user doc:', user.diagnosisResults?.length || 0);
        if (user.diagnosisResults && user.diagnosisResults.length > 0) {
            console.log(JSON.stringify(user.diagnosisResults.slice(-5), null, 2));
        }

        // Diagnoses 컬렉션 조회
        const diagnoses = await Diagnosis.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean() as any[];
        console.log(`\n🔎 [DIAGNOSIS RECORDS] - Count in diagnoses collection: ${diagnoses.length}`);
        diagnoses.forEach((d, idx) => {
            console.log(`  [${idx+1}] ID: ${d._id}, Type: ${d.type}, Score: ${d.score}, TotalScore: ${d.totalScore}, CategoryScores: ${JSON.stringify(d.categoryScores)}, CreatedAt: ${d.createdAt}`);
        });

        // 최근 스캔 기록 조회
        const ScanSchema = new mongoose.Schema({}, { strict: false, collection: 'scans' });
        const Scan = mongoose.models.Scan || mongoose.model('Scan', ScanSchema);
        const scans = await Scan.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean() as any[];
        console.log(`\n📷 [RECENT SCANS] - Count: ${scans.length}`);
        scans.forEach((s, idx) => {
            console.log(`  [${idx+1}] ID: ${s._id}, Type: ${s.type || s.snapType}, Score: ${s.score || s.matchScore}, Summary: ${s.summary}, CreatedAt: ${s.createdAt}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected');
        process.exit(0);
    }
}

run();
