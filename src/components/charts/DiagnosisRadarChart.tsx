import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export interface RadarDataPoint {
    subject: string;
    score: number;
    fullMark: number;
}

interface DiagnosisRadarChartProps {
    data: RadarDataPoint[];
    color?: string;
    className?: string;
}

export function DiagnosisRadarChart({ data, color = '#2563eb', className }: DiagnosisRadarChartProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className={`w-full h-full ${className}`} />;

    // Normalize data if needed, or trust strict props.

    return (
        <div className={`w-full h-full ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                    />
                    {/* Hiding Radius Axis for cleaner look, or typical 0-100 */}
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Score"
                        dataKey="score"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'white',
                            color: '#1e293b'
                        }}
                        itemStyle={{ color: color, fontWeight: 'bold' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
