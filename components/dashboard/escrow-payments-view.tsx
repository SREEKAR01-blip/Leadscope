'use client';

import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function EscrowPaymentsView() {
  const { escrowContracts } = useApp();

  const totalFunded = escrowContracts
    .filter((e) => e.status === 'funded' || e.status === 'in_progress')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalReleased = escrowContracts
    .filter((e) => e.status === 'released')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <Wallet className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Escrow Payments</h1>
            <p className="text-sm text-slate-500">Manage funded projects and milestone releases</p>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalFunded.toLocaleString()}</p>
            <p className="text-xs text-slate-500">In Escrow</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalReleased.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Released</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Wallet className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">${(totalFunded + totalReleased).toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Volume</p>
          </div>
        </div>

        {/* Contracts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Active Contracts</h3>
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
              const progress = (e.milestone_current / e.milestone_total) * 100;

              return (
                <div key={e.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{e.project_title}</p>
                      <p className="text-xs text-slate-500">{e.freelancer_name} → {e.business_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">${e.amount.toLocaleString()}</p>
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium', cfg.bg, cfg.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Milestone Progress</span>
                    <span className="font-semibold text-slate-700">{e.milestone_current} / {e.milestone_total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn('h-full rounded-full transition-all', e.status === 'released' ? 'bg-green-500' : 'bg-blue-500')}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {e.status === 'in_progress' && (
                    <div className="mt-3 flex gap-2">
                      <button className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600">
                        Release Milestone
                      </button>
                      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
