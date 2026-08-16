'use client';

import { useMemo } from 'react';
import { Sparkles, Globe, Star, Phone, MapPin, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function AIAuditView() {
  const { leads } = useApp();
  const lead = leads[0];

  const audit = useMemo(() => {
    if (!lead) return null;
    const checks = [
      { label: 'Website Present', passed: !!lead.website, weight: 25 },
      { label: 'Google Business Profile', passed: lead.rating != null, weight: 20 },
      { label: 'Phone Listed', passed: !!lead.phone, weight: 10 },
      { label: 'Address Complete', passed: !!lead.address, weight: 10 },
      { label: 'Reviews > 100', passed: (lead.review_count ?? 0) > 100, weight: 15 },
      { label: 'Rating > 4.0', passed: (lead.rating ?? 0) > 4.0, weight: 10 },
      { label: 'Email Contact', passed: !!lead.email, weight: 10 },
    ];
    const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
    return { checks, score };
  }, [lead]);

  if (!lead || !audit) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No business data available for audit.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <Sparkles className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">AI Audit Score</h1>
            <p className="text-sm text-slate-500">Comprehensive digital presence analysis</p>
          </div>
        </div>

        {/* Score gauge */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-6">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
                  strokeDasharray={`${(audit.score / 100) * 327} 327`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold text-slate-900">{audit.score}</p>
                <p className="text-[11px] text-slate-400">out of 100</p>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">{lead.name}</h2>
              <p className="text-sm text-slate-500">{lead.category} · {lead.city}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {lead.rating?.toFixed(1)} ({lead.review_count?.toLocaleString()})
                </span>
                <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  <MapPin className="h-3 w-3" />{lead.address}
                </span>
                {lead.phone && (
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    <Phone className="h-3 w-3" />{lead.phone}
                  </span>
                )}
              </div>
              <div className={cn(
                'mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold',
                audit.score >= 75 ? 'bg-green-50 text-green-600' : audit.score >= 50 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
              )}>
                <TrendingUp className="h-4 w-4" />
                {audit.score >= 75 ? 'Strong Digital Presence' : audit.score >= 50 ? 'Moderate — Room to Improve' : 'Needs Immediate Attention'}
              </div>
            </div>
          </div>
        </div>

        {/* Audit checks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Audit Checklist</h3>
          <div className="space-y-2">
            {audit.checks.map((check) => (
              <div key={check.label} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                {check.passed ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                )}
                <span className="flex-1 text-sm font-medium text-slate-700">{check.label}</span>
                <span className="text-xs text-slate-400">{check.weight} pts</span>
                <span className={cn('text-xs font-semibold', check.passed ? 'text-green-600' : 'text-red-600')}>
                  {check.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">AI Recommendations</h3>
          <div className="space-y-2">
            {!lead.website && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <Globe className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Build a professional website — this is the biggest gap in your digital presence.</span>
              </div>
            )}
            {(lead.review_count ?? 0) < 100 && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                <Star className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Encourage more customer reviews — aim for 100+ to boost local search ranking.</span>
              </div>
            )}
            {!lead.email && (
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Add a public email contact to your Google Business Profile for customer inquiries.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
