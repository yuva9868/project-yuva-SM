-- IdeaCheck AI: Direct Messaging System Schema Migration
-- Migration: 20261027_direct_messaging.sql

-- 1. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL DEFAULT 'direct', -- 'direct' or 'group'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_message_content TEXT,
    last_message_sender_id TEXT,
    project_id TEXT,
    project_title TEXT,
    project_tagline TEXT,
    project_stage TEXT,
    project_logo_url TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Conversation Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    muted_at TIMESTAMPTZ,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_conversation_user UNIQUE (conversation_id, user_id)
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    message_type VARCHAR(30) NOT NULL DEFAULT 'text', -- 'text', 'project_share', 'workspace_invite', 'system'
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    client_message_id TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Message Requests Table (Anti-Spam / Introductions)
CREATE TABLE IF NOT EXISTS public.message_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    recipient_id TEXT NOT NULL,
    initial_message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_sender_recipient_request UNIQUE (sender_id, recipient_id, conversation_id)
);

-- 5. User Blocks Table
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id TEXT NOT NULL,
    blocked_id TEXT NOT NULL,
    blocked_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_blocker_blocked UNIQUE (blocker_id, blocked_id)
);

-- 6. Message Reports Table
CREATE TABLE IF NOT EXISTS public.message_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id TEXT NOT NULL,
    reported_user_id TEXT NOT NULL,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    reason VARCHAR(50) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. User Messaging Privacy & Settings Table
CREATE TABLE IF NOT EXISTS public.user_messaging_settings (
    user_id TEXT PRIMARY KEY,
    allow_messages_from VARCHAR(30) NOT NULL DEFAULT 'everyone', -- 'everyone', 'community', 'verified_only'
    show_read_receipts BOOLEAN NOT NULL DEFAULT TRUE,
    show_online_status BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_conv_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON public.messages(client_message_id) WHERE client_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_message_requests_recipient ON public.message_requests(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_user_blocks_lookup ON public.user_blocks(blocker_id, blocked_id);

-- 9. Row Level Security (RLS) Policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messaging_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: check if authenticated user is participant of conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(target_conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = target_conv_id
      AND user_id = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for Conversations:
CREATE POLICY "Users can view conversations they participate in"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id
        AND cp.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policies for Conversation Participants:
CREATE POLICY "Users can view participants of their conversations"
  ON public.conversation_participants FOR SELECT
  USING (
    public.is_conversation_participant(conversation_id)
  );

CREATE POLICY "Users can update their own participant settings"
  ON public.conversation_participants FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Policies for Messages:
CREATE POLICY "Participants can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    public.is_conversation_participant(conversation_id)
  );

CREATE POLICY "Participants can insert messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::text
    AND public.is_conversation_participant(conversation_id)
    AND NOT EXISTS (
      -- Check blocked
      SELECT 1 FROM public.conversation_participants cp
      JOIN public.user_blocks ub ON ub.blocker_id = cp.user_id AND ub.blocked_id = auth.uid()::text
      WHERE cp.conversation_id = conversation_id
    )
  );

CREATE POLICY "Senders can soft-delete or edit their own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid()::text);

-- Policies for Message Requests:
CREATE POLICY "Users can view requests they sent or received"
  ON public.message_requests FOR SELECT
  USING (sender_id = auth.uid()::text OR recipient_id = auth.uid()::text);

CREATE POLICY "Recipients can update request status"
  ON public.message_requests FOR UPDATE
  USING (recipient_id = auth.uid()::text);

-- Policies for Blocks:
CREATE POLICY "Users can view and manage their own blocklist"
  ON public.user_blocks FOR ALL
  USING (blocker_id = auth.uid()::text);

-- Policies for Reports:
CREATE POLICY "Users can create reports"
  ON public.message_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid()::text);

-- Policies for Messaging Settings:
CREATE POLICY "Users can view and update their own messaging settings"
  ON public.user_messaging_settings FOR ALL
  USING (user_id = auth.uid()::text);
