
import { connectDB } from '../src/lib/db';
import VideoProject from '../src/models/VideoProject';
import mongoose from 'mongoose';

async function fixProject() {
    await connectDB();
    const projectId = '699d3b1723e0a2f9714dac7f';

    console.log(`Fixing project ${projectId}...`);

    const project = await VideoProject.findById(projectId);
    if (!project) {
        console.error('Project not found');
        process.exit(1);
    }

    // 1. Force projectType to product_promo
    project.projectType = 'product_promo';

    // 2. Fix initial assets scene mapping
    if (project.workflow?.data?.assets) {
        project.workflow.data.assets = project.workflow.data.assets.map((asset: any) => {
            if (asset.role === 'product') return { ...asset, sceneId: 1 };
            if (asset.role === 'model') return { ...asset, sceneId: 2 };
            return asset;
        });
        project.markModified('workflow.data.assets');
    }

    // 3. Clear existing image assets so they can be regenerated/copied correctly
    if (project.workflow?.data?.assets) {
        // Keep only initial ones or those that match our new logic? 
        // Actually, generateImage will overwrite/skip correctly now.
    }

    await project.save();
    console.log('Project fixed successfully');
    process.exit(0);
}

fixProject().catch(err => {
    console.error(err);
    process.exit(1);
});
