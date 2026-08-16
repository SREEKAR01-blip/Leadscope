'use client';

import { useMemo, useState } from 'react';
import { LayoutDashboard, TrendingUp, Globe, Star, AlertCircle, DollarSign, FileText, Clock, Plus, X } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function BusinessDashboardView() {
  const { leads, proposals, escrowContracts, messages, postJob } = useApp();

  // Job Posting Modal States
  const [showPostJob, setShowPostJob] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobShift, setJobShift] = useState<'Morning Shift' | 'Evening Shift' | 'Night Shift'>('Morning Shift');
  const [jobDesc, setJobDesc] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [jobType, setJobType] = useState<'Part Time' | 'Full Time' | 'Internship'>('Full Time');
  const [jobVacancies, setJobVacancies] = useState('1');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postJob({
      title: jobTitle,
      salary: jobSalary,
      shiftTiming: jobShift,
      description: jobDesc,
      skillsRequired: jobSkills.split(',').map((s) => s.trim()).filter(Boolean),
      jobType,
      vacancies: parseInt(jobVacancies) || 1
    });

    setShowPostJob(false);
    setShowSuccessToast(true);
    
    // Clear state
    setJobTitle('');
    setJobSalary('');
    setJobDesc('');
    setJobSkills('');
    setJobVacancies('1');

    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const stats = useMemo(() => {
    const myLeads = leads.slice(0, 5);
    const avgScore = myLeads.length > 0
      ? Math.round(myLeads.reduce((sum, l) => sum + l.digital_score, 0) / myLeads.length)
      : 0;
    const missingWeb = myLeads.filter((l) => !l.website).length;
    const activeEscrow = escrowContracts.filter((e) => e.status === 'in_progress' || e.status === 'funded').length;
    const unreadMsgs = messages.filter((m) => !m.read).length;
    return { avgScore, missingWeb, activeEscrow, unreadMsgs, totalLeads: myLeads.length };
  }, [leads, escrowContracts, messages]);

  const cards = [
    { label: 'Digital Score', value: `${stats.avgScore}/100`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Missing Websites', value: String(stats.missingWeb), icon: Globe, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Active Escrow', value: String(stats.activeEscrow), icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Unread Messages', value: String(stats.unreadMsgs), icon: FileText, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      {showSuccessToast && (
        <div className="absolute left-6 right-6 top-6 z-[1000] flex items-center justify-between rounded-xl border border-green-200 bg-green-50/95 p-3.5 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-xs font-semibold text-green-900">Job Posted Successfully!</p>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-xs text-green-700 hover:underline">Dismiss</button>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <LayoutDashboard className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Business Dashboard</h1>
              <p className="text-sm text-slate-500">Monitor your digital presence and active engagements</p>
            </div>
          </div>
          <button
            onClick={() => setShowPostJob(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500 self-start sm:self-center"
          >
            <Plus className="h-4 w-4" /> Post a New Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', c.bg)}>
                  <Icon className={cn('h-4 w-4', c.color)} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                <p className="text-xs text-slate-500">{c.label}</p>
              </div>
            );
          })}
        </div>

        {/* Digital score breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Your Business Listings</h3>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 rounded-lg border border-slate-100 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                  {lead.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.category} · {lead.city}</p>
                </div>
                <div className="flex items-center gap-3">
                  {lead.rating != null && (
                    <span className="flex items-center gap-1 text-xs text-slate-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {lead.rating.toFixed(1)}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          lead.digital_score >= 75 ? 'bg-green-500' : lead.digital_score >= 50 ? 'bg-blue-500' : lead.digital_score >= 30 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${lead.digital_score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{lead.digital_score}</span>
                  </div>
                  {!lead.website && (
                    <span className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                      <AlertCircle className="h-3 w-3" /> No website
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active proposals */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Active Proposals</h3>
            <div className="space-y-2">
              {proposals.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.scope.slice(0, 50)}...</p>
                    <p className="text-xs text-slate-500">{p.freelancer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">${p.amount.toLocaleString()}</p>
                    <span className={cn(
                      'text-[11px] font-medium capitalize',
                      p.status === 'accepted' ? 'text-green-600' : p.status === 'viewed' ? 'text-blue-600' : 'text-slate-400'
                    )}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Escrow Contracts</h3>
            <div className="space-y-2">
              {escrowContracts.map((e) => (
                <div key={e.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{e.project_title}</p>
                    <p className="text-sm font-semibold text-slate-900">${e.amount.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      Milestone {e.milestone_current}/{e.milestone_total}
                    </span>
                    <span className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
                      e.status === 'released' ? 'bg-green-50 text-green-600' : e.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    )}>{e.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Post a New Job Opportunity</h3>
              <button onClick={() => setShowPostJob(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Job Title</label>
                  <input
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Restaurant Helper"
                    className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Salary Range</label>
                  <input
                    required
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    placeholder="e.g. ₹20,000/mo"
                    className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Skills Required (comma-separated)</label>
                <input
                  required
                  value={jobSkills}
                  onChange={(e) => setJobSkills(e.target.value)}
                  placeholder="e.g. Prep Work, Food Safety, Hygiene"
                  className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Shift Timing</label>
                  <select
                    value={jobShift}
                    onChange={(e) => setJobShift(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none"
                  >
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Evening Shift">Evening Shift</option>
                    <option value="Night Shift">Night Shift</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Vacancies</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={jobVacancies}
                    onChange={(e) => setJobVacancies(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Job Description</label>
                <textarea
                  required
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  rows={3}
                  placeholder="Describe the job duties and qualifications..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostJob(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
