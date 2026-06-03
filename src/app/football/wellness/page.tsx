'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Moon, Zap, Heart, Brain, Smile, Dumbbell, Timer, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const WELLNESS_ITEMS = [
  { key: 'sleep', label: '수면의 질', icon: Moon, desc: '어젯밤 수면은 어땠나요?', labels: ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'] },
  { key: 'soreness', label: '근육 통증', icon: Zap, desc: '현재 근육 통증은?', labels: ['매우 아픔', '아픔', '보통', '거의 없음', '전혀 없음'] },
  { key: 'fatigue', label: '피로도', icon: Heart, desc: '피로감은 어느 정도인가요?', labels: ['극도 피로', '피로함', '보통', '활력적', '매우 활력'] },
  { key: 'stress', label: '스트레스', icon: Brain, desc: '스트레스 수준은?', labels: ['매우 높음', '높음', '보통', '낮음', '매우 낮음'] },
  { key: 'mood', label: '기분', icon: Smile, desc: '현재 기분 상태는?', labels: ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'] },
];

const SESSION_TYPES = [
  { value: 'training', label: '훈련', emoji: '🏃' },
  { value: 'match', label: '경기', emoji: '⚽' },
  { value: 'rest', label: '휴식', emoji: '😴' },
];

export default function WellnessCheckPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [values, setValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [sleepDuration, setSleepDuration] = useState<number | null>(null);
  const [customSleepDuration, setCustomSleepDuration] = useState<string>('');
  const [isCustomSleep, setIsCustomSleep] = useState<boolean>(false);
  const [rpe, setRpe] = useState<number | null>(null);
  const [sessionType, setSessionType] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState('');
  const [injuryNote, setInjuryNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [todayCheck, setTodayCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchTodayCheck();
  }, []);

  const fetchTodayCheck = async () => {
    try {
      const res = await fetch('/api/football/wellness?view=my&days=1');
      if (res.ok) {
        const data = await res.json();
        if (data.todayCheck) {
          setTodayCheck(data.todayCheck);
          setValues({
            sleep: data.todayCheck.sleep,
            soreness: data.todayCheck.soreness,
            fatigue: data.todayCheck.fatigue,
            stress: data.todayCheck.stress,
            mood: data.todayCheck.mood,
          });
          if (data.todayCheck.notes) {
            setNotes(data.todayCheck.notes);
          }
          if (data.todayCheck.sleepDuration !== undefined) {
            const dur = data.todayCheck.sleepDuration;
            if ([6, 7, 8, 9].includes(dur)) {
              setSleepDuration(dur);
              setIsCustomSleep(false);
            } else {
              setSleepDuration(dur);
              setIsCustomSleep(true);
              setCustomSleepDuration(dur.toString());
            }
          }
          if (data.todayCheck.sessionType) {
            setSessionType(data.todayCheck.sessionType);
            if (data.todayCheck.rpe) setRpe(data.todayCheck.rpe);
            if (data.todayCheck.sessionDuration) setSessionDuration(data.todayCheck.sessionDuration.toString());
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const allWellnessFilled = WELLNESS_ITEMS.every((item) => values[item.key]);
  const sessionFilled = sessionType === 'rest' || (!!sessionType && rpe !== null && !!sessionDuration);
  const allFilled = allWellnessFilled && sessionFilled;

  const handleSubmit = async () => {
    if (!allFilled) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/football/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          sleepDuration: sleepDuration || undefined,
          notes,
          rpe,
          sessionType: sessionType || undefined,
          sessionDuration: sessionDuration ? parseInt(sessionDuration) : undefined,
          injuryNote: injuryNote || undefined,
          source: 'quick',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data.check);
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 제출 완료 화면
  if (submitted && result) {
    const score = result.wellnessScore;
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-[32px] border-none shadow-2xl">
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-black text-obsidian">컨디션 기록 완료!</h1>
            <div className={`text-xl font-black ${getScoreColor(score)}`}>{score}</div>
            <p className="text-slate">오늘의 웰니스 점수 (5점 만점)</p>
            {result.sessionLoad && (
              <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-sm px-4 py-2">
                <Dumbbell className="w-4 h-4 mr-1" /> 세션 부하: {result.sessionLoad} AU
              </Badge>
            )}
            <div className="flex flex-col gap-3 pt-4">
              <Button asChild className="w-full h-12 rounded-2xl font-black bg-green-600 hover:bg-green-700">
                <Link href="/football/my-condition">📊 내 컨디션 분석 보기</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 rounded-2xl font-bold">
                <Link href="/football/mypage">⚽ 클럽하우스 홈으로</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6 pt-4 md:pt-24">
        <div>
          <Link href="/football/mypage" className="text-slate hover:text-obsidian inline-flex items-center gap-1 text-sm mb-1 font-bold">
            <ArrowLeft className="w-4 h-4" /> 클럽하우스 홈
          </Link>
        </div>

        {/* 헤더 */}
        <div className="text-center space-y-2">
          <Badge className="bg-green-100 text-green-700 border-none font-bold text-xs px-4 py-1">DAILY WELLNESS CHECK</Badge>
          <h1 className="text-3xl font-black text-obsidian">오늘의 컨디션</h1>
          <p className="text-slate text-sm">5가지 항목을 체크하고 훈련 부하를 기록하세요</p>
          {todayCheck && (
            <Badge className="bg-yellow-100 text-yellow-700 border-none text-xs">⚠️ 이미 기록됨 — 수정 모드</Badge>
          )}
        </div>

        {/* 웰니스 5항목 */}
        {WELLNESS_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="rounded-2xl border-none shadow-lg">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-obsidian">{item.label}</span>
                  {values[item.key] && (
                    <Badge className={`ml-auto ${getScoreColor(values[item.key])} bg-transparent border-none font-black text-lg`}>
                      {values[item.key]}/5
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate">{item.desc}</p>
                <div className="overflow-x-auto pb-2 custom-scrollbar">
                  <div className="flex gap-2 min-w-[340px]">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => setValues({ ...values, [item.key]: score })}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          values[item.key] === score
                            ? score >= 4
                              ? 'bg-green-500 text-white shadow-lg scale-105'
                              : score >= 3
                              ? 'bg-yellow-400 text-white shadow-lg scale-105'
                              : 'bg-red-500 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item.labels[score - 1]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 수면의 질 카드 하단에 수면 시간 측정 추가 */}
                {item.key === 'sleep' && (
                  <div className="pt-4 border-t border-gray-100 mt-2 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-obsidian">🌙 실제 수면 시간</span>
                      {sleepDuration !== null && (
                        <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px]">
                          {sleepDuration}시간
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {[6, 7, 8, 9].map((dur) => (
                        <button
                          type="button"
                          key={dur}
                          onClick={() => {
                            setSleepDuration(dur);
                            setIsCustomSleep(false);
                            setCustomSleepDuration('');
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            sleepDuration === dur && !isCustomSleep
                              ? 'bg-blue-600 text-white shadow-md scale-105'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/50'
                          }`}
                        >
                          {dur}시간
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSleep(true);
                          setSleepDuration(null);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isCustomSleep
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/50'
                        }`}
                      >
                        기타
                      </button>
                    </div>

                    {/* 기타 직접 입력창 (smooth height/opacity transitions) */}
                    <div
                      className={`transition-all duration-300 ease-out overflow-hidden ${
                        isCustomSleep
                          ? 'max-h-20 opacity-100 mt-2'
                          : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="flex items-center gap-2 p-1.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="24"
                          value={customSleepDuration}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomSleepDuration(val);
                            if (val) {
                              const parsed = parseFloat(val);
                              if (!isNaN(parsed) && parsed >= 0 && parsed <= 24) {
                                setSleepDuration(parsed);
                              }
                            } else {
                              setSleepDuration(null);
                            }
                          }}
                          placeholder="수면 시간 입력 (예: 7.5)"
                          className="flex-1 bg-white h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-xs font-bold text-blue-600 pr-2">시간</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 웰니스 개별 항목에 대한 한 줄 메모 입력 기능 (선택) */}
                {values[item.key] && (
                  <div className="transition-all duration-300 ease-out overflow-hidden max-h-28 opacity-100 mt-3">
                    <div className="flex flex-col gap-1 p-2 bg-slate-50/50 rounded-xl border border-gray-200/60 focus-within:border-green-300 focus-within:bg-green-50/10">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-slate flex items-center gap-1">
                          📝 {item.label} 특이사항 메모 (선택)
                        </span>
                        <span className="text-[9px] font-medium text-slate/70">
                          {((notes[item.key]) || '').length}/60자
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={60}
                        value={notes[item.key] || ''}
                        onChange={(e) => setNotes({ ...notes, [item.key]: e.target.value })}
                        placeholder={`${item.label} 상태에 대해 간단히 적어보세요 (예: 햄스트링 당김, 감기 기운)`}
                        className="bg-white h-9 px-3 rounded-lg border border-gray-200/50 text-[11px] font-bold focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* 오늘의 운동 정보 (훈련 부하) */}
        <Card className="rounded-2xl border-none shadow-lg">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-obsidian">오늘의 운동 정보 (훈련 부하)</span>
              <Badge className="ml-auto bg-red-50 text-red-600 border-none text-[10px] font-black">필수사항</Badge>
            </div>

            {/* 스포츠 과학 작성 가이드 도움말 */}
            <div className="bg-blue-50/40 rounded-xl p-3.5 border border-blue-100/60 space-y-1.5 text-left">
              <p className="text-[11px] font-extrabold text-blue-600 flex items-center gap-1">
                💡 운동 정보 작성 가이드 (스포츠 과학 부상 예방)
              </p>
              <div className="space-y-1 text-[10px] text-slate font-bold leading-relaxed">
                <p>• <span className="text-obsidian">운동 강도 (RPE)</span>: 오늘 운동 시 느낀 힘든 정도입니다. (1: 아주 편안함 ~ 10: 최대 한계)</p>
                <p>• <span className="text-obsidian">운동 시간</span>: 분 단위의 전체 순수 활동 시간입니다.</p>
                <p>• <span className="text-obsidian">훈련 부하 (sRPE)</span>: 강도 × 시간으로 계산되며, 코칭 스태프가 선수의 과부하 및 부상 위험을 실시간으로 방지하는 데 사용됩니다.</p>
              </div>
            </div>

            {/* 활동 유형 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate">오늘의 활동 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {SESSION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setSessionType(type.value);
                      if (type.value === 'rest') {
                        setRpe(1);
                        setSessionDuration('0');
                      } else {
                        if (rpe === 1) setRpe(null);
                        if (sessionDuration === '0') setSessionDuration('');
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      sessionType === type.value
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.emoji} {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RPE (1-10) */}
            {sessionType && sessionType !== 'rest' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate">운동 강도 (RPE 1-10)</label>
                  <div className="overflow-x-auto pb-2 custom-scrollbar">
                    <div className="flex gap-1 min-w-[340px]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                        <button
                          key={v}
                          onClick={() => setRpe(v)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all min-w-[30px] ${
                            rpe === v
                              ? v <= 3 ? 'bg-green-500 text-white'
                                : v <= 6 ? 'bg-yellow-400 text-white'
                                : v <= 8 ? 'bg-orange-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 활동 시간 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate flex items-center gap-1">
                    <Timer className="w-3 h-3" /> 활동 시간 (분)
                  </label>
                  <input
                    type="number"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    placeholder="예: 90"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm font-bold"
                    min="1"
                    max="300"
                  />
                </div>
              </>
            )}

            {/* 부상 메모 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 통증/부상 메모 (선택)
              </label>
              <textarea
                value={injuryNote}
                onChange={(e) => setInjuryNote(e.target.value)}
                placeholder="특정 부위 통증이나 불편함이 있다면 기록해 주세요"
                className="w-full h-16 px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* 제출 버튼 (모바일 화면 하단 고정 고려) */}
        <div className="mt-8 mb-4">
          <Button
            onClick={handleSubmit}
            disabled={!allFilled || submitting}
            className="w-full h-14 rounded-2xl font-black text-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-300 shadow-xl"
          >
            {submitting ? (
              <><Loader2 className="animate-spin mr-2 w-5 h-5" /> 기록 중...</>
            ) : allFilled ? (
              '✅ 오늘의 컨디션 기록하기'
            ) : !allWellnessFilled ? (
              `웰니스 항목을 모두 선택해 주세요 (${Object.keys(values).length}/5)`
            ) : (
              '🏃 오늘의 운동 정보를 입력해 주세요'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
