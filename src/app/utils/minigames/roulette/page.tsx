'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X, RotateCw, Utensils, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];

export default function RoulettePage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [items, setItems] = useState<string[]>(['짜장면', '짬뽕', '김치찌개', '된장찌개', '돈까스', '제육볶음']);
    const [newItem, setNewItem] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);

    // Animation refs
    const currentRotation = useRef(0);
    const spinVelocity = useRef(0);
    const requestRef = useRef<number>();
    const deceleration = useRef(0.985); // Friction

    useEffect(() => {
        drawWheel();
    }, [items]);

    const handleAddItem = () => {
        if (newItem.trim() && !items.includes(newItem.trim())) {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 2) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const drawWheel = (rotationAngle = currentRotation.current) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const totalItems = items.length;
        const arc = (2 * Math.PI) / totalItems;

        // Draw segments
        for (let i = 0; i < totalItems; i++) {
            const angle = rotationAngle + i * arc;

            ctx.beginPath();
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arc);
            ctx.fill();
            ctx.stroke();

            // Draw Text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + arc / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(items[i], radius - 30, 6);
            ctx.restore();
        }

        // Draw Center Circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#e5e7eb';
        ctx.stroke();

        // Draw Star in Center
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('★', centerX, centerY + 2);

        // Draw Pointer (Triangle at 3 o'clock position, pointing inwards)
        ctx.beginPath();
        ctx.fillStyle = '#1f2937';
        // Base is outside, Tip is inside
        ctx.moveTo(centerX + radius + 10, centerY - 15); // Top Outside
        ctx.lineTo(centerX + radius - 20, centerY);      // Tip Inside (Pointing to menu)
        ctx.lineTo(centerX + radius + 10, centerY + 15); // Bottom Outside
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const spin = () => {
        if (isSpinning || items.length < 2) return;

        setIsSpinning(true);
        setWinner(null);

        // Initial Velocity (randomized)
        spinVelocity.current = Math.random() * 0.3 + 0.4; // 0.4 to 0.7 rad/frame
        deceleration.current = 0.985 + Math.random() * 0.005; // Randomize friction slightly

        const animate = () => {
            if (spinVelocity.current < 0.002) {
                // Stop condition
                spinVelocity.current = 0;
                setIsSpinning(false);
                determineWinner();
                return;
            }

            spinVelocity.current *= deceleration.current;
            currentRotation.current += spinVelocity.current;
            drawWheel();

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
    };

    const determineWinner = () => {
        const totalItems = items.length;
        const arc = (2 * Math.PI) / totalItems;

        // Normalize rotation to 0-2PI
        // We draw pointer at 0 (Right).
        // The segment is determined by where 0 falls relative to current rotation.
        // Actually, if we rotate the wheel by theta, the item at 0 is determined by:
        // The angle of item i is: rotation + i*arc
        // We want to find i such that: rotation + i*arc contains 0 (modulo 2PI)

        // Let effective angle at pointer be: (0 - rotation) % 2PI
        let effectiveAngle = (0 - currentRotation.current) % (2 * Math.PI);
        if (effectiveAngle < 0) effectiveAngle += 2 * Math.PI;

        const winningIndex = Math.floor(effectiveAngle / arc);
        setWinner(items[winningIndex]);
    };

    return (
        <div className="min-h-screen bg-green-50/50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-4">
                    <Link href="/utils" className="inline-flex items-center text-sm text-gray-500 hover:text-green-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        미니게임 돌아가기
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Controls */}
                    <Card className="p-6 h-fit lg:col-span-1">
                        <div className="flex items-center space-x-2 mb-6">
                            <Utensils className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-bold">메뉴 후보</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="메뉴 추가 (예: 피자)"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                />
                                <Button onClick={handleAddItem} size="icon" className="shrink-0 bg-green-600 hover:bg-green-700">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                <AnimatePresence initial={false}>
                                    {items.map((item, idx) => (
                                        <motion.div
                                            key={`${item}-${idx}`}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm group"
                                        >
                                            <span className="font-medium text-gray-700">{item}</span>
                                            <button
                                                onClick={() => handleRemoveItem(idx)}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                disabled={items.length <= 2}
                                                aria-label={`${item} 삭제`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {items.length <= 2 && (
                                <p className="text-xs text-red-500 text-center">최소 2개의 메뉴가 필요합니다.</p>
                            )}
                        </div>
                    </Card>

                    {/* Right: Wheel */}
                    <div className="lg:col-span-2 flex flex-col items-center">
                        <Card className="p-8 w-full flex flex-col items-center justify-center bg-white relative overflow-hidden min-h-[500px]">
                            {/* Title */}
                            <div className="text-center mb-8 relative z-10">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                                    <Sparkles className="w-6 h-6 text-yellow-400" />
                                    오늘의 메뉴는?
                                    <Sparkles className="w-6 h-6 text-yellow-400" />
                                </h1>
                                <p className="text-gray-500">돌림판을 돌려 운명의 메뉴를 선택하세요!</p>
                            </div>

                            {/* Canvas Wheel */}
                            <div className="relative">
                                <canvas
                                    ref={canvasRef}
                                    width={400}
                                    height={400}
                                    className="max-w-full h-auto cursor-pointer"
                                    onClick={spin}
                                />
                                {/* Mobile/Touch hint */}
                                {!isSpinning && !winner && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse">
                                        <span className="bg-black/50 text-white px-4 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                                            CLICK TO SPIN!
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="mt-8 flex gap-4">
                                <Button
                                    size="lg"
                                    className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                                    onClick={spin}
                                    disabled={isSpinning || items.length < 2}
                                >
                                    {isSpinning ? '돌아가는 중...' : '돌리기 (Spin)'}
                                    <RotateCw className={`ml-2 w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>

                            {/* Winner Overlay */}
                            <AnimatePresence>
                                {winner && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                                        onClick={() => setWinner(null)}
                                    >
                                        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4 transform animate-bounce-in">
                                            <h3 className="text-xl text-gray-500 mb-2">오늘의 메뉴는</h3>
                                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 mb-6">
                                                {winner}
                                            </div>
                                            <Button onClick={() => setWinner(null)} variant="outline" className="w-full">
                                                다시 돌리기
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
