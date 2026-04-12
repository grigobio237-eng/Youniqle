
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Utensils, Brain, Moon, Loader2 } from 'lucide-react';
import { ProductConciergeCard } from './ProductConciergeCard';
import { ProductRequestModal } from './ProductRequestModal';

interface AISolutionSectionProps {
    diagnosisResult: any; // Using any for flexibility with backend response structure
}

export function AISolutionSection({ diagnosisResult }: AISolutionSectionProps) {
    const solution = diagnosisResult?.aiSolution;
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    if (!diagnosisResult) return null;

    if (!solution) return null;

    const cards = [
        { icon: Dumbbell, title: "EXERCISE", color: "text-blue-500", bg: "bg-blue-50", content: solution.exercise },
        { icon: Utensils, title: "NUTRITION", color: "text-green-500", bg: "bg-green-50", content: solution.nutrition },
        { icon: Brain, title: "MINDSET", color: "text-purple-500", bg: "bg-purple-50", content: solution.mindset },
        { icon: Moon, title: "SLEEP", color: "text-indigo-500", bg: "bg-indigo-50", content: solution.sleep },
    ];

    const renderContent = (content: any) => {
        if (!content) return null;
        if (typeof content === 'string') return content;
        if (typeof content === 'object') {
            // If AI returned structured object instead of string, try to join values
            return content.description || content.title || JSON.stringify(content);
        }
        return String(content);
    };

    return (
        <section className="py-12 w-full max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-gray-900 mb-4">YOUNIQLE PERSONAL SOLUTION</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    {renderContent(solution.analysis)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                        <h3 className={`text-xs font-black tracking-widest mb-3 ${card.color}`}>{card.title}</h3>
                        <div className="text-gray-700 font-medium leading-relaxed keep-all">
                            {renderContent(card.content)}
                        </div>
                    </motion.div>
                ))}
            </div>

            {solution.productConcept && (
                <>
                    <ProductConciergeCard
                        productConcept={solution.productConcept}
                        onRequestCustom={() => setIsRequestModalOpen(true)}
                    />
                    <ProductRequestModal
                        open={isRequestModalOpen}
                        onOpenChange={setIsRequestModalOpen}
                        productConcept={solution.productConcept}
                    />
                </>
            )}
        </section>
    );
}
