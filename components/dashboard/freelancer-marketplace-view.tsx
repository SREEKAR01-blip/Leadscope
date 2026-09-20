'use client';

import { useState, useMemo } from 'react';
import { Store, Star, Award, MapPin, DollarSign, Briefcase, Search, MessageSquare, CheckCircle2, X } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function FreelancerMarketplaceView() {
  const { freelancers, hireFreelancer, sendDirectMessage, setCurrentView } = useApp();
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Hire Modal states
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [contractAmount, setContractAmount] = useState('1500');
  const [milestonesCount, setMilestonesCount] = useState('2');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Message Modal states
  const [chatRecipient, setChatRecipient] = useState<string | null>(null);
  const [messageBody, setMessageBody] = useState('');

  const allSkills = useMemo(() => ['all', ...Array.from(new Set(freelancers.flatMap((f) => f.skills)))], [freelancers]);

  const filtered = useMemo(() => {
    return freelancers.filter((f) => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (skillFilter !== 'all' && !f.skills.includes(skillFilter)) return false;
      if (verifiedOnly && !f.verified) return false;
      return true;
    });
  }, [freelancers, search, skillFilter, verifiedOnly]);

  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFreelancer || !projectTitle) return;

    hireFreelancer(
      selectedFreelancer,
      projectTitle,
      parseFloat(contractAmount) || 1000,
      parseInt(milestonesCount) || 2
    );

    setToastMessage(`Successfully hired ${selectedFreelancer}! Escrow contract created.`);
    setSelectedFreelancer(null);
    setProjectTitle('');

    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatRecipient || !messageBody.trim()) return;

    sendDirectMessage(chatRecipient, messageBody.trim());
    setToastMessage(`Message sent to ${chatRecipient}!`);
    setChatRecipient(null);
    setMessageBody('');

    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50">
      {toastMessage && (
        <div className="fixed top-6 left-6 right-6 z-50 mx-auto max-w-md flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3.5 shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-xs font-bold text-green-900">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs text-green-700 hover:underline">Dismiss</button>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Freelancer Marketplace</h1>
              <p className="text-xs text-slate-500">Hire verified digital talent & fund secure escrow contracts</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('escrow-payments')}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Active Escrows
          </button>
        </div>

        {/* Search & filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search freelancers or skills..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 focus:outline-none"
          >
            {allSkills.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Skills' : s}</option>
            ))}
          </select>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
              verifiedOnly ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <Award className="h-4 w-4" />
            Verified Only
          </button>
        </div>

        {/* Freelancer cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                        {f.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      {f.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900">{f.name}</h3>
                        {f.verified && <Award className="h-3.5 w-3.5 text-blue-500" />}
                      </div>
                      <p className="text-xs text-slate-500">{f.title}</p>
                    </div>
                  </div>
                </div>

                <p className="mb-3 text-xs leading-relaxed text-slate-600">{f.bio}</p>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  {f.skills.map((s) => (
                    <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {f.rating.toFixed(1)} ({f.review_count})
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    {f.projects_completed} jobs
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {f.location}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="flex items-center gap-0.5 text-sm font-bold text-slate-900">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  {f.hourly_rate}/hr
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChatRecipient(f.name)}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    title="Send Message"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFreelancer(f.name);
                      setProjectTitle(`Web & Digital Marketing for ${f.name}`);
                    }}
                    className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500 shadow-sm"
                  >
                    Hire & Escrow
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hire Modal */}
      {selectedFreelancer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Hire {selectedFreelancer}</h3>
              <button onClick={() => setSelectedFreelancer(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleHireSubmit} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Project Title</label>
                <input
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Website Redesign & SEO Setup"
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Contract Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={contractAmount}
                    onChange={(e) => setContractAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Total Milestones</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    required
                    value={milestonesCount}
                    onChange={(e) => setMilestonesCount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Funds will be held safely in Escrow until you approve completed project milestones.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFreelancer(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl shadow-sm"
                >
                  Fund Escrow & Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {chatRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Message {chatRecipient}</h3>
              <button onClick={() => setChatRecipient(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSendMessageSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Your Message</label>
                <textarea
                  required
                  rows={4}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Ask a question or request a project quote..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setChatRecipient(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
