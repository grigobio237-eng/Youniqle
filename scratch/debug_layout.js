const fs = require('fs');
const content = fs.readFileSync('f:/youniqle/src/app/ai-navigator/page.tsx', 'utf8');
const lines = content.split('\n');

const tagsToFind = [
    { open: '<Tabs', close: '</Tabs>' },
    { open: '<ChapterWrapper', close: '</ChapterWrapper>' },
    { open: '<TabsContent', close: '</TabsContent>' }
];

tagsToFind.forEach(tag => {
    console.log(`--- Searching for ${tag.open} / ${tag.close} ---`);
    lines.forEach((line, index) => {
        if (line.includes(tag.open)) console.log(`OPEN: Line ${index + 1}: ${line.trim()}`);
        if (line.includes(tag.close)) console.log(`CLOSE: Line ${index + 1}: ${line.trim()}`);
    });
});

// Count total div open/close with positions for debugging
let divDepth = 0;
lines.forEach((line, index) => {
    const opens = (line.match(/<div\b/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    if (opens > 0 || closes > 0) {
        divDepth += opens - closes;
        // Only log if it's suspicious or at the end
        if (index > 1000) {
            console.log(`Line ${index + 1}: Opens: ${opens}, Closes: ${closes}, Current Depth: ${divDepth}`);
        }
    }
});
console.log(`Final div depth: ${divDepth}`);
