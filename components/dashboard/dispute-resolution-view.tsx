'use client';

import { Scale, AlertCircle, DollarSign, Clock, Search, Gavel } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function DisputeResolutionView() {
  const { disputes } = useApp();
  const [filter, setFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');

  const filtered = disputes.filter((d) => filter === 'all' || d.status === filter);

  const stats = {
    open: disputes.filter((d) => d.status === 'open').length,
    investigating: disputes.filter((d) => d.status === 'investigating').length,
    resolved: disputes.filter((d) => d.status === 'resolved').length,
    totalAmount: disputes.reduce((s, d) => s + d.amount, 0),
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Dispute Resolution Center</h1>
            <p className="text-sm text-slate-500">Mediate conflicts between freelancers and businesses</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Open', value: stats.open, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Investigating', value: stats.investigating, icon: Search, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Resolved', value: stats.resolved, icon: Scale, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Total at Stake', value: `$${stats.totalAmount.toLocaleString()}`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', s.bg)}>
                  <Icon className={cn('h-4 w-4', s.color)} />
                </div>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-1.5">
          {(['all', 'open', 'investigating', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                filter === f ? 'bg-slate-800 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Dispute cards */}
        <div className="space-y-3">
          {filtered.map((d) => {
            const statusConfig = {
              open: { color: 'text-red-600', bg: 'bg-red-50', label: 'Open' },
              investigating: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Investigating' },
              resolved: { color: 'text-green-600', bg: 'bg-green-50', label: 'Resolved' },
            };
            const cfg = statusConfig[d.status];
            return (
              <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-slate-400" />
                      <h3 className="text-sm font-semibold text-slate-900">{d.project_title}</h3>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {d.freelancer_name} vs. {d.business_name} · Contract #{d.contract_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">${d.amount.toLocaleString()}</p>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', cfg.bg, cfg.color)}>{cfg.label}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm text-slate-600">{d.reason}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    Opened {new Date(d.opened_at).toLocaleDateString()}
                  </span>
                  {d.status !== 'resolved' && (
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700">
                        Investigate
                      </button>
                      <button className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600">
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
