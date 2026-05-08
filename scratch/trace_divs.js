const fs = require('fs');
const content = fs.readFileSync('f:/youniqle/src/app/ai-navigator/page.tsx', 'utf8');
const lines = content.split('\n');

let depth = 0;
lines.forEach((line, index) => {
    const opens = (line.match(/<div\b/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    const prevDepth = depth;
    depth += opens - closes;
    if (opens > 0 || closes > 0) {
        console.log(`Line ${index + 1}: Depth ${prevDepth} -> ${depth} (${line.trim().substring(0, 50)}...)`);
    }
});
console.log(`Final Depth: ${depth}`);
