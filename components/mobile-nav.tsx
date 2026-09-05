'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface MobileNavProps {
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export function MobileNav({ onOpenNotifications, unreadNotificationsCount = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Discover', href: '/community', icon: Compass },
    { label: 'Create', href: '/submit', icon: PlusCircle, isHighlight: true },
    { 
      label: 'Activity', 
      onClick: onOpenNotifications, 
      href: '#', 
      icon: Bell, 
      badge: unreadNotificationsCount 
    },
    { label: 'Profile', href: user ? '/dashboard' : '/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.href !== '#' && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
          
          if (item.isHighlight) {
            return (
              <Link
                key={idx}
                href={item.href}
                className="flex flex-col items-center justify-center relative -top-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-semibold text-primary mt-0.5">Share Idea</span>
              </Link>
            );
          }

          if (item.onClick) {
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center p-1.5 text-muted-foreground hover:text-foreground relative"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
