import re

with open('scratch/old_page.tsx', 'r', encoding='utf-16') as f:
    content = f.read()

# 1. 'clinic' 탭 시작 위치 찾기
clinic_start = content.find('<TabsContent value="clinic"')
personal_end = content.rfind('</TabsContent>', 0, clinic_start)

# 2. 이동할 블록 추출
block_start = content.find('<div className="space-y-20 mt-20 pt-10 border-t border-line/50">', clinic_start)
forecast_idx = content.find('{/* Forecast Modal */}')
block_end = content.rfind('</div>', block_start, forecast_idx)
block_end = content.rfind('</div>', block_start, block_end)
extracted_block = content[block_start:block_end]

# 3. 삭제 & 삽입
content = content[:block_start] + content[block_end:]
content = content[:personal_end] + extracted_block + '\n' + content[personal_end:]

# 4. timelineData 로직 교체
old_timeline_logic = """            let latestScore = 0;
            if (timelineRes.ok) {
                const timelineData = await timelineRes.json();
                setTimelineItems(timelineData.timeline || []);
                if (timelineData.timeline?.length > 0) {
                    latestScore = timelineData.timeline[0].score || 0;
                }
            }

            if (statusRes.ok) {
                const statusData = await statusRes.json();
                setAssetStats(statusData.assetStats);
            }

            // localStorage에서 점수 불러오기 (백업용)
            const scoreVal = latestScore || (localStorage.getItem('recovery_last_score') ? parseInt(localStorage.getItem('recovery_last_score')!) : 40);
            setTodayScore(scoreVal);

            // 목데이터 히스토리 + 실제 오늘 데이터 조합
            const mockHistory = [
                { date: '12/09', score: 65 },
                { date: '12/10', score: 70 },
                { date: '12/11', score: 60 },
                { date: '12/12', score: 75 },
                { date: '12/13', score: 55 },
                { date: '12/14', score: 45 },
                { date: '오늘', score: scoreVal }
            ];
            setScoreHistory(mockHistory);"""

new_timeline_logic = """            let latestScore = 0;
            let timelineData: any = { timeline: [] };
            if (timelineRes.ok) {
                timelineData = await timelineRes.json();
                setTimelineItems(timelineData.timeline || []);
                if (timelineData.timeline?.length > 0) {
                    latestScore = timelineData.timeline[0].score || 0;
                }
            }

            if (statusRes.ok) {
                const statusData = await statusRes.json();
                setAssetStats(statusData.assetStats);
            }

            // localStorage에서 점수 불러오기 (백업용)
            const scoreVal = latestScore || (localStorage.getItem('recovery_last_score') ? parseInt(localStorage.getItem('recovery_last_score')!) : 40);
            setTodayScore(scoreVal);

            // DB 타임라인 데이터를 7일 그래프용으로 변환 (최근 7일 빈 날짜는 보간됨)
            const today = new Date();
            const last7Days = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(today.getDate() - (6 - i));
                return {
                    date: d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                    fullDate: d.toISOString().split('T')[0]
                };
            });

            const timelineMap = (timelineData.timeline || []).reduce((acc: any, item: any) => {
                const d = new Date(item.createdAt);
                const dateKey = d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                if (!acc[dateKey] || item.score > acc[dateKey]) {
                    acc[dateKey] = item.score; // 같은 날짜면 가장 높은 점수 유지
                }
                return acc;
            }, {});

            const dynamicHistory = last7Days.map(d => ({
                date: d.date === today.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) ? '오늘' : d.date,
                score: timelineMap[d.date] || null // 데이터가 없으면 null 반환하여 곡선 보간(connectNulls) 활용
            }));
            
            // 오늘 데이터가 null이면 현재 scoreVal를 넣어줌 (최소한의 연결점)
            if (dynamicHistory[6].score === null) {
                 dynamicHistory[6].score = scoreVal;
            }

            setScoreHistory(dynamicHistory);"""

content = content.replace(old_timeline_logic, new_timeline_logic)

# 5. LineChart -> AreaChart 교체
old_chart = """                                        {isMounted && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={scoreHistory} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                                    <XAxis 
                                                        dataKey="date" 
                                                        hide 
                                                    />
                                                    <Tooltip 
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="flex flex-col items-center">
                                                                        {/* Carbon Tooltip */}
                                                                        <div className="bg-[#1A1D21] px-4 py-2 rounded-xl shadow-2xl relative mb-2">
                                                                            <p className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                                                                {payload[0].payload.date} score : {payload[0].value}
                                                                            </p>
                                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1D21] rotate-45"></div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="score" 
                                                        stroke="#0E3A3A" 
                                                        strokeWidth={4} 
                                                        dot={false}
                                                        activeDot={{ r: 6, fill: '#0E3A3A', stroke: '#FFFDF9', strokeWidth: 3 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}"""

new_chart = """                                        {isMounted && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={scoreHistory} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                                    <defs>
                                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#0E3A3A" stopOpacity={0.6}/>
                                                            <stop offset="95%" stopColor="#0E3A3A" stopOpacity={0.05}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis 
                                                        dataKey="date" 
                                                        hide 
                                                    />
                                                    <Tooltip 
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length && payload[0].value !== null) {
                                                                return (
                                                                    <div className="flex flex-col items-center">
                                                                        {/* Carbon Tooltip */}
                                                                        <div className="bg-[#1A1D21] px-4 py-2 rounded-xl shadow-2xl relative mb-2">
                                                                            <p className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                                                                {payload[0].payload.date} score : {payload[0].value}
                                                                            </p>
                                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1D21] rotate-45"></div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="score" 
                                                        stroke="#0E3A3A" 
                                                        strokeWidth={4} 
                                                        fillOpacity={1} 
                                                        fill="url(#lineGradient)" 
                                                        connectNulls={true}
                                                        isAnimationActive={true}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}"""

content = content.replace(old_chart, new_chart)

with open('src/app/ai-navigator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('All Operations Complete')
