'use client';

import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, History, Download, Sparkles } from 'lucide-react';
import { DiagnosisRadarChart } from '@/components/charts/DiagnosisRadarChart';

interface RecoveryStatusHeroProps {
    todayScore: number;
    scoreHistory: any[];
    radarData: any[];
    assetStats: any;
    userName: string;
}

export default function RecoveryStatusHero({
    todayScore,
    scoreHistory,
    radarData,
    assetStats,
    userName
}: RecoveryStatusHeroProps) {
    return (
        <section className="relative py-12 md:py-20 overflow-hidden bg-background">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-5xl mx-auto space-y-12">
                    
                    {/* Title Area */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/20">
                                Recovery Comprehensive Report
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-obsidian tracking-tighter">
                                {userName}님의 <span className="text-primary">회복 자산</span>
                            </h1>
                        </div>

                        {/* Real-time Asset Summary Dashboard */}
                        <div className="w-full md:w-auto bg-white rounded-[40px] p-6 border border-obsidian/5 shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                            
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate/40 uppercase tracking-tighter mb-1">Total Assets</p>
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-black text-obsidian">
                                            {(assetStats?.precisionDiagnosis || 0) + (assetStats?.dailyRhythmLog || 0) + (assetStats?.scannerAnalysis || 0) + (assetStats?.toolkitUsage || 0) + (assetStats?.consultations || 0) + (assetStats?.reports || 0)}
                                        </span>
                                        <span className="text-xs font-bold text-slate/40 mb-2">건</span>
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-line/50" />
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate/40 uppercase tracking-tighter mb-1">Insight Value</p>
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-black text-primary">{assetStats?.totalInsights || 0}</span>
                                        <span className="text-xs font-bold text-primary/40 mb-2">Pts</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-mist/50 p-3 rounded-2xl border border-line/30">
                                {[
                                    { icon: <Shield className="w-3.5 h-3.5" />, count: assetStats?.precisionDiagnosis || 0, label: '문진' },
                                    { icon: <History className="w-3.5 h-3.5" />, count: assetStats?.scannerAnalysis || 0, label: '스캔' },
                                    { icon: <Download className="w-3.5 h-3.5" />, count: assetStats?.reports || 0, label: '리포트' }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center px-3 border-r last:border-0 border-line/50">
                                        <span className="text-obsidian/40 mb-1">{item.icon}</span>
                                        <span className="text-[10px] font-black text-obsidian">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pt-12 border-t border-line/30">
                        {/* Left: Score & Progress */}
                        <div className="space-y-6 flex-1">
                            <div className="bg-surface/50 border border-line p-8 md:p-10 rounded-[40px] flex items-center gap-8 w-full md:w-auto shadow-sm">
                                <div className="flex-shrink-0">
                                    <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Current Recovery Score</div>
                                    <div className="text-6xl md:text-7xl font-black text-primary tracking-tighter">{todayScore}</div>
                                </div>
                                <div className="text-sm font-bold text-text-secondary leading-snug opacity-60">
                                    지난 7일 대비<br />
                                    <span className={`text-lg font-black ${todayScore > 50 ? 'text-status-good' : 'text-status-danger'}`}>
                                        {todayScore > 50 ? '+' : '-'}{Math.abs(todayScore - 50)}% 변화
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Radar Chart (Physical Balance) */}
                        {radarData.length > 0 && (
                            <div className="w-full md:w-96 h-80 bg-white rounded-[40px] shadow-[0_12px_48px_rgb(0,0,0,0.06)] border border-white/50 p-8 relative flex flex-col overflow-hidden">
                                <h3 className="text-xl font-black text-obsidian relative z-10 tracking-tight">신체 밸런스</h3>
                                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-[#D4AF37]/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

                                <div className="flex-1 relative z-10 mt-2">
                                    <DiagnosisRadarChart
                                        data={radarData.map(d => ({
                                            subject: d.category === 'PHYSICAL' ? '신체' :
                                                d.category === 'MENTAL' ? '멘탈' :
                                                    d.category === 'SLEEP' ? '수면' : '생활',
                                            score: Math.round((d.score / d.fullMark) * 100),
                                            fullMark: 100
                                        }))}
                                        color="#0E3A3A"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Score Trend Graph */}
                    <div className="relative h-64 w-full bg-surface/30 rounded-[40px] border border-line/30 p-8 pt-12">
                        <div className="absolute top-8 left-8 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-reward-gold" />
                            <span className="text-[11px] font-black text-slate/40 uppercase tracking-[0.2em]">7-Day Recovery Flow</span>
                        </div>
                        
                        {/* X-axis background pill */}
                        <div className="absolute bottom-6 left-8 right-8 h-10 bg-white/60 rounded-full z-0" />
                        
                        <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                            <AreaChart data={scoreHistory} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="dashboardLineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0E3A3A" stopOpacity={0.4}/>
                                        <stop offset="100%" stopColor="#0E3A3A" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: '#5A5A5A', fontWeight: 800 }} 
                                    dy={10}
                                />
                                <Tooltip 
                                    cursor={{ stroke: '#0E3A3A', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length && payload[0].value !== null) {
                                            return (
                                                <div className="flex flex-col items-center">
                                                    <div className="bg-obsidian/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl relative mb-2 border border-white/10">
                                                        <p className="text-white text-[12px] font-black tracking-widest whitespace-nowrap">
                                                            {payload[0].payload.date} <span className="opacity-50 mx-2">|</span> score : {payload[0].value}
                                                        </p>
                                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-obsidian/90 rotate-45 border-r border-b border-white/10"></div>
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
                                    fill="url(#dashboardLineGradient)" 
                                    connectNulls={true}
                                    isAnimationActive={true}
                                    dot={{ r: 5, fill: '#0E3A3A', stroke: '#F5F2EA', strokeWidth: 2 }}
                                    activeDot={{ r: 8, fill: '#D4AF37', stroke: '#F5F2EA', strokeWidth: 3, className: 'drop-shadow-xl' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>
    );
}
