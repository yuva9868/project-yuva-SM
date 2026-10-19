'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { WorkspaceFullData, WorkspaceRole } from '@/lib/workspace-types';
import { apiGetWorkspace, apiListWorkspaces, WorkspaceApiError } from '@/lib/workspace-client';
import { toast } from 'sonner';

interface WorkspaceContextType {
  workspaceData: WorkspaceFullData | null;
  userRole: WorkspaceRole | null;
  isLoading: boolean;
  error: string | null;
  refreshWorkspace: () => Promise<void>;
  userWorkspaces: Array<{ id: string; name: string; slug: string; logo_path: string; userRole: WorkspaceRole }>;
  switchWorkspace: (workspaceId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const workspaceId = params.id as string;

  const [workspaceData, setWorkspaceData] = useState<WorkspaceFullData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<Array<{ id: string; name: string; slug: string; logo_path: string; userRole: WorkspaceRole }>>([]);

  const refreshWorkspace = useCallback(async () => {
    if (!user || !workspaceId) return;
    try {
      setError(null);
      const data = await apiGetWorkspace(workspaceId, user);
      setWorkspaceData(data);
    } catch (err: any) {
      console.error('Error fetching workspace:', err);
      const msg = err instanceof WorkspaceApiError && err.status === 403 
        ? 'Access Denied: You are not an authorized member of this private workspace.' 
        : err.message || 'Failed to load workspace data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user, workspaceId]);

  const loadAllWorkspaces = useCallback(async () => {
    if (!user) return;
    try {
      const list = await apiListWorkspaces(user);
      setUserWorkspaces(list.map(w => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        logo_path: w.logo_path,
        userRole: w.userRole,
      })));
    } catch (e) {
      console.error('Failed to load user workspaces list:', e);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && workspaceId) {
      setIsLoading(true);
      refreshWorkspace();
      loadAllWorkspaces();
    }
  }, [user, authLoading, workspaceId, refreshWorkspace, loadAllWorkspaces, router]);

  const switchWorkspace = (newId: string) => {
    router.push(`/workspaces/${newId}`);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaceData,
        userRole: workspaceData?.userRole || null,
        isLoading,
        error,
        refreshWorkspace,
        userWorkspaces,
        switchWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
