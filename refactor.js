const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 대상 폴더들
const TARGET_DIRS = ['app', 'components', 'lib', 'models', 'hooks', 'contexts', 'utils', 'scripts'];

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

let importFixCount = 0;
let imageFixCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Import 경로 표준화 (../../components -> @/components)
    // Matches: from '../../components/X', import '../../lib/Y'
    const importRegex = /(from|import)\s+['"](\.\.\/)+(components|lib|models|hooks|contexts|utils|app|data|types)(.*?)['"]/g;
    content = content.replace(importRegex, (match, p1, p2, folder, rest) => {
        importFixCount++;
        return `${p1} '@/${folder}${rest}'`;
    });

    // 2. <img> 태그를 <Image> 로 변환
    // <img src={...} alt="..." className="..." />
    // We will replace `<img ` with `<Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} `
    if (content.includes('<img ') || content.includes('<img\n') || content.includes('<img\r')) {
        const imgRegex = /<img\s/g;
        
        // Check if next/image is already imported
        const hasNextImageImport = content.includes("from 'next/image'") || content.includes('from "next/image"');
        
        if (!hasNextImageImport) {
            // Find the last import statement to insert after
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLastImport = content.indexOf('\n', lastImportIndex);
                content = content.slice(0, endOfLastImport) + "\nimport Image from 'next/image';" + content.slice(endOfLastImport);
            } else {
                content = "import Image from 'next/image';\n" + content;
            }
        }

        content = content.replace(imgRegex, () => {
            imageFixCount++;
            return `<Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized `;
        });

        // Some img tags might have closing </img>, change to </Image>
        content = content.replace(/<\/img>/g, '</Image>');
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
});

console.log(`\nRefactoring Complete!`);
console.log(`- Fixed Relative Imports: ${importFixCount}`);
console.log(`- Fixed <img> Tags: ${imageFixCount}`);
