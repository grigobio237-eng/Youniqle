const fs = require('fs');
const path = require('path');

function replaceInFile(file, search, replace) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(search)) {
        content = content.replaceAll(search, replace);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
}

replaceInFile('src/lib/logic/ipip60-engine.ts', "@/data", "@/lib/data");
replaceInFile('src/lib/logic/simcheung-diagnosis.ts', "@/data", "@/lib/data");

replaceInFile('src/lib/ai/services/content-service.ts', "@/types", "@/lib/ai/types");
replaceInFile('src/lib/ai/services/medical-service.ts', "@/types", "@/lib/ai/types");
replaceInFile('src/lib/ai/services/routine-service.ts', "@/types", "@/lib/ai/types");

const videoWorkflowFiles = [
    'src/lib/video-workflow/nodes/AssetGenNode.ts',
    'src/lib/video-workflow/nodes/ScriptingNode.ts',
    'src/lib/video-workflow/nodes/SynthesisNode.ts',
    'src/lib/video-workflow/nodes/TrendAnalysisNode.ts',
    'src/lib/video-workflow/nodes/VideoGenNode.ts',
    'src/lib/video-workflow/strategies/ScriptStrategies.ts',
    'src/lib/video-workflow/strategies/TrendStrategies.ts',
    'src/lib/video-workflow/templates/index.ts'
];
for (const file of videoWorkflowFiles) {
    replaceInFile(file, "@/types", "@/lib/video-workflow/types");
}
