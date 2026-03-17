
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const VideoProjectSchema = new mongoose.Schema({
    workflow: mongoose.Schema.Types.Mixed,
    topic: String,
    projectType: String,
    createdAt: Date
});

const VideoProject = mongoose.models.VideoProject || mongoose.model('VideoProject', VideoProjectSchema);

async function findCorruptedProjects() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const projects = await VideoProject.find({
            $or: [
                { "workflow.data.assets.path": "product" },
                { "workflow.data.assets.path": "model" },
                { "workflow.data.assets.path": "/product" },
                { "workflow.data.assets.path": "/model" }
            ]
        });

        console.log(`Found ${projects.length} corrupted projects`);
        projects.forEach(p => {
            console.log(`ID: ${p._id}, Topic: ${p.topic}`);
            const corrupted = p.workflow?.data?.assets?.filter(a => a.path === 'product' || a.path === 'model' || a.path === '/product' || a.path === '/model');
            console.log('Corrupted Assets:', JSON.stringify(corrupted, null, 2));
        });

        // Also list the newest project just to be sure
        const newest = await VideoProject.findOne().sort({ createdAt: -1 });
        if (newest) {
            console.log('Newest Project:', newest._id, newest.topic);
            console.log('Assets:', JSON.stringify(newest.workflow?.data?.assets, null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

findCorruptedProjects();
