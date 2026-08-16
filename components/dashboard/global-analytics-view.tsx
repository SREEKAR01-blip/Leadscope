'use client';

import { useMemo } from 'react';
import { Globe, Users, DollarSign, Store, TrendingUp, Activity, ShieldCheck, Scale } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function GlobalAnalyticsView() {
  const { leads, freelancers, projects, escrowContracts, disputes, verifications } = useApp();

  const stats = useMemo(() => {
    const totalEscrow = escrowContracts.reduce((s, e) => s + e.amount, 0);
    const openDisputes = disputes.filter((d) => d.status !== 'resolved').length;
    const pendingVerifications = verifications.filter((v) => v.status === 'pending').length;
    return {
      totalLeads: leads.length,
      totalFreelancers: freelancers.length,
      totalProjects: projects.length,
      totalEscrow,
      openDisputes,
      pendingVerifications,
    };
  }, [leads, freelancers, projects, escrowContracts, disputes, verifications]);

  const cards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Store, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Freelancers', value: stats.totalFreelancers, icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { label: 'Projects', value: stats.totalProjects, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Escrow Volume', value: `$${stats.totalEscrow.toLocaleString()}`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Open Disputes', value: stats.openDisputes, icon: Scale, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Pending Verifications', value: stats.pendingVerifications, icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  // Category distribution
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => map.set(l.category, (map.get(l.category) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Global Analytics</h1>
            <p className="text-sm text-slate-500">Platform-wide metrics and health monitoring</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', c.bg)}>
                  <Icon className={cn('h-4 w-4', c.color)} />
                </div>
                <p className="text-xl font-bold text-slate-900">{c.value}</p>
                <p className="text-[11px] text-slate-500">{c.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Category distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Leads by Category</h3>
            <div className="space-y-2.5">
              {categoryStats.map(([cat, count]) => {
                const pct = (count / leads.length) * 100;
                return (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="text-slate-500">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Activity className="h-4 w-4 text-blue-500" />
              Platform Activity
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Active Scans Today', value: '47', trend: '+12%' },
                { label: 'New Signups (Freelancers)', value: '8', trend: '+3' },
                { label: 'New Business Claims', value: '5', trend: '+2' },
                { label: 'Proposals Sent', value: '23', trend: '+8' },
                { label: 'Escrow Fundings', value: '3', trend: '+1' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-600">{item.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
