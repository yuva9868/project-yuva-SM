'use client';

import React from 'react';
import Link from 'next/link';
import { Message, MessageAttachment } from '@/lib/messaging-types';
import { 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Reply, 
  Copy, 
  Trash2, 
  RotateCcw, 
  ExternalLink, 
  Sparkles, 
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onRetry?: (message: Message) => void;
  onOpenImage?: (imageUrl: string, imageName?: string) => void;
  onAcceptWorkspaceInvite?: (messageId: string) => Promise<void>;
  onDeclineWorkspaceInvite?: (messageId: string) => Promise<void>;
}

// Helper to safely parse and linkify URLs in text
function renderMessageContentWithLinks(content: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-foreground font-medium underline underline-offset-2 hover:opacity-85 inline-flex items-center gap-0.5 break-all"
          onClick={e => e.stopPropagation()}
        >
          <span>{part}</span>
          <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function formatMessageTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function MessageBubble({
  message,
  isMe,
  onReply,
  onDelete,
  onRetry,
  onOpenImage,
  onAcceptWorkspaceInvite,
  onDeclineWorkspaceInvite,
}: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);
  const [isRespondingToInvite, setIsRespondingToInvite] = React.useState(false);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isDeleted = Boolean(message.deletedAt);
  const isSystem = message.messageType === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="px-3 py-1 rounded-full bg-muted/60 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>{message.content}</span>
          <span className="text-[10px] text-muted-foreground/60">• {formatMessageTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex flex-col my-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
      {/* Outer row with avatar & bubble */}
      <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Recipient avatar */}
        {!isMe && (
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-border bg-muted">
            <img
              src={message.senderAvatar || `https://avatar.vercel.sh/${message.senderName}?s=96`}
              alt={message.senderName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Bubble container */}
        <div className="flex flex-col relative">
          {/* Quoted Reply reference */}
          {message.replyTo && (
            <div
              className={`text-[11px] px-3 py-1.5 rounded-t-xl border border-b-0 max-w-full truncate ${
                isMe
                  ? 'bg-primary/20 border-primary/30 text-primary-foreground/90'
                  : 'bg-muted/70 border-border text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold text-[10px] opacity-80">
                <Reply className="w-3 h-3" />
                <span>Replying to {message.replyTo.senderName}</span>
              </div>
              <p className="truncate italic">{message.replyTo.content}</p>
            </div>
          )}

          {/* Main Bubble */}
          <div
            className={`px-3.5 py-2.5 rounded-2xl shadow-sm text-sm relative transition-all ${
              message.replyTo ? 'rounded-t-none' : ''
            } ${
              isDeleted
                ? 'bg-muted/40 border border-border/50 text-muted-foreground italic'
                : isMe
                ? 'bg-primary text-primary-foreground font-normal rounded-br-xs'
                : 'bg-card border border-border/80 text-foreground rounded-bl-xs'
            }`}
          >
            {/* Sender name for received messages in group or clarity */}
            {!isMe && !isDeleted && (
              <p className="text-[11px] font-bold text-primary mb-1">{message.senderName}</p>
            )}

            {/* Plain text / linkified content */}
            {message.content && (
              <div className="leading-relaxed whitespace-pre-wrap break-words">
                {isMe ? renderMessageContentWithLinks(message.content) : (
                  <span className="text-foreground">
                    {renderMessageContentWithLinks(message.content)}
                  </span>
                )}
              </div>
            )}

            {/* Attachments Section */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-2.5 mt-2">
                {message.attachments.map((att, idx) => {
                  // 1. PROJECT SHARE ATTACHMENT CARD
                  if (att.type === 'project' && att.projectData) {
                    const p = att.projectData;
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3 mt-1.5 transition-all text-left ${
                          isMe 
                            ? 'bg-black/20 border-white/20 text-white' 
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted/70'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-primary">
                            {p.logoUrl ? (
                              <img src={p.logoUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Sparkles className="w-6 h-6" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm truncate">{p.name}</span>
                              <Badge variant="outline" className={`text-[10px] py-0 px-1.5 h-4 ${isMe ? 'border-white/30 text-white' : 'border-primary/30 text-primary'}`}>
                                {p.stage}
                              </Badge>
                            </div>
                            <p className="text-xs opacity-90 line-clamp-2 mt-0.5">{p.tagline}</p>
                            <p className="text-[11px] opacity-75 mt-1">Founder: {p.founderName}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/10 flex justify-end">
                          <Link href={p.url || `/community/${p.id}`} target="_blank">
                            <Button
                              size="sm"
                              variant={isMe ? 'secondary' : 'default'}
                              className="h-7 text-xs font-semibold gap-1.5 shadow-sm"
                            >
                              <span>View in Community</span>
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  // 2. WORKSPACE INVITATION CARD
                  if (att.type === 'workspace_invite' && att.workspaceInviteData) {
                    const ws = att.workspaceInviteData;
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3 mt-1.5 transition-all text-left ${
                          isMe 
                            ? 'bg-black/20 border-white/20 text-white' 
                            : 'bg-primary/5 border-primary/30 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold tracking-wide uppercase">Workspace Invitation</span>
                        </div>
                        <p className="font-bold text-sm">{ws.workspaceName}</p>
                        <p className="text-xs opacity-85 mt-0.5">Role offered: <span className="font-semibold">{ws.role}</span></p>
                        {ws.description && <p className="text-xs opacity-75 italic line-clamp-2 mt-1">{ws.description}</p>}

                        <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            ws.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                            ws.status === 'declined' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {ws.status === 'accepted' ? '✓ Joined Workspace' : ws.status === 'declined' ? 'Declined' : 'Pending Response'}
                          </span>

                          {!isMe && ws.status === 'pending' && (
                            <div className="flex items-center gap-1.5">
                              {onDeclineWorkspaceInvite && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={isRespondingToInvite}
                                  onClick={async () => {
                                    setIsRespondingToInvite(true);
                                    await onDeclineWorkspaceInvite(message.id);
                                    setIsRespondingToInvite(false);
                                  }}
                                  className="h-7 text-xs text-rose-400 hover:text-rose-300"
                                >
                                  Decline
                                </Button>
                              )}
                              {onAcceptWorkspaceInvite && (
                                <Button
                                  size="sm"
                                  disabled={isRespondingToInvite}
                                  onClick={async () => {
                                    setIsRespondingToInvite(true);
                                    await onAcceptWorkspaceInvite(message.id);
                                    setIsRespondingToInvite(false);
                                  }}
                                  className="h-7 text-xs font-bold bg-primary text-primary-foreground gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept & Join</span>
                                </Button>
                              )}
                            </div>
                          )}

                          {ws.status === 'accepted' && (
                            <Link href={`/workspaces/${ws.workspaceId}`}>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 font-semibold">
                                <span>Open Workspace</span>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // 3. IMAGE ATTACHMENT
                  if (att.type === 'image' && att.url) {
                    return (
                      <div
                        key={idx}
                        className="rounded-xl overflow-hidden border border-border/50 max-w-sm cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => onOpenImage && onOpenImage(att.url!, att.name)}
                      >
                        <img src={att.url} alt={att.name || 'Attachment'} className="w-full h-auto max-h-60 object-cover" />
                        {att.name && (
                          <div className="p-1.5 bg-black/40 text-[10px] text-zinc-300 truncate">
                            {att.name}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* Time & Delivery Status indicators */}
            <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isMe ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
              <span>{formatMessageTime(message.createdAt)}</span>
              {isMe && (
                <span className="ml-0.5">
                  {message.status === 'sending' && <Clock className="w-3 h-3 animate-spin" />}
                  {message.status === 'sent' && <Check className="w-3 h-3" />}
                  {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                  {message.status === 'read' && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                  {message.status === 'failed' && (
                    <button onClick={() => onRetry && onRetry(message)} title="Retry sending" className="text-rose-400 hover:underline">
                      <AlertCircle className="w-3 h-3 inline" />
                    </button>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover Action Toolbar */}
        {!isDeleted && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-card/90 backdrop-blur-md border border-border/70 rounded-lg p-0.5 shadow-md">
            {onReply && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onReply(message)}
                title="Reply"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <Reply className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy message'}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            {isMe && onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(message.id)}
                title="Unsend / Delete"
                className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
