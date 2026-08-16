'use client';

import { ShieldCheck, CheckCircle, XCircle, Clock, FileText, Search } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function VerificationRequestsView() {
  const { verifications } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  const filtered = verifications.filter((v) => {
    if (filter !== 'all' && v.status !== filter) return false;
    if (search && !v.business_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Verification Requests</h1>
            <p className="text-sm text-slate-500">Review and approve business verification submissions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Pending', value: verifications.filter((v) => v.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Approved', value: verifications.filter((v) => v.status === 'approved').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Rejected', value: verifications.filter((v) => v.status === 'rejected').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Total', value: verifications.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', s.bg)}>
                  <Icon className={cn('h-4 w-4', s.color)} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business name..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
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
        </div>

        {/* Request list */}
        <div className="space-y-2">
          {filtered.map((v) => {
            const statusConfig = {
              pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
              approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Approved' },
              rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Rejected' },
            };
            const cfg = statusConfig[v.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={v.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', cfg.bg)}>
                  <StatusIcon className={cn('h-5 w-5', cfg.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{v.business_name}</p>
                  <p className="text-xs text-slate-500">{v.category} · {v.documents_count} documents · {new Date(v.submitted_at).toLocaleDateString()}</p>
                </div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', cfg.bg, cfg.color)}>{cfg.label}</span>
                {v.status === 'pending' && (
                  <div className="flex gap-1.5">
                    <button className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600">
                      Approve
                    </button>
                    <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
