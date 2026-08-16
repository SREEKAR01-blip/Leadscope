'use client';

import { useState, useMemo } from 'react';
import { Store, Star, Award, MapPin, DollarSign, Briefcase, Search, Filter } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function FreelancerMarketplaceView() {
  const { freelancers } = useApp();
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const allSkills = useMemo(() => ['all', ...Array.from(new Set(freelancers.flatMap((f) => f.skills)))], [freelancers]);

  const filtered = useMemo(() => {
    return freelancers.filter((f) => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (skillFilter !== 'all' && !f.skills.includes(skillFilter)) return false;
      if (verifiedOnly && !f.verified) return false;
      return true;
    });
  }, [freelancers, search, skillFilter, verifiedOnly]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <Store className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Freelancer Marketplace</h1>
            <p className="text-sm text-slate-500">Hire verified freelancers for your projects</p>
          </div>
        </div>

        {/* Search & filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search freelancers or skills..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none"
          >
            {allSkills.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Skills' : s}</option>
            ))}
          </select>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              verifiedOnly ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <Award className="h-4 w-4" />
            Verified Only
          </button>
        </div>

        {/* Freelancer cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-sm font-semibold text-white">
                      {f.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    {f.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-slate-900">{f.name}</h3>
                      {f.verified && <Award className="h-3.5 w-3.5 text-blue-500" />}
                    </div>
                    <p className="text-xs text-slate-500">{f.title}</p>
                  </div>
                </div>
              </div>

              <p className="mb-3 text-xs leading-relaxed text-slate-600">{f.bio}</p>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {f.skills.map((s) => (
                  <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {f.rating.toFixed(1)} ({f.review_count})
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {f.projects_completed}
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {f.location}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  {f.hourly_rate}/hr
                </p>
                <button className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600">
                  Hire
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
