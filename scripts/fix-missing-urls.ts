
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import VideoProject from '../src/models/VideoProject';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

const fixMissingUrls = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find completed projects without finalVideoUrl
        const projects = await VideoProject.find({
            status: 'completed',
            finalVideoUrl: { $exists: false }
        });

        console.log(`Found ${projects.length} projects to check.`);

        for (const project of projects) {
            const projectId = project._id.toString();
            const relativePath = `/output/${projectId}/final_output.mp4`;
            const absolutePath = path.join(process.cwd(), 'public', relativePath);

            if (fs.existsSync(absolutePath)) {
                console.log(`[Fix] Video found for project ${project.topic} (${projectId}). Updating DB...`);
                project.finalVideoUrl = relativePath;
                await project.save();
                console.log(' -> Fixed!');
            } else {
                console.log(`[Skip] No video file found for project ${project.topic} (${projectId})`);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixMissingUrls();
