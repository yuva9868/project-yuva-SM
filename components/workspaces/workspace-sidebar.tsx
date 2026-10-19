'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspace } from './workspace-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  FolderLock,
  CheckSquare,
  Users,
  Activity,
  Settings,
  ChevronsUpDown,
  Plus,
  Shield,
  ShieldCheck,
  Edit3,
  Eye,
  ArrowLeft,
  Sparkles,
  Lock,
  X
} from 'lucide-react';
import { useState } from 'react';
import { CreateWorkspaceDialog } from './create-workspace-dialog';

interface WorkspaceSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function WorkspaceSidebar({ mobileOpen, onMobileClose }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { workspaceData, userRole, userWorkspaces, switchWorkspace } = useWorkspace();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (!workspaceData) return null;

  const ws = workspaceData.workspace;
  const baseUrl = `/workspaces/${ws.id}`;

  const navItems = [
    {
      label: 'Overview',
      href: baseUrl,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Files & Storage',
      href: `${baseUrl}/files`,
      icon: FolderLock,
      badge: workspaceData.files.length,
    },
    {
      label: 'Task Board',
      href: `${baseUrl}/tasks`,
      icon: CheckSquare,
      badge: workspaceData.tasks.filter(t => t.status !== 'completed').length,
    },
    {
      label: 'Team Members',
      href: `${baseUrl}/members`,
      icon: Users,
      badge: workspaceData.members.length,
    },
    {
      label: 'Activity Audit',
      href: `${baseUrl}/activity`,
      icon: Activity,
    },
    {
      label: 'Settings',
      href: `${baseUrl}/settings`,
      icon: Settings,
      adminOnly: true,
    },
  ];

  const getRoleBadge = () => {
    switch (userRole) {
      case 'ADMIN':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case 'EDITOR':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> Editor
          </span>
        );
      case 'VIEWER':
      default:
        return (
          <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Viewer
          </span>
        );
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border w-64 select-none">
      {/* Top Workspace Switcher */}
      <div className="p-4 border-b border-border/80">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/80 transition-colors text-left border border-border/60 group">
              <div className="flex items-center gap-2.5 min-w-0">
                {ws.logo_path ? (
                  <img src={ws.logo_path} alt={ws.name} className="w-9 h-9 rounded-lg object-cover border border-primary/30 shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                    {ws.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Lock className="w-2.5 h-2.5 text-primary shrink-0" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Private</span>
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-card border-border">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Switch Workspace ({userWorkspaces.length})
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userWorkspaces.map((w) => (
              <DropdownMenuItem
                key={w.id}
                onClick={() => switchWorkspace(w.id)}
                className={`flex items-center justify-between cursor-pointer py-2 ${
                  w.id === ws.id ? 'bg-primary/10 text-primary font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                    {w.name.slice(0, 1)}
                  </span>
                  <span className="truncate text-xs">{w.name}</span>
                </div>
                <span className="text-[9px] uppercase font-bold text-muted-foreground ml-2">
                  {w.userRole}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setCreateDialogOpen(true)}
              className="cursor-pointer text-primary font-bold text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Current Role Indicator */}
        <div className="mt-3 flex items-center justify-between px-1 text-xs">
          <span className="text-[11px] text-muted-foreground font-medium">Your Role:</span>
          {getRoleBadge()}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          Workspace Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-border/80 space-y-2">
        <Link href="/dashboard" className="w-full">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={(id) => {
          router.push(`/workspaces/${id}`);
        }}
      />
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative z-50 flex flex-col w-72 max-w-xs h-full bg-card shadow-2xl">
            <div className="absolute top-4 right-3 z-10">
              <button
                onClick={onMobileClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
