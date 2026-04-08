const fs = require('fs');
const path = 'src/app/api/questions/daily/route.ts';
let content = fs.readFileSync(path, 'utf8');

const newLogic = `
        if (!dailyQ) {
            // 3. Generate if not exists
            console.log(\`[DailyQ] Generating \${journey} questions for \${todayStr}...\`);

            const themeData = DAILY_THEMES[dayOfWeek] || DAILY_THEMES[1];

            // Call AI with journey context
            const questions = await GeminiAIEngine.generateDailyQuestions(themeData.theme, themeData.keywords, journey);

            if (!questions || questions.length === 0) {
                console.error(\`[DailyQ] Failed to generate questions for \${journey}\`);
                return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
            }

            // 4. Save to DB
            try {
                dailyQ = await DailyQuestion.create({
                    date: todayStr,
                    dayOfWeek,
                    theme: \`\${themeData.theme} (\${journey})\`,
                    questions,
                    journey: journey
                });
                console.log(\`[DailyQ] Successfully created \${journey} questions.\`);
            } catch (createError) {
                if (createError.code === 11000) {
                    console.log(\`[DailyQ] Duplicate index detected. Attempting to find existing record for \${journey}...\`);
                    dailyQ = await DailyQuestion.findOne({ date: todayStr, journey: journey });
                    
                    if (!dailyQ) {
                        console.warn(\`[DailyQ] Could not find \${journey} record despite duplicate error. Falling back to any record for this date.\`);
                        // Fallback: If we can't find the specific journey record, the index might be on 'date' only.
                        dailyQ = await DailyQuestion.findOne({ date: todayStr });
                    }
                } else {
                    console.error(\`[DailyQ] DB Creation Error:\`, createError);
                    throw createError;
                }
            }
        }

        // Final Safety Check
        if (!dailyQ) {
            console.error(\`[DailyQ] Critical: dailyQ is still null for \${todayStr} after generation attempt.\`);
            return NextResponse.json({ error: '데이터를 가져올 수 없습니다. 잠시 후 다시 시도해 주세요.' }, { status: 404 });
        }

        return NextResponse.json({
            questions: dailyQ.questions || [],
            theme: dailyQ.theme || 'Daily Recovery',
            date: dailyQ.date,
            journey: dailyQ.journey || 'WELLNESS'
        });`;

content = content.replace(/if \(!dailyQ\) \{[\s\S]*?return NextResponse\.json\(\{[\s\S]*?\}\);/g, newLogic);
fs.writeFileSync(path, content, 'utf8');
