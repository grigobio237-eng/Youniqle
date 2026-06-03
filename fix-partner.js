const fs = require('fs');
const file = 'src/app/partner/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix syntax error
content = content.replace(/import\s*\{\s*\r?\nimport Image from 'next\/image';/g, "import Image from 'next/image';\nimport { ");

// Fix Image conflict from lucide-react
// Replace `Image,` with `Image as ImageIcon,` inside lucide-react import
const lucideImportRegex = /import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"];/;
content = content.replace(lucideImportRegex, (match, imports) => {
    return match.replace(/\bImage\b/, 'Image as ImageIcon');
});

// Fix <Image className... usage for the lucide-react icon
// The lucide icon is used as `<Image className="h-5 w-5" />` in the branding tab
content = content.replace(/<Image className="h-5 w-5" \/>/g, '<ImageIcon className="h-5 w-5" />');
content = content.replace(/icon: Image\s*\}/g, 'icon: ImageIcon }');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed partner settings page');
