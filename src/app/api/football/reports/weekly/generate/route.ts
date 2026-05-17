import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import FootballTeamMember from '@/models/FootballTeamMember';
import WellnessCheck from '@/models/WellnessCheck';
import FootballWeeklyReport from '@/models/FootballWeeklyReport';
import { calculateACWR } from '@/lib/football/acwr';
import { getKSTDateString } from '@/lib/football/acwr';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        
        // 관리자 또는 코치만 호출 가능하다고 가정
        // if (!session?.user) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const body = await request.json();
        const { targetUserId, teamId } = body;

        if (!targetUserId && !teamId) {
            return NextResponse.json({ error: '대상 유저 ID 또는 팀 ID가 필요합니다.' }, { status: 400 });
        }

        // 대상 유저 목록 수집
        let usersToProcess = [];
        if (targetUserId) {
            usersToProcess.push(targetUserId);
        } else if (teamId) {
            const members = await FootballTeamMember.find({ teamId, status: 'active', role: 'player' });
            usersToProcess = members.map(m => m.userId.toString());
        }

        const now = new Date();
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6); // 최근 7일 (오늘 포함)

        const strEndDate = getKSTDateString(endDate);
        const strStartDate = getKSTDateString(startDate);

        const results = [];

        for (const uid of usersToProcess) {
            const user = await User.findById(uid);
            if (!user) continue;

            const membership = await FootballTeamMember.findOne({ userId: uid, status: 'active' });
            if (!membership) continue;

            // 이미 이번 주 리포트가 있는지 확인
            const existing = await FootballWeeklyReport.findOne({
                userId: uid,
                weekStartDate: strStartDate
            });
            if (existing) {
                results.push({ userId: uid, status: 'skipped', reason: 'Already exists' });
                continue;
            }

            // 최근 30일 데이터 수집 (ACWR 계산용)
            const recentChecks = await WellnessCheck.find({
                userId: uid,
                date: { $lte: strEndDate }
            }).sort({ date: -1 }).limit(30);

            if (recentChecks.length < 3) {
                // 데이터가 너무 적으면 리포트 생성 안함
                results.push({ userId: uid, status: 'skipped', reason: 'Not enough data' });
                continue;
            }

            const loads = recentChecks.map(c => ({
                date: c.date,
                sessionLoad: c.sessionLoad || (c.wellnessScore * 10)
            }));

            // 이번 주 데이터만 추출
            const thisWeekChecks = recentChecks.filter(c => c.date >= strStartDate && c.date <= strEndDate);
            
            if (thisWeekChecks.length === 0) {
                results.push({ userId: uid, status: 'skipped', reason: 'No data this week' });
                continue;
            }

            const avgWellness = thisWeekChecks.reduce((sum, c) => sum + c.wellnessScore, 0) / thisWeekChecks.length;
            
            const acwrData = calculateACWR(loads);
            
            // 일자별 트렌드 텍스트화 (AI용)
            const summaryData = thisWeekChecks.map(c => 
                `[${c.date}] 컨디션:${c.wellnessScore}/5, 수면:${c.sleep}/5, 근육통:${c.soreness}/5`
            ).join('\n');

            // AI 리포트 생성
            const prompt = `
            당신은 유소년 축구팀 전문 스포츠 사이언티스트이자 코치입니다.
            선수명: ${user.name}
            분석 기간: ${strStartDate} ~ ${strEndDate}
            이번 주 평균 컨디션: ${avgWellness.toFixed(1)}/5.0
            현재 ACWR(부상위험도) 수치: ${acwrData.acwr} (상태: ${acwrData.zoneLabel})
            
            일자별 상세 기록:
            ${summaryData}

            이 데이터를 바탕으로 다음 형식에 맞춰 JSON으로 응답해주세요:
            {
                "aiSummary": "선수의 이번 주 회복 및 훈련 상태에 대한 종합 평가 (3-4문장)",
                "aiRecommendations": [
                    "구체적인 다음 주 훈련 강도 조절 제안 (1문장)",
                    "영양 또는 수면 관련 회복 팁 (1문장)",
                    "부상 예방을 위한 특별 권고사항 (1문장)"
                ]
            }
            `;

            try {
                const aiResultText = await GeminiAIEngine.generateWithFallback([{ text: prompt }]);
                let cleanedText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResponse = JSON.parse(cleanedText);

                await FootballWeeklyReport.create({
                    userId: uid,
                    teamId: membership.teamId,
                    weekStartDate: strStartDate,
                    weekEndDate: strEndDate,
                    averageWellnessScore: parseFloat(avgWellness.toFixed(1)),
                    highestAcwr: acwrData.acwr, // 단순화하여 현재 ACWR 사용
                    lowestAcwr: acwrData.acwr,
                    aiSummary: aiResponse.aiSummary,
                    aiRecommendations: aiResponse.aiRecommendations
                });

                results.push({ userId: uid, status: 'success' });
            } catch (aiError) {
                console.error(`AI Report generation failed for ${uid}:`, aiError);
                results.push({ userId: uid, status: 'failed', reason: 'AI Error' });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error('Weekly Report Generation Error:', error);
        return NextResponse.json(
            { error: '리포트 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
