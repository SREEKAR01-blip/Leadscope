'use client';

import { useState } from 'react';
import { Wallet, ArrowUpRight, Clock, CheckCircle, AlertCircle, Plus, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function EscrowPaymentsView() {
  const { escrowContracts, releaseEscrowMilestone, hireFreelancer } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [freelancerName, setFreelancerName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [amount, setAmount] = useState('1000');
  const [milestones, setMilestones] = useState('2');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalFunded = escrowContracts
    .filter((e) => e.status === 'funded' || e.status === 'in_progress')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalReleased = escrowContracts
    .filter((e) => e.status === 'released')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleCreateEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelancerName || !projectTitle) return;

    hireFreelancer(freelancerName, projectTitle, parseFloat(amount) || 500, parseInt(milestones) || 2);
    setShowCreateModal(false);
    setFreelancerName('');
    setProjectTitle('');
    setToastMessage(`Escrow contract funded for ${projectTitle}!`);

    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRelease = (contractId: string, title: string) => {
    releaseEscrowMilestone(contractId);
    setToastMessage(`Milestone payment released for ${title}!`);
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

      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Escrow Payments</h1>
              <p className="text-xs text-slate-500">Manage funded projects and milestone releases</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" /> Create Escrow
          </button>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalFunded.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Currently in Escrow</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalReleased.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Funds Released</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Wallet className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">${(totalFunded + totalReleased).toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Contract Volume</p>
          </div>
        </div>

        {/* Contracts List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Active Escrow Contracts</h3>
          <div className="space-y-3">
            {escrowContracts.map((e) => {
              const statusConfig = {
                funded: { label: 'Funded', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
                in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50', icon: ArrowUpRight },
                released: { label: 'Released', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
                disputed: { label: 'Disputed', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
              };
              const cfg = statusConfig[e.status];
              const StatusIcon = cfg.icon;
              const progress = Math.round((e.milestone_current / e.milestone_total) * 100);

              return (
                <div key={e.id} className="rounded-xl border border-slate-100 p-4 bg-slate-50/40">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{e.project_title}</p>
                      <p className="text-xs text-slate-500">Freelancer: {e.freelancer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">${e.amount.toLocaleString()}</p>
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase', cfg.bg, cfg.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Milestone Progress</span>
                    <span className="font-bold text-slate-700">{e.milestone_current} of {e.milestone_total} completed</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={cn('h-full rounded-full transition-all duration-300', e.status === 'released' ? 'bg-green-500' : 'bg-blue-500')}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {e.status !== 'released' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleRelease(e.id, e.project_title)}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500 shadow-sm"
                      >
                        Release Milestone Payment
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Escrow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Create New Escrow Contract</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEscrow} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Freelancer Name</label>
                <input
                  required
                  value={freelancerName}
                  onChange={(e) => setFreelancerName(e.target.value)}
                  placeholder="e.g. Alex Webster"
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Project Title</label>
                <input
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Mobile App Optimization"
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Contract Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Milestones</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    required
                    value={milestones}
                    onChange={(e) => setMilestones(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Deposit & Fund Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
