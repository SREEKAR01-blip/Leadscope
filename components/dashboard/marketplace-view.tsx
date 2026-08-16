'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Store,
  Clock,
  DollarSign,
  Users,
  MapPin,
  ArrowRight,
  Filter,
  Plus,
  X,
  Sparkles,
  Lock,
  Timer,
  Award,
  Star,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Target,
  Zap,
  Send,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { Project, FreelancerProfile } from '@/lib/marketplace-data';
import { cn } from '@/lib/utils';

// AI Matchmaking Score calculation
function calculateMatchScore(project: Project, freelancer: FreelancerProfile): number {
  let score = 50; // Base score

  // Skill alignment (up to 30 points)
  const projectCategoryLower = project.category.toLowerCase();
  const skillMap: Record<string, string[]> = {
    'web development': ['react', 'next.js', 'node.js', 'supabase', 'typescript'],
    'e-commerce': ['shopify', 'liquid', 'klaviyo', 'css'],
    'local seo': ['seo', 'google ads', 'gmb', 'content'],
    'branding & design': ['figma', 'branding', 'webflow', 'illustration'],
    'mobile development': ['react native', 'flutter', 'firebase', 'typescript'],
  };
  const requiredSkills = skillMap[projectCategoryLower] ?? [];
  const matchedSkills = freelancer.skills.filter((s) =>
    requiredSkills.some((r) => s.toLowerCase().includes(r.toLowerCase()))
  );
  score += (matchedSkills.length / Math.max(requiredSkills.length, 1)) * 30;

  // Rating factor (up to 10 points)
  score += (freelancer.rating / 5) * 10;

  // Experience factor (up to 10 points)
  score += Math.min(freelancer.projects_completed / 100, 1) * 10;

  return Math.min(Math.round(score), 100);
}

function useCountdown(hours: number) {
  const [remaining, setRemaining] = useState(hours * 3600);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const hrs = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  return { hrs, mins, secs, remaining };
}

function CountdownTimer({ hours }: { hours: number }) {
  const { hrs, mins, secs } = useCountdown(hours);
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5">
      <Timer className="h-3.5 w-3.5 text-amber-500" />
      <span className="font-mono text-xs font-bold text-amber-600">
        {hrs}h {mins}m {secs}s
      </span>
      <span className="text-[11px] text-amber-600">remaining</span>
    </div>
  );
}

function MatchCard({ project, freelancer, rank }: { project: Project; freelancer: FreelancerProfile; rank: number }) {
  const score = useMemo(() => calculateMatchScore(project, freelancer), [project, freelancer]);
  const [locked, setLocked] = useState(false);

  const rankConfig = {
    1: { color: 'text-amber-500', bg: 'bg-amber-50', label: 'Best Match', icon: Award },
    2: { color: 'text-slate-500', bg: 'bg-slate-50', label: 'Great Fit', icon: Star },
    3: { color: 'text-orange-500', bg: 'bg-orange-50', label: 'Good Option', icon: Target },
  };
  const cfg = rankConfig[rank as 1 | 2 | 3];
  const RankIcon = cfg.icon;

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border-2 bg-white p-4 transition-all',
      rank === 1 ? 'border-amber-300 shadow-md' : 'border-slate-200 hover:shadow-sm'
    )}>
      {rank === 1 && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Top Match
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-sm font-semibold text-white">
            {freelancer.name.split(' ').map((n) => n[0]).join('')}
          </div>
          {freelancer.online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">{freelancer.name}</h4>
            {freelancer.verified && <Award className="h-3.5 w-3.5 text-blue-500" />}
          </div>
          <p className="text-xs text-slate-500">{freelancer.title}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {freelancer.skills.slice(0, 4).map((s) => (
              <span key={s} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{s}</span>
            ))}
          </div>
        </div>
        {/* AI Match Score */}
        <div className="flex flex-col items-center">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', cfg.bg)}>
            <span className={cn('text-sm font-bold', cfg.color)}>{score}</span>
          </div>
          <span className="mt-1 text-[10px] font-medium text-slate-400">Match</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-600">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {freelancer.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <Briefcase className="h-3 w-3 text-slate-400" />
            {freelancer.projects_completed}
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <DollarSign className="h-3 w-3 text-slate-400" />
            {freelancer.hourly_rate}/hr
          </span>
        </div>
        {locked ? (
          <div className="flex items-center gap-2">
            <CountdownTimer hours={48} />
            <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          </div>
        ) : (
          <button
            onClick={() => setLocked(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
          >
            <Lock className="h-3.5 w-3.5" />
            Lock Lead
          </button>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  freelancers,
  onPostProject,
}: {
  project: Project;
  freelancers: FreelancerProfile[];
  onPostProject: () => void;
}) {
  const [showMatches, setShowMatches] = useState(false);

  // Calculate top 3 matches
  const topMatches = useMemo(() => {
    return freelancers
      .map((f) => ({ freelancer: f, score: calculateMatchScore(project, f) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [project, freelancers]);

  const statusColors = {
    open: 'bg-green-50 text-green-600',
    awarded: 'bg-amber-50 text-amber-600',
    completed: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{project.title}</h3>
          <p className="text-xs text-slate-500">{project.business_name}</p>
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize', statusColors[project.status])}>
          {project.status}
        </span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-slate-600">{project.description}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">{project.category}</span>
        <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          <MapPin className="h-3 w-3" />{project.location}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-[11px] text-slate-400">Budget</p>
          <p className="text-sm font-semibold text-slate-900">
            {project.budget_min.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} – {project.budget_max.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Bids</p>
          <p className="text-sm font-semibold text-slate-900">{project.bids_count}</p>
        </div>
        <button
          onClick={() => setShowMatches(!showMatches)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Matches
        </button>
      </div>

      {/* AI Matchmaking */}
      {showMatches && (
        <div className="mt-4 space-y-3 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">AI Matchmaking — Top 3 Freelancers</p>
              <p className="text-[11px] text-slate-500">Ranked by skills alignment, rating, and experience</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {topMatches.map((match, i) => (
              <MatchCard key={match.freelancer.id} project={project} freelancer={match.freelancer} rank={i + 1} />
            ))}
          </div>
          {/* Lead Ownership Protection */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-xs font-semibold text-amber-700">Lead Ownership Protection</p>
              <p className="text-[11px] text-amber-600">
                When a freelancer locks a lead, they get exclusive access for 48 hours to prevent spam bids.
                A countdown timer shows the remaining lock period.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostProjectModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (p: Project) => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const categories = ['Web Development', 'E-commerce', 'Local SEO', 'Branding & Design', 'Mobile Development'];

  const handleSubmit = () => {
    if (!title || !description || !budgetMin || !budgetMax) return;
    const project: Project = {
      id: `prj-${Date.now()}`,
      title,
      business_name: 'Your Business',
      category,
      budget_min: Number(budgetMin),
      budget_max: Number(budgetMax),
      description,
      bids_count: 0,
      posted_at: new Date().toISOString(),
      status: 'open',
      location: location || 'Hyderabad, IN',
    };
    onSubmit(project);
  };

  const canSubmit = title && description && budgetMin && budgetMax;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Plus className="h-5 w-5 text-emerald-500" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Post a Project</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Project Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Need modern online booking website for Dental Clinic"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none"
              >
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Gachibowli, Hyderabad"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Min Budget (₹)</label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="25000"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Max Budget (₹)</label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="50000"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project requirements, timeline, and any specific needs..."
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Post Project
          </button>
        </div>
      </div>
    </>
  );
}

export function MarketplaceView() {
  const { projects, bids, freelancers } = useApp();
  const [allProjects, setAllProjects] = useState<Project[]>(projects);
  const [filter, setFilter] = useState<'all' | 'open' | 'awarded' | 'completed'>('all');
  const [category, setCategory] = useState<string>('all');
  const [showPostModal, setShowPostModal] = useState(false);

  const categories = useMemo(() => ['all', ...Array.from(new Set(allProjects.map((p) => p.category)))], [allProjects]);

  const filtered = useMemo(() => {
    return allProjects.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (category !== 'all' && p.category !== category) return false;
      return true;
    });
  }, [allProjects, filter, category]);

  const stats = useMemo(() => ({
    total: allProjects.length,
    open: allProjects.filter((p) => p.status === 'open').length,
    awarded: allProjects.filter((p) => p.status === 'awarded').length,
    completed: allProjects.filter((p) => p.status === 'completed').length,
    totalBids: bids.length,
  }), [allProjects, bids]);

  const handlePostProject = useCallback((project: Project) => {
    setAllProjects((prev) => [project, ...prev]);
    setShowPostModal(false);
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Store className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Marketplace Projects</h1>
              <p className="text-sm text-slate-500">Post projects and find the best freelancers with AI matchmaking</p>
            </div>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Post a Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Projects', value: stats.total, icon: Store, color: 'text-blue-500' },
            { label: 'Open', value: stats.open, icon: Clock, color: 'text-green-500' },
            { label: 'Awarded', value: stats.awarded, icon: Users, color: 'text-amber-500' },
            { label: 'Total Bids', value: stats.totalBids, icon: DollarSign, color: 'text-purple-500' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', s.color)} />
                  <span className="text-xs font-medium text-slate-500">{s.label}</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5">
            {(['all', 'open', 'awarded', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  filter === f ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Project cards */}
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} freelancers={freelancers} onPostProject={() => setShowPostModal(true)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <Store className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No projects found</p>
            <button onClick={() => setShowPostModal(true)} className="text-sm font-semibold text-blue-500 hover:underline">
              Post the first project
            </button>
          </div>
        )}
      </div>

      {/* Post Project Modal */}
      {showPostModal && <PostProjectModal onClose={() => setShowPostModal(false)} onSubmit={handlePostProject} />}
    </div>
  );
}
