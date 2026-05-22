const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully.");

        // 1. 유저 조회
        const email = "grigobio237@gmail.com";
        const db = mongoose.connection.db;
        const user = await db.collection('users').findOne({ email: email });

        if (!user) {
            console.log(`User not found with email: ${email}`);
            return;
        }

        console.log("\n================ [USER INFO] ================");
        console.log(`ID: ${user._id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Grade/Tier: ${user.grade}`);
        console.log(`Role: ${user.role}`);
        console.log(`scanTimeline length: ${user.scanTimeline ? user.scanTimeline.length : 0}`);

        const userId = user._id;

        // 2. 최신 RecoveryScore (60초 리듬체크) 조회
        console.log("\n================ [RECOVERY SCORES] ================");
        const scores = await db.collection('recoveryscores')
            .find({ userId: new mongoose.Types.ObjectId(userId.toString()) })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        if (scores.length === 0) {
            const stringScores = await db.collection('recoveryscores')
                .find({ userId: userId.toString() })
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray();
            console.log(`Found ${stringScores.length} scores with string userId`);
            stringScores.forEach(s => {
                console.log(`[${s.createdAt}] Score: ${s.totalScore}, Metaphor: ${s.metaphor}, ID: ${s._id}`);
                console.log("CategoryScores:", s.categoryScores);
            });
        } else {
            console.log(`Found ${scores.length} scores with ObjectId`);
            scores.forEach(s => {
                console.log(`[${s.createdAt}] Score: ${s.totalScore}, Metaphor: ${s.metaphor}, ID: ${s._id}`);
                console.log("CategoryScores:", s.categoryScores);
            });
        }

        // 3. 최신 Diagnosis (정밀 문진) 조회
        console.log("\n================ [LATEST DIAGNOSES] ================");
        const diagnoses = await db.collection('diagnoses')
            .find({ userId: new mongoose.Types.ObjectId(userId.toString()) })
            .sort({ createdAt: -1 })
            .limit(3)
            .toArray();

        if (diagnoses.length === 0) {
            const stringDiags = await db.collection('diagnoses')
                .find({ userId: userId.toString() })
                .sort({ createdAt: -1 })
                .limit(3)
                .toArray();
            console.log(`Found ${stringDiags.length} diagnoses with string userId`);
            stringDiags.forEach(d => {
                console.log(`[${d.createdAt}] CategoryScores:`, d.categoryScores);
                console.log(`Type: ${d.type}, ID: ${d._id}`);
            });
        } else {
            console.log(`Found ${diagnoses.length} diagnoses with ObjectId`);
            diagnoses.forEach(d => {
                console.log(`[${d.createdAt}] CategoryScores:`, d.categoryScores);
                console.log(`Type: ${d.type}, ID: ${d._id}`);
            });
        }

        // 4. 최신 LifeSnap (스마트 스캔) 조회
        console.log("\n================ [LATEST LIFESNAPS] ================");
        const snaps = await db.collection('lifesnaps')
            .find({ userId: new mongoose.Types.ObjectId(userId.toString()) })
            .sort({ createdAt: -1 })
            .limit(3)
            .toArray();

        if (snaps.length === 0) {
            const stringSnaps = await db.collection('lifesnaps')
                .find({ userId: userId.toString() })
                .sort({ createdAt: -1 })
                .limit(3)
                .toArray();
            console.log(`Found ${stringSnaps.length} snaps with string userId`);
            stringSnaps.forEach(s => {
                console.log(`[${s.createdAt}] Category: ${s.category}, Score: ${s.score}, Summary: ${s.summary}`);
            });
        } else {
            console.log(`Found ${snaps.length} snaps with ObjectId`);
            snaps.forEach(s => {
                console.log(`[${s.createdAt}] Category: ${s.category}, Score: ${s.score}, Summary: ${s.summary}`);
            });
        }

    } catch (err) {
        console.error("Error in main:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

main();
