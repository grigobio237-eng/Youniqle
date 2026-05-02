const fs = require('fs');
const content = fs.readFileSync('f:/youniqle/src/app/ai-navigator/page.tsx', 'utf-8');
const lines = content.split('\n');

let importIdx = lines.findIndex(l => l.includes('import { DeepDiagnosisModal }'));
lines.splice(importIdx, 0, "import ClinicConsultationSection from '@/components/home/ClinicConsultationSection';");

const startIdx = lines.findIndex(l => l.includes('{/* Step 3: 유니클 추천 파트너 상품 */}'));
const endStr = '{/* Step 4: 내일의 예보 */}';
const nextStepIdx = lines.findIndex(l => l.includes(endStr));
const endIdx = nextStepIdx - 1;

const toolLines = lines.splice(startIdx, endIdx - startIdx + 1);
const toolStr = toolLines.join('\n').replace('Step 3: 유니클 추천 파트너 상품', 'Step 6: 유니클 추천 파트너 상품').replace('>03</div>', '>06</div>');

const clinicBlock = `                            {/* Step 3: 전문 회복 설계 */}
                            <div className="space-y-8 relative mb-16">
                                <div className="absolute -left-4 md:-left-20 -top-4 text-5xl md:text-[140px] font-black text-obsidian/[0.02] md:text-obsidian/[0.03] leading-none select-none pointer-events-none z-0">03</div>
                                <div className="relative z-10 -mx-6 md:-mx-12">
                                    <ClinicConsultationSection />
                                </div>
                            </div>
`;

lines.splice(startIdx, 0, ...clinicBlock.split('\n'));

// Find end of Step 5 block
const insertIdx = lines.findIndex(l => l.includes('<QuickInquirySection reportId="AI_NAVIGATOR_DASHBOARD" />')) + 2;

lines.splice(insertIdx, 0, '\n' + toolStr + '\n');

fs.writeFileSync('f:/youniqle/src/app/ai-navigator/page.tsx', lines.join('\n'));
console.log('Done');
