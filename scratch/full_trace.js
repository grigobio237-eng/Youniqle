const fs = require('fs');
const content = fs.readFileSync('f:/youniqle/src/app/ai-navigator/page.tsx', 'utf8');
const lines = content.split('\n');

let d = 0;
lines.forEach((l, i) => {
    const o = (l.match(/<div\b/g) || []).length;
    const c = (l.match(/<\/div>/g) || []).length;
    const oldD = d;
    d += o - c;
    if (o > 0 || c > 0) {
        console.log(`${i + 1}: depth ${oldD} -> ${d} | ${l.trim().substring(0, 80)}`);
    }
});
console.log("FINAL DEPTH:", d);
