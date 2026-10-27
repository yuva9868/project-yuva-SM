'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, Send } from 'lucide-react';
import { getStoredProjects } from '@/lib/community-data';
import { Project } from '@/lib/community-types';
import { ProjectContextSummary } from '@/lib/messaging-types';

interface ShareProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectContextSummary) => void;
}

export function ShareProjectDialog({ isOpen, onClose, onSelectProject }: ShareProjectDialogProps) {
  const [search, setSearch] = useState('');
  const allProjects = getStoredProjects();

  const filtered = allProjects.filter(p => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
           p.tagline.toLowerCase().includes(q) ||
           p.founderName.toLowerCase().includes(q) ||
           p.category.toLowerCase().includes(q);
  });

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Share Community Project</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Share a validated project card in this conversation so both of you can review details, prototypes, and milestones.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, category, or founder..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-background/50 text-sm h-9"
          />
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-muted-foreground">No projects found.</p>
          ) : (
            filtered.map(proj => (
              <div
                key={proj.id}
                className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-primary/40 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-primary">
                    {proj.logoUrl ? (
                      <img src={proj.logoUrl} alt={proj.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{proj.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-sm text-foreground truncate">{proj.name}</p>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-primary/30 text-primary">
                        {proj.stage}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{proj.tagline}</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">By {proj.founderName}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    onSelectProject({
                      id: proj.id,
                      name: proj.name,
                      tagline: proj.tagline,
                      stage: proj.stage,
                      founderId: proj.founderId,
                      founderName: proj.founderName,
                      founderAvatar: proj.founderAvatar,
                      logoUrl: proj.logoUrl,
                      category: proj.category,
                      url: `/community/${proj.id}`,
                    });
                    onClose();
                  }}
                  className="gap-1.5 h-8 text-xs font-semibold flex-shrink-0 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Share</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
