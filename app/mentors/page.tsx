'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MentorProfile } from '@/lib/community-types';
import { getStoredMentors } from '@/lib/community-data';
import { MentorRequestModal } from '@/components/community/mentor-request-modal';
import { 
  Users, 
  Search, 
  Award, 
  Star, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Linkedin,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<MentorProfile[]>(() => getStoredMentors());
  const [search, setSearch] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [activeMentor, setActiveMentor] = useState<MentorProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredMentors = mentors.filter(m => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchBio = m.bio.toLowerCase().includes(q);
      const matchExp = m.expertise.some(e => e.toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchExp) return false;
    }
    if (selectedExpertise !== 'all') {
      if (!m.expertise.includes(selectedExpertise)) return false;
    }
    return true;
  });

  const allExpertise = Array.from(new Set(mentors.flatMap(m => m.expertise)));

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-16">
      <Header />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Expert Circles & Advisory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">Startup Mentors & Office Hours</h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Connect with experienced operators, venture partners, and technical advisors offering guidance to early-stage founders.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors by name, background, or expertise..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 text-xs rounded-xl h-10 bg-card"
            />
          </div>
          <select
            value={selectedExpertise}
            onChange={e => setSelectedExpertise(e.target.value)}
            className="p-2.5 bg-card border border-border rounded-xl text-xs text-foreground sm:w-64"
          >
            <option value="all">All Expertise Areas</option>
            {allExpertise.map(exp => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
        </div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map(mentor => (
            <Card key={mentor.id} className="p-6 bg-card border-border hover:border-primary/50 transition-all rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={mentor.avatar} alt={mentor.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20" />
                    <div>
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        {mentor.name}
                        {mentor.isVerifiedMentor && (
                          <span title="Verified Mentor">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{mentor.title}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {mentor.bio}
                </p>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mentor.expertise.map(exp => (
                    <span key={exp} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-secondary-foreground">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom stats and booking button */}
              <div className="pt-3 border-t border-border/50 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <strong className="text-foreground">{mentor.rating}</strong> ({mentor.sessionsCount} sessions)
                  </span>
                  <span className="text-primary font-medium">{mentor.availability}</span>
                </div>

                <Button
                  onClick={() => { setActiveMentor(mentor); setModalOpen(true); }}
                  className="w-full rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Request Office Hours</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <MentorRequestModal
        mentor={activeMentor}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <MobileNav />
    </main>
  );
}
