'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Search,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Paperclip,
  Smile,
  Briefcase,
  ExternalLink,
  ChevronLeft,
  BellOff,
  Bell,
  ShieldAlert,
  UserX,
  MoreVertical,
  CheckCircle2,
  Info,
  X,
  RotateCcw,
  Check,
  MapPin,
  Flame,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ConversationWithDetails,
  Conversation,
  Message,
  MessageAttachment,
  ProjectContextSummary,
} from '@/lib/messaging-types';
import {
  apiListConversations,
  apiGetConversation,
  apiSendMessage,
  apiFindOrCreateConversation,
  apiMarkConversationRead,
  apiDeleteMessage,
  apiToggleMute,
  apiInviteToWorkspace,
  apiRespondToWorkspaceInvite,
  apiUpdateMessageRequest,
  apiBlockUser,
  apiReportMessageOrUser,
  apiPingPresence,
} from '@/lib/messages-client';
import { MessageBubble } from '@/components/messages/message-bubble';
import { ShareProjectDialog } from '@/components/messages/share-project-dialog';
import { WorkspaceInviteDialog } from '@/components/messages/workspace-invite-dialog';
import { NewChatDialog } from '@/components/messages/new-chat-dialog';
import { ReportDialog } from '@/components/messages/report-dialog';
import { BlockDialog } from '@/components/messages/block-dialog';
import { ImageLightbox } from '@/components/messages/image-lightbox';
import { validateImageFile, readFileAsDataUrl } from '@/lib/storage';
import { getStoredProjects } from '@/lib/community-data';

const QUICK_EMOJIS = ['👋', '🚀', '💡', '👍', '🔥', '👏', '🤝', '💯'];

function MessagesContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query params
  const queryConversationId = searchParams.get('conversationId');
  const queryUserId = searchParams.get('userId');
  const queryProjectId = searchParams.get('projectId');

  // State
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(queryConversationId);
  const [activeConversationData, setActiveConversationData] = useState<{
    conversation: Conversation;
    otherParticipant: any;
    participants: any[];
    messages: Message[];
    hasMore: boolean;
    requestStatus?: string;
    requestId?: string;
    isMuted: boolean;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'requests'>('all');
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Modals
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [shareProjectOpen, setShareProjectOpen] = useState(false);
  const [workspaceInviteOpen, setWorkspaceInviteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name?: string } | null>(null);
  const [showEmojiBar, setShowEmojiBar] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  // Load conversation list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiListConversations(user, searchQuery, activeTab);
      setConversations(data.conversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [user, searchQuery, activeTab]);

  // Load specific conversation messages
  const loadActiveConversation = useCallback(async (convId: string, isInitial = false) => {
    if (!user) return;
    if (isInitial) setIsLoadingMessages(true);
    try {
      const data = await apiGetConversation(convId, user);
      setActiveConversationData(data);
      // Mark read
      apiMarkConversationRead(convId, user);
      if (isInitial) {
        setTimeout(() => scrollToBottom(false), 100);
      }
    } catch (err: any) {
      console.error('Failed to load active conversation:', err);
    } finally {
      if (isInitial) setIsLoadingMessages(false);
    }
  }, [user, scrollToBottom]);

  // Initialize or handle URL query parameters (e.g. from profile or project "Message" button)
  useEffect(() => {
    if (!user) return;

    if (queryUserId) {
      // Find project details if queryProjectId was provided
      let projectContext;
      if (queryProjectId) {
        const allProj = getStoredProjects();
        const foundProj = allProj.find(p => p.id === queryProjectId);
        if (foundProj) {
          projectContext = {
            projectId: foundProj.id,
            projectTitle: foundProj.name,
            projectTagline: foundProj.tagline,
            projectStage: foundProj.stage,
            projectLogoUrl: foundProj.logoUrl,
          };
        }
      }

      apiFindOrCreateConversation(queryUserId, user, projectContext)
        .then(res => {
          setSelectedConvId(res.conversation.id);
          setMobileView('chat');
          loadConversations();
          loadActiveConversation(res.conversation.id, true);
        })
        .catch(err => {
          alert(err.message || 'Unable to open conversation');
        });
    } else if (queryConversationId) {
      setSelectedConvId(queryConversationId);
      setMobileView('chat');
    }
  }, [user, queryUserId, queryProjectId, queryConversationId, loadConversations, loadActiveConversation]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadConversations();
      apiPingPresence(user, true);
    }
  }, [user, loadConversations]);

  // When selected conversation changes
  useEffect(() => {
    if (selectedConvId && user) {
      loadActiveConversation(selectedConvId, true);
      setReplyingTo(null);
      setPendingAttachments([]);
    }
  }, [selectedConvId, user, loadActiveConversation]);

  // Real-time polling: Every 3 seconds when conversation is open
  useEffect(() => {
    if (!user || !selectedConvId) return;

    const interval = setInterval(() => {
      // Only poll when page is active/visible
      if (document.visibilityState === 'visible') {
        loadActiveConversation(selectedConvId, false);
        loadConversations();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, selectedConvId, loadActiveConversation, loadConversations]);

  // Presence Heartbeat: every 60s
  useEffect(() => {
    if (!user) return;
    const presenceInterval = setInterval(() => {
      apiPingPresence(user, true);
    }, 60000);
    return () => clearInterval(presenceInterval);
  }, [user]);

  // Send Message Handler
  const handleSendMessage = async () => {
    if (!user || !selectedConvId) return;
    if (!inputText.trim() && pendingAttachments.length === 0) return;

    const textToSend = inputText.trim();
    const replyId = replyingTo?.id;
    const attachmentsToSend = [...pendingAttachments];
    const clientMsgId = `cl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Reset input immediately for optimistic responsiveness
    setInputText('');
    setReplyingTo(null);
    setPendingAttachments([]);
    setShowEmojiBar(false);
    setIsSending(true);

    try {
      await apiSendMessage(selectedConvId, user, {
        content: textToSend,
        replyToId: replyId,
        attachments: attachmentsToSend,
        clientMessageId: clientMsgId,
      });

      // Reload conversation messages and scroll to bottom
      await loadActiveConversation(selectedConvId, false);
      loadConversations();
      setTimeout(() => scrollToBottom(true), 150);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      // Restore input text on error
      setInputText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // Keyboard Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const newAttachment: MessageAttachment = {
        id: `att_img_${Date.now()}`,
        type: 'image',
        url: dataUrl,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };
      setPendingAttachments(prev => [...prev, newAttachment]);
    } catch (err) {
      alert('Failed to process image attachment.');
    }
    // Clear file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Workspace Invite in chat
  const handleSendWorkspaceInvite = async (workspaceId: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    if (!user || !selectedConvId) return;
    await apiInviteToWorkspace(selectedConvId, user, workspaceId, role);
    await loadActiveConversation(selectedConvId, false);
    loadConversations();
    scrollToBottom(true);
  };

  // Accept Workspace Invite in chat
  const handleAcceptWorkspaceInvite = async (messageId: string) => {
    if (!user || !selectedConvId) return;
    try {
      await apiRespondToWorkspaceInvite(selectedConvId, user, messageId, true);
      await loadActiveConversation(selectedConvId, false);
      loadConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to accept invitation');
    }
  };

  // Decline Workspace Invite in chat
  const handleDeclineWorkspaceInvite = async (messageId: string) => {
    if (!user || !selectedConvId) return;
    try {
      await apiRespondToWorkspaceInvite(selectedConvId, user, messageId, false);
      await loadActiveConversation(selectedConvId, false);
      loadConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to decline invitation');
    }
  };

  // Accept / Decline Message Request
  const handleRespondToRequest = async (status: 'accepted' | 'declined') => {
    if (!user || !activeConversationData?.requestId) return;
    try {
      await apiUpdateMessageRequest(activeConversationData.requestId, user, status);
      if (status === 'declined') {
        setSelectedConvId(null);
        setMobileView('list');
      } else {
        await loadActiveConversation(selectedConvId!, false);
      }
      loadConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    }
  };

  // Delete / Unsend message
  const handleDeleteMessage = async (messageId: string) => {
    if (!user || !selectedConvId) return;
    if (!confirm('Are you sure you want to unsend this message?')) return;
    try {
      await apiDeleteMessage(selectedConvId, messageId, user);
      await loadActiveConversation(selectedConvId, false);
      loadConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to delete message');
    }
  };

  // Toggle Mute
  const handleToggleMute = async () => {
    if (!user || !selectedConvId) return;
    try {
      const res = await apiToggleMute(selectedConvId, user);
      setActiveConversationData(prev => prev ? { ...prev, isMuted: res.isMuted } : null);
      loadConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle mute');
    }
  };

  // Block user
  const handleBlockUser = async () => {
    if (!user || !activeConversationData) return;
    try {
      await apiBlockUser(activeConversationData.otherParticipant.id, user, activeConversationData.otherParticipant.name);
      alert(`Blocked ${activeConversationData.otherParticipant.name}.`);
      setSelectedConvId(null);
      setMobileView('list');
      loadConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to block user');
    }
  };

  // Report user / conversation
  const handleReport = async (reason: string, details?: string) => {
    if (!user || !activeConversationData) return;
    try {
      await apiReportMessageOrUser(user, {
        reportedUserId: activeConversationData.otherParticipant.id,
        conversationId: activeConversationData.conversation.id,
        reason,
        details,
      });
      alert('Thank you. Your report has been submitted to moderators.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    }
  };

  // Count requests
  const pendingRequestsCount = conversations.filter(c => c.requestStatus === 'pending_received').length;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        Loading Direct Messages...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-md mx-auto pt-32 px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/10">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Sign In to Direct Message</h1>
          <p className="text-sm text-muted-foreground">
            Connect privately with founders, mentors, and investors across the IdeaCheck AI ecosystem.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/login">
              <Button className="font-bold">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main App Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto pt-16 flex overflow-hidden h-[calc(100vh-4rem)]">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: CONVERSATION LIST (Desktop or Mobile List View) */}
        {/* ========================================================= */}
        <aside
          className={`w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-border/70 flex flex-col bg-card/40 backdrop-blur-md ${
            mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Header & New Chat button */}
          <div className="p-4 border-b border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h1 className="font-bold text-lg text-foreground tracking-tight">Messages</h1>
            </div>

            <Button
              size="sm"
              onClick={() => setNewChatOpen(true)}
              className="gap-1.5 h-8 px-3 rounded-xl font-bold shadow-sm shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </Button>
          </div>

          {/* Search bar */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 text-xs h-9 rounded-xl border-border/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pb-2 flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                activeTab === 'all' ? 'bg-primary/15 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                activeTab === 'unread' ? 'bg-primary/15 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'requests' ? 'bg-primary/15 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/30">
            {conversations.length === 0 ? (
              <div className="p-6 text-center space-y-3 my-auto">
                <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Find a founder in the community and start a conversation.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setNewChatOpen(true)} className="rounded-xl text-xs gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Explore Founders</span>
                </Button>
              </div>
            ) : (
              conversations.map(conv => {
                const isSelected = selectedConvId === conv.conversation.id;
                const other = conv.otherParticipant;
                const isMyLastMsg = conv.lastMessage?.senderId === user.id;

                return (
                  <div
                    key={conv.conversation.id}
                    onClick={() => {
                      setSelectedConvId(conv.conversation.id);
                      setMobileView('chat');
                    }}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all border-l-2 ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-xs'
                        : 'border-transparent hover:bg-muted/40'
                    }`}
                  >
                    {/* User Avatar with Presence */}
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-border/80 bg-muted">
                        <img
                          src={other?.avatar || `https://avatar.vercel.sh/${other?.name}?s=96`}
                          alt={other?.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Presence Indicator */}
                      {other?.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" title="Online now" />
                      )}
                    </div>

                    {/* Metadata & Message Preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <p className="font-semibold text-sm text-foreground truncate">{other?.name}</p>
                          {other?.badges?.includes('Verified Founder') && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary fill-primary/20 flex-shrink-0" />
                          )}
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {conv.conversation.lastMessageAt ? (
                            new Date(conv.conversation.lastMessageAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric'
                            })
                          ) : ''}
                        </span>
                      </div>

                      {/* Project Context Pill if linked */}
                      {conv.conversation.projectTitle && (
                        <div className="flex items-center gap-1 my-0.5">
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-primary/10 text-primary truncate max-w-[200px]">
                            {conv.conversation.projectTitle}
                          </span>
                        </div>
                      )}

                      {/* Snippet Preview & Unread Pill */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                          {isMyLastMsg && <span className="font-normal opacity-75">You: </span>}
                          {conv.conversation.lastMessageContent || 'No messages yet'}
                        </p>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {conv.isMuted && <BellOff className="w-3 h-3 text-muted-foreground" />}
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shadow-xs">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MIDDLE PANEL: CHAT WINDOW */}
        {/* ========================================================= */}
        <section
          className={`flex-1 flex flex-col bg-background relative overflow-hidden ${
            mobileView === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {selectedConvId && activeConversationData ? (
            <>
              {/* Chat Window Header */}
              <div className="px-4 py-3 border-b border-border/70 bg-card/30 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setMobileView('list')}
                    className="lg:hidden h-8 w-8 text-muted-foreground"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  {/* Recipient Avatar */}
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-muted">
                      <img
                        src={activeConversationData.otherParticipant.avatar || `https://avatar.vercel.sh/${activeConversationData.otherParticipant.name}?s=96`}
                        alt={activeConversationData.otherParticipant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {activeConversationData.otherParticipant.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    )}
                  </div>

                  {/* Recipient Name & Online status */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-foreground truncate">
                        {activeConversationData.otherParticipant.name}
                      </p>
                      {activeConversationData.otherParticipant.badges?.includes('Verified Founder') && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary fill-primary/20" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      {activeConversationData.otherParticipant.isOnline ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Active now</span>
                        </span>
                      ) : (
                        <span>Offline</span>
                      )}
                      <span>• @{activeConversationData.otherParticipant.username}</span>
                    </p>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-1.5">
                  {/* View public profile */}
                  <Link href={`/profile/${activeConversationData.otherParticipant.username}`} target="_blank">
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-xs h-8 gap-1 text-muted-foreground hover:text-foreground">
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>

                  {/* Toggle details sidebar button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowRightPanel(!showRightPanel)}
                    title="Toggle details panel"
                    className={`h-8 w-8 text-muted-foreground hover:text-foreground ${showRightPanel ? 'bg-muted' : ''}`}
                  >
                    <Info className="w-4 h-4" />
                  </Button>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleToggleMute} className="cursor-pointer gap-2">
                        {activeConversationData.isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        <span>{activeConversationData.isMuted ? 'Unmute' : 'Mute Notifications'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setWorkspaceInviteOpen(true)} className="cursor-pointer gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span>Invite to Workspace</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShareProjectOpen(true)} className="cursor-pointer gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Share Community Project</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setReportOpen(true)} className="cursor-pointer gap-2 text-rose-400">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Report Conversation</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setBlockOpen(true)} className="cursor-pointer gap-2 text-rose-500">
                        <UserX className="w-4 h-4" />
                        <span>Block User</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Project Context Banner (when conversation is about a project) */}
              {activeConversationData.conversation.projectTitle && (
                <div className="px-4 py-2.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground truncate">
                      <strong>Conversation about:</strong> {activeConversationData.conversation.projectTitle}
                    </span>
                    {activeConversationData.conversation.projectStage && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-primary/30 text-primary">
                        {activeConversationData.conversation.projectStage}
                      </Badge>
                    )}
                  </div>

                  {activeConversationData.conversation.projectId && (
                    <Link href={`/community/${activeConversationData.conversation.projectId}`} target="_blank">
                      <Button size="sm" variant="outline" className="h-6 text-[11px] px-2 gap-1 border-primary/30 text-primary hover:bg-primary/20 font-semibold">
                        <span>View Project</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Message Request Banner (if pending) */}
              {activeConversationData.requestStatus === 'pending_received' && (
                <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-amber-400">Message Request</p>
                    <p className="text-muted-foreground text-[11px]">
                      {activeConversationData.otherParticipant.name} sent you an introduction. Accept to reply.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleRespondToRequest('declined')} className="h-7 text-xs text-rose-400">
                      Decline
                    </Button>
                    <Button size="sm" onClick={() => handleRespondToRequest('accepted')} className="h-7 text-xs font-bold bg-primary text-primary-foreground">
                      Accept Request
                    </Button>
                  </div>
                </div>
              )}

              {/* Messages Feed */}
              <div
                ref={chatScrollContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
              >
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Loading conversation messages...
                  </div>
                ) : activeConversationData.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-md">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-foreground">
                        Start the conversation with {activeConversationData.otherParticipant.name}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm mt-1">
                        Discuss startup validation, prototypes, developer collaboration, or investment opportunities.
                      </p>
                    </div>
                  </div>
                ) : (
                  activeConversationData.messages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMe={msg.senderId === user.id}
                      onReply={m => setReplyingTo(m)}
                      onDelete={handleDeleteMessage}
                      onRetry={m => handleSendMessage()}
                      onOpenImage={(url, name) => setLightboxImage({ url, name })}
                      onAcceptWorkspaceInvite={handleAcceptWorkspaceInvite}
                      onDeclineWorkspaceInvite={handleDeclineWorkspaceInvite}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quoted Reply Banner */}
              {replyingTo && (
                <div className="px-4 py-2 bg-muted/60 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Reply className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground truncate">
                      Replying to <strong>{replyingTo.senderName}</strong>: &quot;{replyingTo.content}&quot;
                    </span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setReplyingTo(null)} className="h-6 w-6 text-muted-foreground">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* Pending Attachments Preview */}
              {pendingAttachments.length > 0 && (
                <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center gap-2 overflow-x-auto">
                  {pendingAttachments.map((att, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-border bg-card p-1 flex items-center gap-2 text-xs">
                      {att.type === 'image' && att.url ? (
                        <img src={att.url} alt="upload" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-primary" />
                      )}
                      <span className="truncate max-w-[120px] font-medium">{att.name || att.projectData?.name || 'Attachment'}</span>
                      <button
                        onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="text-muted-foreground hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Emoji Bar */}
              {showEmojiBar && (
                <div className="px-4 py-1.5 bg-card border-t border-border/70 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Quick Reactions:</span>
                  {QUICK_EMOJIS.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(prev => prev + emoji)}
                      className="text-base p-1 hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t border-border/70 bg-card/40 backdrop-blur-md">
                <div className="flex items-end gap-2 bg-background/80 border border-border/80 rounded-2xl p-2 shadow-inner focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                  
                  {/* Action buttons (Emoji, Attachments, Project, Workspace) */}
                  <div className="flex items-center gap-0.5 pb-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowEmojiBar(!showEmojiBar)}
                      title="Quick emoji"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach image"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                    />

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShareProjectOpen(true)}
                      title="Share community project card"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setWorkspaceInviteOpen(true)}
                      title="Invite to private workspace"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Briefcase className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Textarea */}
                  <Textarea
                    placeholder={`Message ${activeConversationData.otherParticipant.name}... (Press Enter to send)`}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="flex-1 min-h-[36px] max-h-32 bg-transparent border-0 p-1.5 text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                  />

                  {/* Send Button */}
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isSending || (!inputText.trim() && pendingAttachments.length === 0)}
                    className="h-9 w-9 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty Chat State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-lg shadow-primary/10">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Select a Conversation</h2>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Choose a chat from the left panel or start a new direct message with founders, mentors, and investors.
                </p>
              </div>
              <Button onClick={() => setNewChatOpen(true)} className="gap-2 font-bold rounded-xl shadow-md shadow-primary/20">
                <Plus className="w-4 h-4" />
                <span>Start New Conversation</span>
              </Button>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* RIGHT PANEL: CONVERSATION DETAILS & STARTUP CONTEXT */}
        {/* ========================================================= */}
        {selectedConvId && activeConversationData && showRightPanel && (
          <aside className="hidden xl:flex w-80 flex-shrink-0 border-l border-border/70 flex-col bg-card/30 backdrop-blur-md overflow-y-auto p-4 space-y-6">
            
            {/* Recipient Profile Summary Card */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 mx-auto bg-muted">
                <img
                  src={activeConversationData.otherParticipant.avatar || `https://avatar.vercel.sh/${activeConversationData.otherParticipant.name}?s=96`}
                  alt={activeConversationData.otherParticipant.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="font-bold text-base text-foreground">{activeConversationData.otherParticipant.name}</h3>
                  {activeConversationData.otherParticipant.badges?.includes('Verified Founder') && (
                    <CheckCircle2 className="w-4 h-4 text-primary fill-primary/20" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{activeConversationData.otherParticipant.username}</p>
                {activeConversationData.otherParticipant.location && (
                  <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span>{activeConversationData.otherParticipant.location}</span>
                  </p>
                )}
              </div>

              {activeConversationData.otherParticipant.bio && (
                <p className="text-xs text-foreground/80 italic px-2">
                  &quot;{activeConversationData.otherParticipant.bio}&quot;
                </p>
              )}

              {/* View Profile CTA */}
              <Link href={`/profile/${activeConversationData.otherParticipant.username}`} target="_blank" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5 h-8 rounded-xl">
                  <span>View Public Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Skills / Interests */}
            {activeConversationData.otherParticipant.skills && activeConversationData.otherParticipant.skills.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Expertise & Skills</p>
                <div className="flex flex-wrap gap-1">
                  {activeConversationData.otherParticipant.skills.map((s: string, i: number) => (
                    <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collaboration & Workspace Quick CTA */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Startup Collaboration</p>
              <Button
                size="sm"
                onClick={() => setWorkspaceInviteOpen(true)}
                className="w-full justify-start text-xs font-semibold gap-2 h-9 rounded-xl"
              >
                <Briefcase className="w-4 h-4" />
                <span>Invite to Private Workspace</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShareProjectOpen(true)}
                className="w-full justify-start text-xs font-semibold gap-2 h-9 rounded-xl border-border/80"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Share Community Project</span>
              </Button>
            </div>

            {/* Project Context Summary if linked */}
            {activeConversationData.conversation.projectTitle && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Project in Discussion</p>
                <Card className="p-3 bg-muted/20 border-border/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="font-semibold text-xs text-foreground truncate">
                      {activeConversationData.conversation.projectTitle}
                    </p>
                  </div>
                  {activeConversationData.conversation.projectTagline && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {activeConversationData.conversation.projectTagline}
                    </p>
                  )}
                  {activeConversationData.conversation.projectId && (
                    <Link href={`/community/${activeConversationData.conversation.projectId}`} target="_blank" className="block pt-1">
                      <Button size="sm" variant="outline" className="w-full text-xs h-7 gap-1">
                        <span>Open Project Hub</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                </Card>
              </div>
            )}

            {/* Privacy & Safety Controls */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Privacy & Moderation</p>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMute}
                className="w-full justify-start text-xs gap-2 h-8 text-muted-foreground hover:text-foreground"
              >
                {activeConversationData.isMuted ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                <span>{activeConversationData.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBlockOpen(true)}
                className="w-full justify-start text-xs gap-2 h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Block User</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportOpen(true)}
                className="w-full justify-start text-xs gap-2 h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Report Conversation</span>
              </Button>
            </div>
          </aside>
        )}
      </div>

      {/* Dialog Modals */}
      <NewChatDialog
        isOpen={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        currentUser={user}
        onSelectUser={async targetUser => {
          try {
            const res = await apiFindOrCreateConversation(targetUser.id, user);
            setSelectedConvId(res.conversation.id);
            setMobileView('chat');
            loadConversations();
          } catch (err: any) {
            alert(err.message || 'Failed to start conversation');
          }
        }}
      />

      <ShareProjectDialog
        isOpen={shareProjectOpen}
        onClose={() => setShareProjectOpen(false)}
        onSelectProject={async projectData => {
          if (!selectedConvId) return;
          try {
            await apiSendMessage(selectedConvId, user, {
              content: `Check out "${projectData.name}": ${projectData.tagline}`,
              messageType: 'project_share',
              attachments: [
                {
                  id: `att_proj_${Date.now()}`,
                  type: 'project',
                  projectData,
                }
              ]
            });
            await loadActiveConversation(selectedConvId, false);
            loadConversations();
            scrollToBottom(true);
          } catch (err: any) {
            alert(err.message || 'Failed to share project');
          }
        }}
      />

      {activeConversationData && (
        <>
          <WorkspaceInviteDialog
            isOpen={workspaceInviteOpen}
            onClose={() => setWorkspaceInviteOpen(false)}
            recipientName={activeConversationData.otherParticipant.name}
            onSendInvite={handleSendWorkspaceInvite}
          />

          <ReportDialog
            isOpen={reportOpen}
            onClose={() => setReportOpen(false)}
            targetUserName={activeConversationData.otherParticipant.name}
            onSubmitReport={handleReport}
          />

          <BlockDialog
            isOpen={blockOpen}
            onClose={() => setBlockOpen(false)}
            targetUserName={activeConversationData.otherParticipant.name}
            onConfirmBlock={handleBlockUser}
          />
        </>
      )}

      {lightboxImage && (
        <ImageLightbox
          isOpen={true}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage.url}
          imageName={lightboxImage.name}
        />
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading Messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
