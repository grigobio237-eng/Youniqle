'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, LayoutDashboard, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: '홈',
      href: '/',
      icon: Home,
    },
    {
      label: '오늘 리듬체크',
      href: '/ai-navigator',
      icon: Activity,
    },
    {
      label: '대시보드',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: '내 회복 리포트',
      href: '/reports',
      icon: FileText,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="bg-background/80 backdrop-blur-xl border-t border-primary/5 px-6 h-20 flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 gap-1 group relative h-full"
            >
              <div className={cn(
                "relative p-2 rounded-2xl transition-all duration-300",
                isActive ? "text-primary bg-primary/5" : "text-foreground/40 group-active:scale-95"
              )}>
                <Icon className={cn(
                  "w-6 h-6 transition-transform duration-300",
                  isActive ? "scale-110" : "scale-100"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-tight transition-colors duration-300",
                isActive ? "text-primary" : "text-foreground/40"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-[1px] left-1/4 right-1/4 h-[2px] bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
