'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import { LoungeContent } from '@/components/pavilion';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChapterWrapper from '@/components/layout/ChapterWrapper';

export default function LoungePage() {
    const { data: session, update: updateSession } = useSession();
    const [owners, setOwners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchLoungeData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/api/pavilion');
                if (res.ok) {
                    const data = await res.json();
                    // Floor 5 is omakase-master
                    setOwners(data[5] || []);
                }
            } catch (error) {
                console.error('Failed to load lounge data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoungeData();
    }, []);

    useEffect(() => {
        // Handle subscription success from URL
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('subscribed') === 'true') {
                updateSession();
                alert('유니클 프리미엄 라운지 멤버십이 활성화되었습니다! 🎊');
                // Clean up URL
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, [updateSession]);

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-luxury-silk">
                <Loader2 className="w-10 h-10 animate-spin text-luxury-gold/50" />
            </div>
        );
    }

    return (
        <ChapterWrapper chapter="lounge">
            <div className="relative w-full min-h-screen bg-luxury-silk">
                <LoungeContent owners={owners} />
            </div>
        </ChapterWrapper>
    );
}


