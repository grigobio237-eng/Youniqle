
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local BEFORE importing db
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

async function clearVideoProjects() {
    try {
        // Dynamic import to ensure env vars are loaded first
        const { default: connectDB } = await import('../src/lib/db');
        const { default: VideoProject } = await import('../src/models/VideoProject');

        console.log('Connecting to database...');
        await connectDB();
        console.log('Connected to database.');

        console.log('Clearing VideoProject collection...');
        const result = await VideoProject.deleteMany({});
        console.log(`Deleted ${result.deletedCount} projects.`);

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing video projects:', error);
        process.exit(1);
    }
}

clearVideoProjects();
