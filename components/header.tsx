'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, Menu, Plus, Bell, Trophy, BookOpen, Compass, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NotificationsDrawer } from '@/components/community/notifications-drawer';
import { getStoredNotifications } from '@/lib/community-data';
import { NotificationItem } from '@/lib/community-types';

export function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (user) {
      setNotifications(getStoredNotifications(user.id));
    } else {
      setNotifications(getStoredNotifications());
    }
  }, [user]);

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ideacheck_community_notifications', JSON.stringify(updated));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-black text-xl text-primary hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <span className="tracking-tight">IdeaCheck <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase ml-1">Ecosystem</span></span>
            </Link>

            {/* Main Nav items */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/community" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <Compass className="w-4 h-4 text-primary" />
                <span>Explore Ecosystem</span>
              </Link>
              <Link href="/community/leaderboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Leaderboard</span>
              </Link>
              <Link href="/community/guidelines" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>Guidelines</span>
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* Share Project CTA */}
            <Link href="/submit" className="hidden sm:block">
              <Button size="sm" className="gap-2 shadow-md shadow-primary/20 font-semibold">
                <Plus className="w-4 h-4" />
                <span>Share Project</span>
              </Button>
            </Link>

            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(true)}
              className="relative rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-background" />
              )}
            </Button>

            {/* Auth section */}
            {!user ? (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="sm">
                    Join Community
                  </Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full overflow-hidden p-0 border border-border">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-semibold text-sm line-clamp-1">{user.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">User Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.email.split('@')[0]}`} className="cursor-pointer">Founder Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/submit" className="cursor-pointer font-medium text-primary">Share New Project</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer flex items-center gap-2 text-rose-500">
                          <Shield className="w-4 h-4" />
                          <span>Admin Moderation</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-muted-foreground">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu trigger */}
            <button
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3">
            <Link href="/community" className="block text-sm font-medium hover:text-primary transition-colors">
              Explore Community Ecosystem
            </Link>
            <Link href="/community/leaderboard" className="block text-sm font-medium hover:text-primary transition-colors">
              Community Leaderboard
            </Link>
            <Link href="/community/guidelines" className="block text-sm font-medium hover:text-primary transition-colors">
              Community Guidelines
            </Link>
            <Link href="/pricing" className="block text-sm font-medium hover:text-primary transition-colors">
              Pricing & Plans
            </Link>
            {!user && (
              <div className="pt-2 border-t border-border flex gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button size="sm" className="w-full">Join</Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </header>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />
    </>
  );
}
