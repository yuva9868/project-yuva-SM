'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { INITIAL_FOUNDERS, getStoredFounders } from '@/lib/community-data';
import { FounderProfile } from '@/lib/community-types';
import { User } from '@/lib/auth-context';

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSelectUser: (targetUser: FounderProfile) => void;
}

export function NewChatDialog({ isOpen, onClose, currentUser, onSelectUser }: NewChatDialogProps) {
  const [search, setSearch] = useState('');
  const founders = getStoredFounders();

  // Exclude current user from the list
  const eligibleFounders = founders.filter(f => f.id !== currentUser?.id);

  const filtered = eligibleFounders.filter(f => {
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) ||
           f.username.toLowerCase().includes(q) ||
           f.skills.some(s => s.toLowerCase().includes(q)) ||
           f.bio.toLowerCase().includes(q);
  });

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>New Direct Message</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Search founders, developers, designers, mentors, and investors in the IdeaCheck AI ecosystem.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, handle, skills (e.g. Next.js, ML)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-background/50 text-sm h-9"
          />
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-muted-foreground">No community members found.</p>
          ) : (
            filtered.map(founder => (
              <div
                key={founder.id}
                onClick={() => {
                  onSelectUser(founder);
                  onClose();
                }}
                className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/60 hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-border relative">
                    <img src={founder.avatar} alt={founder.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm text-foreground truncate">{founder.name}</p>
                      {founder.badges?.includes('Verified Founder') && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary fill-primary/20 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">@{founder.username} • {founder.location}</p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {founder.skills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-primary group-hover:bg-primary group-hover:text-primary-foreground font-semibold rounded-lg">
                  Chat
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
