'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConventionRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Force move to new URL to break persistent cache
        window.location.href = '/pavilion';
    }, []);

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="text-reward-gold font-black animate-pulse uppercase tracking-[0.5em]">
                Redirecting to Pavilion...
            </div>
        </div>
    );
}
