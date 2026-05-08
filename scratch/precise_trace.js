const fs = require('fs');
const content = fs.readFileSync('f:/youniqle/src/app/ai-navigator/page.tsx', 'utf8');
const lines = content.split('\n');

let d = 0;
lines.forEach((l, i) => {
    const o = (l.match(/<div\b/g) || []).length;
    const c = (l.match(/<\/div>/g) || []).length;
    d += o - c;
    if (i >= 270 && i <= 1056) {
        if (o > 0 || c > 0 || l.includes('TabsContent') || l.includes('Tabs') || l.includes('ChapterWrapper')) {
            console.log(`${i + 1}: depth=${d} | ${l.trim().substring(0, 80)}`);
        }
    }
});
