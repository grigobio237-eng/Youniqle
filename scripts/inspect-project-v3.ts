
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

async function inspectProject() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const projectId = '699eb8acd04cfe0d3bd0684f';
        const project = await VideoProject.findById(projectId);

        if (!project) {
            console.log('Project not found');
            return;
        }

        console.log('Project Topic:', project.topic);
        console.log('Project Type:', project.projectType);
        console.log('Assets Data:', JSON.stringify(project.workflow?.data?.assets, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectProject();
