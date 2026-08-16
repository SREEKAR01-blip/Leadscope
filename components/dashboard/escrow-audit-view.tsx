'use client';

import { Wallet, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function EscrowAuditView() {
  const { escrowContracts } = useApp();

  const totalFunded = escrowContracts.filter((e) => e.status === 'funded' || e.status === 'in_progress').reduce((s, e) => s + e.amount, 0);
  const totalReleased = escrowContracts.filter((e) => e.status === 'released').reduce((s, e) => s + e.amount, 0);
  const disputed = escrowContracts.filter((e) => e.status === 'disputed').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Escrow Audit</h1>
            <p className="text-sm text-slate-500">Monitor all escrow transactions across the platform</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Held in Escrow', value: `$${totalFunded.toLocaleString()}`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Total Released', value: `$${totalReleased.toLocaleString()}`, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Disputed Funds', value: `$${disputed.toLocaleString()}`, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', s.bg)}>
                  <Icon className={cn('h-4 w-4', s.color)} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Transaction ledger */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Transaction Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="pb-2 font-medium">Contract</th>
                  <th className="pb-2 font-medium">Freelancer</th>
                  <th className="pb-2 font-medium">Business</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Milestones</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Funded Date</th>
                </tr>
              </thead>
              <tbody>
                {escrowContracts.map((e) => (
                  <tr key={e.id} className="border-b border-slate-50">
                    <td className="py-3 text-xs font-medium text-slate-900">{e.project_title}</td>
                    <td className="py-3 text-xs text-slate-600">{e.freelancer_name}</td>
                    <td className="py-3 text-xs text-slate-600">{e.business_name}</td>
                    <td className="py-3 text-xs font-semibold text-slate-900">${e.amount.toLocaleString()}</td>
                    <td className="py-3 text-xs text-slate-600">{e.milestone_current}/{e.milestone_total}</td>
                    <td className="py-3">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
                        e.status === 'released' ? 'bg-green-50 text-green-600' : e.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : e.status === 'disputed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        {e.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-500">{new Date(e.funded_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
