const fs = require('fs');
const content = fs.readFileSync('f:/youniqle/src/app/ai-navigator/page.tsx', 'utf8');

function countTags(tagName) {
    const openRegex = new RegExp(`<${tagName}\\b`, 'g');
    const closeRegex = new RegExp(`</${tagName}>`, 'g');
    const openCount = (content.match(openRegex) || []).length;
    const closeCount = (content.match(closeRegex) || []).length;
    return { tagName, openCount, closeCount };
}

const tags = ['div', 'Tabs', 'TabsContent', 'Card', 'CardContent', 'ChapterWrapper', 'section', 'header', 'main'];
const results = tags.map(countTags);
console.log(JSON.stringify(results, null, 2));

// Also check for specific suspicious area
const lines = content.split('\n');
for (let i = 640; i < 660; i++) {
    console.log(`${i + 1}: ${JSON.stringify(lines[i])}`);
}
