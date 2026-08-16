'use client';

import { ScrollText, Info, AlertTriangle, AlertCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function SystemLogsView() {
  const { systemLogs } = useApp();
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [search, setSearch] = useState('');

  const filtered = systemLogs.filter((l) => {
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.module.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const levelConfig = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800">
            <ScrollText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">System Logs</h1>
            <p className="text-sm text-slate-500">Platform event log and error monitoring</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {(['info', 'warning', 'error'] as const).map((lvl) => {
            const count = systemLogs.filter((l) => l.level === lvl).length;
            const cfg = levelConfig[lvl];
            const Icon = cfg.icon;
            return (
              <div key={lvl} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', cfg.bg)}>
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-xs capitalize text-slate-500">{lvl} entries</p>
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
              placeholder="Search logs..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'info', 'warning', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setLevelFilter(f)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  levelFilter === f ? 'bg-slate-800 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Log entries */}
        <div className="space-y-2">
          {filtered.map((log) => {
            const cfg = levelConfig[log.level];
            const Icon = cfg.icon;
            return (
              <div key={log.id} className={cn('flex items-start gap-3 rounded-lg border bg-white p-3.5', cfg.border)}>
                <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg', cfg.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-slate-500">
                      {log.module}
                    </span>
                    <span className={cn('text-[10px] font-semibold uppercase', cfg.color)}>{log.level}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{log.message}</p>
                </div>
                <span className="flex-shrink-0 font-mono text-[11px] text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
