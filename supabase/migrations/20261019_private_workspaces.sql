-- ==============================================================================
-- IDEA CHECK AI: PRIVATE TEAM WORKSPACES DATABASE SCHEMA & SECURITY POLICIES
-- PostgreSQL / Supabase Migration
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo_path TEXT,
    cover_image TEXT,
    owner_id VARCHAR(255) NOT NULL,
    visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility = 'private'),
    linked_project_id VARCHAR(255),
    settings JSONB NOT NULL DEFAULT '{"allowViewerDownload": false, "allowEditorDownload": true, "defaultRole": "VIEWER", "notifyOnTaskCreated": true, "notifyOnMemberJoin": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ DEFAULT NULL
);

-- Index for lookup by owner and slug
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);

-- 2. WORKSPACE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    invited_by VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    CONSTRAINT uq_workspace_member UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_ws ON public.workspace_members(workspace_id);

-- 3. WORKSPACE INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')),
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    invited_by VARCHAR(255) NOT NULL,
    invited_by_name VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT NULL,
    declined_at TIMESTAMPTZ DEFAULT NULL,
    revoked_at TIMESTAMPTZ DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_ws ON public.workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token ON public.workspace_invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON public.workspace_invitations(email);

-- 4. WORKSPACE FOLDERS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES public.workspace_folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_by_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_folders_ws ON public.workspace_folders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_folders_parent ON public.workspace_folders(parent_folder_id);

-- 5. WORKSPACE FILES TABLE
CREATE TABLE IF NOT EXISTS public.workspace_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.workspace_folders(id) ON DELETE SET NULL,
    storage_key VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    description TEXT,
    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_by_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_files_ws ON public.workspace_files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_folder ON public.workspace_files(folder_id);

-- 6. WORKSPACE TASKS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'completed')),
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to VARCHAR(255),
    assigned_to_name VARCHAR(255),
    assigned_to_avatar TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_by_name VARCHAR(255),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_tasks_ws ON public.workspace_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_assignee ON public.workspace_tasks(assigned_to);

-- 7. WORKSPACE COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.workspace_tasks(id) ON DELETE CASCADE,
    file_id UUID REFERENCES public.workspace_files(id) ON DELETE CASCADE,
    author_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_comments_task ON public.workspace_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_workspace_comments_file ON public.workspace_comments(file_id);

-- 8. WORKSPACE ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    author_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_announcements_ws ON public.workspace_announcements(workspace_id);

-- 9. WORKSPACE ACTIVITY AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.workspace_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    actor_id VARCHAR(255) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_avatar TEXT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_activities_ws ON public.workspace_activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_created ON public.workspace_activities(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all private workspace tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_activities ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current auth user is a member of workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current auth user has role in workspace
CREATE OR REPLACE FUNCTION public.has_workspace_role(ws_id UUID, required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()::text
      AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Workspaces Policies
CREATE POLICY "Members can view their workspaces"
ON public.workspaces FOR SELECT
USING (public.is_workspace_member(id) OR owner_id = auth.uid()::text);

CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Admins can update workspace details"
ON public.workspaces FOR UPDATE
USING (public.has_workspace_role(id, ARRAY['ADMIN']));

CREATE POLICY "Only workspace owner can delete workspace"
ON public.workspaces FOR DELETE
USING (owner_id = auth.uid()::text);

-- Workspace Members Policies
CREATE POLICY "Members can view other members of their workspace"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Admins can invite and manage members"
ON public.workspace_members FOR ALL
USING (public.has_workspace_role(workspace_id, ARRAY['ADMIN']));

-- Workspace Files Policies
CREATE POLICY "Members can view files"
ON public.workspace_files FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Admins and Editors can upload files"
ON public.workspace_files FOR INSERT
WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['ADMIN', 'EDITOR']));

CREATE POLICY "Admins and Editors can update file metadata"
ON public.workspace_files FOR UPDATE
USING (public.has_workspace_role(workspace_id, ARRAY['ADMIN', 'EDITOR']));

CREATE POLICY "Admins and file uploaders can delete files"
ON public.workspace_files FOR DELETE
USING (public.has_workspace_role(workspace_id, ARRAY['ADMIN']) OR uploaded_by = auth.uid()::text);

-- Workspace Tasks Policies
CREATE POLICY "Members can view tasks"
ON public.workspace_tasks FOR SELECT
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Admins and Editors can create tasks"
ON public.workspace_tasks FOR INSERT
WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['ADMIN', 'EDITOR']));

CREATE POLICY "Admins, Editors, and assignees can update tasks"
ON public.workspace_tasks FOR UPDATE
USING (public.has_workspace_role(workspace_id, ARRAY['ADMIN', 'EDITOR']) OR assigned_to = auth.uid()::text);

-- Supabase Storage Private Bucket Policy
-- Bucket Name: 'workspace-private-files' (public = false)
-- INSERT: Admins and Editors can upload to /workspaces/{workspace_id}/*
-- SELECT: Members can read from /workspaces/{workspace_id}/*
