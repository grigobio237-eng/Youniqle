const fs = require('fs');
let content = fs.readFileSync('f:/youniqle/src/app/ai-navigator/page.tsx', 'utf8');

const replacements = [
    { from: '<div></div>', to: '<div className="absolute inset-4 bg-gradient-to-br from-[#E5D5B7]/20 to-transparent backdrop-blur-md rounded-full border border-[#E5D5B7]/30 shadow-inner"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1D21] rotate-45"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#E5D5B7]/50"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/30 transition-all duration-700"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="absolute inset-0 border-2 border-primary/20 rounded-[32px] md:rounded-[40px] animate-pulse"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="h-1 w-full bg-primary/30"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent mix-blend-overlay"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="aspect-square bg-mist rounded-xl mb-3"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="h-4 w-3/4 bg-mist rounded mb-2"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="h-5 w-1/2 bg-mist rounded"></div>', count: 1 },
    { from: '<div></div>', to: '<div className="h-full bg-primary transition-all duration-1000 ease-out energy-bar"></div>', count: 1 }
];

replacements.forEach(r => {
    let index = content.indexOf(r.from);
    if (index !== -1) {
        content = content.substring(0, index) + r.to + content.substring(index + r.from.length);
    }
});

fs.writeFileSync('f:/youniqle/src/app/ai-navigator/page.tsx', content);
console.log("Attributes restored.");
