
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const VideoProjectSchema = new mongoose.Schema({
    workflow: mongoose.Schema.Types.Mixed,
    topic: String,
    projectType: String,
    createdAt: Date
});

const VideoProject = mongoose.models.VideoProject || mongoose.model('VideoProject', VideoProjectSchema);

async function dumpLatestProject() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);

        const newest = await VideoProject.findOne().sort({ createdAt: -1 });
        if (newest) {
            fs.writeFileSync('latest_project_dump.json', JSON.stringify(newest, null, 2));
            console.log('Dumped project:', newest._id);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

dumpLatestProject();
