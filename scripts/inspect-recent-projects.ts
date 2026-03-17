
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const VideoProjectSchema = new mongoose.Schema({
    workflow: {
        data: mongoose.Schema.Types.Mixed
    },
    topic: String,
    projectType: String,
    createdAt: Date
});

const VideoProject = mongoose.models.VideoProject || mongoose.model('VideoProject', VideoProjectSchema);

async function inspectProjects() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const projects = await VideoProject.find().sort({ createdAt: -1 }).limit(5);

        if (projects.length === 0) {
            console.log('No projects found');
            return;
        }

        projects.forEach(p => {
            console.log(`ID: ${p._id}, Topic: ${p.topic}, Created: ${p.createdAt}`);
            console.log('Assets:', JSON.stringify(p.workflow?.data?.assets, null, 2));
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectProjects();
