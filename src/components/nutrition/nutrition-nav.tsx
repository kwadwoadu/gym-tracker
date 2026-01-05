'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, CheckSquare, UtensilsCrossed, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/nutrition', label: 'Dashboard', icon: Home },
  { href: '/nutrition/log', label: 'Log', icon: CheckSquare },
  { href: '/nutrition/plan', label: 'Plan', icon: UtensilsCrossed },
];

export function NutritionNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#2A2A2A]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Back to main app */}
          <Link
            href="/"
            className="flex items-center gap-2 text-[#A0A0A0] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          {/* Nav tabs */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] rounded-lg p-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#CDFF00] text-[#0A0A0A]'
                      : 'text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Spacer for balance */}
          <div className="w-16" />
        </div>
      </div>
    </nav>
  );
}
