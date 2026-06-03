const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);

let fixCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Fix `import { \nimport Image from 'next/image';`
    content = content.replace(/import\s*\{\s*\nimport Image from 'next\/image';/g, "import Image from 'next/image';\nimport { ");
    content = content.replace(/import\s*\{\s*\r\nimport Image from 'next\/image';/g, "import Image from 'next/image';\r\nimport { ");

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed syntax error in: ${file}`);
        fixCount++;
    }
});

console.log(`Fixed ${fixCount} files.`);
