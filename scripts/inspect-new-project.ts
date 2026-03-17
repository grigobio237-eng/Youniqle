
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { connectDB } from '../src/lib/db';
import VideoProject from '../src/models/VideoProject';

async function checkProjectData() {
    const projectId = "699eb23fd04cf0d3bd066d5"; // 사장님의 새로운 프로젝트 ID
    await connectDB();
    const project = await VideoProject.findById(projectId);

    if (!project) {
        console.error("Project not found!");
        return;
    }

    console.log("Project Title:", project.title);
    const assets = project.workflow?.data?.assets || [];
    console.log("Assets count:", assets.length);

    assets.forEach((a: any, i: number) => {
        console.log(`Asset ${i}: role=${a.role}, type=${a.type}, path=${a.path}, sceneId=${a.sceneId}`);
    });
}

checkProjectData();
