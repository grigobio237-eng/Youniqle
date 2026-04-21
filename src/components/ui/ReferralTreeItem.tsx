'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface ReferralTreeItemProps {
  name: string;
  email: string;
  grade: string;
  createdAt: string;
  contribution: number;
  avatar?: string;
  level: number;
}

export default function ReferralTreeItem({ 
  name, 
  email, 
  grade, 
  createdAt, 
  contribution, 
  avatar,
  level 
}: ReferralTreeItemProps) {
  
  const gradeColors: Record<string, string> = {
    cedar: 'bg-slate-100 text-slate-600',
    rooter: 'bg-green-100 text-green-600',
    bloomer: 'bg-blue-100 text-blue-600',
    glower: 'bg-purple-100 text-purple-600',
    ecosoul: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 transition-all shadow-sm">
      <div className="relative h-10 w-10 shrink-0">
        {avatar ? (
          <Image 
            src={avatar} 
            alt={name} 
            fill 
            className="rounded-full object-cover border border-gray-100"
          />
        ) : (
          <div className="h-full w-full bg-indigo-50 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-indigo-300" />
          </div>
        )}
        <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${level === 1 ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
          L{level}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 truncate">{name}</span>
          <Badge className={`text-[10px] uppercase font-black px-1.5 h-4 ${gradeColors[grade.toLowerCase()] || gradeColors.cedar}`}>
            {grade}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
          <span className="truncate">{email}</span>
          <span>•</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold text-xs">
          <TrendingUp className="h-3 w-3" />
          {contribution.toLocaleString()}P
        </div>
        <p className="text-[9px] text-gray-400">기여 포인트</p>
      </div>
    </div>
  );
}
