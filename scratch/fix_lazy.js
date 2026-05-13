const fs = require('fs');
let code = fs.readFileSync('src/app/ai-navigator/page.tsx', 'utf8');

const imports = `// New Components
const EnvironmentalStatus = React.lazy(() => import('@/components/navigator/EnvironmentalStatus'));
const RoutineCard = React.lazy(() => import('@/components/navigator/RoutineCard'));
const DailySmallActions = React.lazy(() => import('@/components/navigator/DailySmallActions'));
const DailyFlowTimeline = React.lazy(() => import('@/components/navigator/DailyFlowTimeline'));
const ToolkitGrid = React.lazy(() => import('@/components/navigator/ToolkitGrid'));
`;

// remove old
code = code.replace(/    \/\/ New Components\r?\n    const EnvironmentalStatus = React\.lazy\(\(\) => import\('@\/components\/navigator\/EnvironmentalStatus'\)\);\r?\n    const RoutineCard = React\.lazy\(\(\) => import\('@\/components\/navigator\/RoutineCard'\)\);\r?\n    const DailySmallActions = React\.lazy\(\(\) => import\('@\/components\/navigator\/DailySmallActions'\)\);\r?\n    const DailyFlowTimeline = React\.lazy\(\(\) => import\('@\/components\/navigator\/DailyFlowTimeline'\)\);\r?\n    const ToolkitGrid = React\.lazy\(\(\) => import\('@\/components\/navigator\/ToolkitGrid'\)\);\r?\n/g, '');

// insert new
code = code.replace('export default function AiNavigatorPage() {', imports + '\nexport default function AiNavigatorPage() {');

fs.writeFileSync('src/app/ai-navigator/page.tsx', code);
console.log('Fixed page.tsx');
