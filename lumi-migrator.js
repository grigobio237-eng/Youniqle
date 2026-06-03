const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['src/app', 'src/components'];

const REPLACEMENTS = [
    // Backgrounds
    { regex: /bg-blue-[567]00/g, replacement: 'bg-primary' },
    { regex: /bg-amber-[567]00/g, replacement: 'bg-primary' },
    { regex: /bg-indigo-[567]00/g, replacement: 'bg-secondary' },
    { regex: /bg-purple-[567]00/g, replacement: 'bg-secondary' },
    { regex: /bg-emerald-[567]00/g, replacement: 'bg-secondary' },
    
    // Light Backgrounds
    { regex: /bg-blue-[51]00/g, replacement: 'bg-primary-container' },
    { regex: /bg-amber-[51]00/g, replacement: 'bg-primary-container/50' },
    { regex: /bg-indigo-[51]00/g, replacement: 'bg-secondary-container' },
    { regex: /bg-purple-[51]00/g, replacement: 'bg-secondary-container' },
    { regex: /bg-emerald-[51]00/g, replacement: 'bg-secondary-container' },
    { regex: /bg-slate-50/g, replacement: 'bg-surface' },
    { regex: /bg-gray-50/g, replacement: 'bg-surface' },

    // Texts
    { regex: /text-blue-[567]00/g, replacement: 'text-primary' },
    { regex: /text-amber-[567]00/g, replacement: 'text-primary' },
    { regex: /text-indigo-[567]00/g, replacement: 'text-secondary' },
    { regex: /text-purple-[567]00/g, replacement: 'text-secondary' },
    { regex: /text-emerald-[567]00/g, replacement: 'text-secondary' },
    { regex: /text-slate-[6789]00/g, replacement: 'text-obsidian' },
    { regex: /text-gray-[6789]00/g, replacement: 'text-obsidian' },
    { regex: /text-slate-[45]00/g, replacement: 'text-foreground\/70' },
    { regex: /text-gray-[45]00/g, replacement: 'text-foreground\/70' },

    // Borders
    { regex: /border-blue-[2345]00/g, replacement: 'border-primary\/30' },
    { regex: /border-amber-[2345]00/g, replacement: 'border-primary\/30' },
    { regex: /border-indigo-[2345]00/g, replacement: 'border-secondary\/30' },
    { regex: /border-slate-[12]00/g, replacement: 'border-line' },
    { regex: /border-gray-[12]00/g, replacement: 'border-line' },

    // Rings / Shadows
    { regex: /ring-blue-[456]00/g, replacement: 'ring-primary' },
    { regex: /ring-amber-[456]00/g, replacement: 'ring-primary' },
    { regex: /shadow-blue-[12]00/g, replacement: 'shadow-primary\/20' },
    { regex: /shadow-amber-[12]00/g, replacement: 'shadow-primary\/20' }
];

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedFiles = 0;

DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
        walkDir(dir, function(filePath) {
            if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content;

                REPLACEMENTS.forEach(rule => {
                    newContent = newContent.replace(rule.regex, rule.replacement);
                });

                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    modifiedFiles++;
                }
            }
        });
    }
});

console.log(`Successfully migrated ${modifiedFiles} files to LUMI theme.`);
