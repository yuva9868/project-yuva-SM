import { Project, FounderProfile } from './community-types';

export interface ProjectMatchResult {
  projectId: string;
  score: number; // 0 - 100
  reasons: string[];
  explanation: string;
}

export interface CollaboratorMatchResult {
  founder: FounderProfile;
  score: number; // 0 - 100
  matchedSkills: string[];
  matchedRole: string;
  explanation: string;
}

export function calculateProjectRelevance(
  project: Project,
  userProfile?: Partial<FounderProfile> | null
): ProjectMatchResult {
  if (!userProfile) {
    // Fallback ranking when no user is logged in
    const baseScore = Math.min(95, Math.round(
      (project.validationScore * 0.4) + 
      (Math.min(project.supportersCount, 500) / 500 * 30) + 
      ((project.prototypeLinks?.length || 0) > 0 ? 30 : 10)
    ));
    return {
      projectId: project.id,
      score: baseScore,
      reasons: ['Popular in Community', 'Active Prototype Available'],
      explanation: 'Ranked by community validation score and prototype availability.'
    };
  }

  const reasons: string[] = [];
  let score = 30; // base score

  const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
  const userInterests = (userProfile.interests || []).map(i => i.toLowerCase());
  const userCollab = userProfile.collaborationInterests || [];

  // 1. Requirements match
  const needsDev = project.requirements.includes('Looking for Developers') || project.requirements.includes('Looking for Co-founder');
  const needsDesigner = project.requirements.includes('Looking for Designers');
  const needsMentor = project.requirements.includes('Looking for Mentors');
  const needsInvestor = project.requirements.includes('Looking for Investment') || project.requirements.includes('Looking for Funding');
  const needsFeedback = project.requirements.includes('Looking for Feedback') || project.requirements.includes('Looking for Early Users');

  const isDev = userSkills.some(s => ['typescript', 'react', 'next.js', 'python', 'node.js', 'rust', 'system architecture'].includes(s));
  const isDesigner = userSkills.some(s => ['figma', 'ui/ux design', 'design systems', 'tailwind css'].includes(s));

  if (needsDev && (isDev || userCollab.includes('Developer') || userCollab.includes('Co-founder'))) {
    score += 25;
    reasons.push('Founder is looking for technical / developer collaboration');
  }

  if (needsDesigner && (isDesigner || userCollab.includes('Designer'))) {
    score += 25;
    reasons.push('Founder is seeking a design co-founder / UI specialist');
  }

  if (needsInvestor && (userCollab.includes('Investor') || userProfile.verifiedType === 'Investor')) {
    score += 30;
    reasons.push('Founder is raising capital and seeking angel / seed investment');
  }

  if (needsMentor && (userCollab.includes('Mentor') || userProfile.verifiedType === 'Mentor')) {
    score += 25;
    reasons.push('Project owner is seeking an experienced domain advisor');
  }

  // 2. Industry / Category Interest match
  const catMatch = userInterests.some(i => 
    project.category.toLowerCase().includes(i) || 
    project.industry.toLowerCase().includes(i) ||
    i.includes(project.category.toLowerCase())
  );
  if (catMatch) {
    score += 20;
    reasons.push(`Matches your interest in ${project.category}`);
  }

  // 3. Stage & Prototype readiness
  if ((project.prototypeLinks?.length || 0) > 0 || (project.prototypeMedia?.length || 0) > 0) {
    score += 15;
    reasons.push('Working prototype available for testing');
  }

  score = Math.min(99, Math.max(35, score));

  let explanation = reasons.length > 0
    ? `Recommended because: ${reasons.join(' • ')}`
    : 'Discoverable project in your ecosystem.';

  return {
    projectId: project.id,
    score,
    reasons,
    explanation
  };
}

export function findMatchingCollaborators(
  project: Project,
  founders: FounderProfile[]
): CollaboratorMatchResult[] {
  const results: CollaboratorMatchResult[] = [];

  for (const founder of founders) {
    if (founder.id === project.founderId) continue;

    let score = 20;
    const matchedSkills: string[] = [];
    let matchedRole = 'Community Member';

    const founderSkills = (founder.skills || []).map(s => s.toLowerCase());
    const founderCollab = founder.collaborationInterests || [];

    // Check Developer match
    if (project.requirements.includes('Looking for Developers') || project.requirements.includes('Looking for Co-founder')) {
      const devSkills = founder.skills.filter(s => 
        ['typescript', 'next.js', 'react', 'python', 'node.js', 'system architecture', 'rust', 'webgl'].some(tech => s.toLowerCase().includes(tech))
      );
      if (devSkills.length > 0 || founderCollab.includes('Developer') || founderCollab.includes('Co-founder')) {
        score += 35;
        matchedRole = 'Developer / Co-founder';
        matchedSkills.push(...devSkills);
      }
    }

    // Check Designer match
    if (project.requirements.includes('Looking for Designers')) {
      const designSkills = founder.skills.filter(s => 
        ['figma', 'ui/ux design', 'design systems', 'tailwind css'].some(ds => s.toLowerCase().includes(ds))
      );
      if (designSkills.length > 0 || founderCollab.includes('Designer')) {
        score += 35;
        matchedRole = 'Designer / UI Architect';
        matchedSkills.push(...designSkills);
      }
    }

    // Check Investor match
    if (project.requirements.includes('Looking for Investment') || project.requirements.includes('Looking for Funding')) {
      if (founderCollab.includes('Investor') || founder.verifiedType === 'Investor') {
        score += 40;
        matchedRole = 'Angel Investor / Capital Partner';
        matchedSkills.push('Venture Funding', 'Capital Allocation');
      }
    }

    // Check Mentor match
    if (project.requirements.includes('Looking for Mentors')) {
      if (founderCollab.includes('Mentor') || founder.verifiedType === 'Mentor') {
        score += 30;
        matchedRole = 'Strategic Advisor';
        matchedSkills.push('Startup Advisory', 'Go-To-Market');
      }
    }

    // Category interest overlap
    const interestMatch = founder.interests.some(i => 
      project.category.toLowerCase().includes(i.toLowerCase()) || 
      project.industry.toLowerCase().includes(i.toLowerCase())
    );
    if (interestMatch) {
      score += 15;
    }

    // Reputation bonus
    if (founder.credibility?.identity === 'verified') score += 10;
    if (founder.credibility?.skill === 'verified') score += 10;

    score = Math.min(98, score);

    if (score >= 45) {
      results.push({
        founder,
        score,
        matchedSkills: Array.from(new Set(matchedSkills)),
        matchedRole,
        explanation: `${founder.name} has proven expertise in ${matchedSkills.slice(0, 3).join(', ') || 'startup growth'} and is open to ${founder.collaborationStatus}.`
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
