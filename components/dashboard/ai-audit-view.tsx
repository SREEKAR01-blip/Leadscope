'use client';

import { useState, useMemo } from 'react';
import { Sparkles, Globe, Star, Phone, MapPin, TrendingUp, AlertCircle, CheckCircle, Building2, ChevronDown } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import { runDigitalAudit } from '@/lib/digital-audit';

export function AIAuditView() {
  const { leads, setCurrentView } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedLead = useMemo(() => {
    if (!leads || leads.length === 0) return null;
    return leads[selectedIndex] || leads[0];
  }, [leads, selectedIndex]);

  const audit = useMemo(() => {
    if (!selectedLead) return null;
    return runDigitalAudit(selectedLead);
  }, [selectedLead]);

  if (!selectedLead || !audit) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        No business data available for audit. Search for local businesses to inspect AI audit reports.
      </div>
    );
  }

  const score = selectedLead.digital_score ?? audit.digitalPresenceScore;

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        
        {/* Header & Business Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI Digital Audit Report</h1>
              <p className="text-xs text-slate-500">Real-time online presence and growth opportunity analysis</p>
            </div>
          </div>

          {/* Business Selector Dropdown */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Business to Audit ({leads.length} Available)
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="w-full sm:w-72 appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {leads.map((l, idx) => (
                  <option key={l.id || idx} value={idx}>
                    {l.name} ({l.city}) — Score: {l.digital_score}/100
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Score gauge & Business Profile Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={score >= 75 ? '#22c55e' : score >= 50 ? '#3b82f6' : '#ef4444'}
                  strokeWidth="10"
                  strokeDasharray={`${(score / 100) * 327} 327`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-extrabold text-slate-900">{score}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Score / 100</p>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 mb-2">
                {selectedLead.category}
              </span>
              <h2 className="text-xl font-bold text-slate-900">{selectedLead.name}</h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {selectedLead.address}, {selectedLead.city}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                {selectedLead.rating != null && (
                  <span className="flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {selectedLead.rating.toFixed(1)} ({selectedLead.review_count?.toLocaleString() || 0} Google reviews)
                  </span>
                )}
                {selectedLead.phone && (
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    {selectedLead.phone}
                  </span>
                )}
                {selectedLead.website ? (
                  <span className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    Website Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700">
                    <Globe className="h-3.5 w-3.5 text-red-500" />
                    No Website
                  </span>
                )}
              </div>

              <div className={cn(
                'mt-3.5 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-sm',
                score >= 75 ? 'bg-emerald-500 text-white' : score >= 50 ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'
              )}>
                <TrendingUp className="h-4 w-4" />
                {score >= 75 ? 'Strong Digital Presence — Excellent Customer Reach' : score >= 50 ? 'Moderate Digital Score — High Opportunity to Upgrade' : 'Critical Digital Opportunity — Immediate Outreach Needed'}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Checklist */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Audit Checklist & Factor Analysis</span>
            <span className="text-xs font-normal text-slate-500">({audit.checks.filter(c => c.passed).length} of {audit.checks.length} Passed)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {audit.checks.map((check) => (
              <div key={check.id || check.label} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                {check.passed ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{check.label}</span>
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded', check.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                      {check.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tailored AI Recommendations for Selected Business */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Tailored AI Growth Recommendations</h3>
          <div className="space-y-2.5">
            {!selectedLead.website ? (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-xs text-red-800">
                <Globe className="mt-0.5 h-4 w-4 text-red-600 shrink-0" />
                <div>
                  <p className="font-bold">Build a Mobile-Responsive Website (+35 Pts)</p>
                  <p className="mt-0.5 text-red-700">This business currently has no official website. Pitching a modern Next.js/Tailwind landing page will immediately convert local searchers.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs text-emerald-800">
                <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Website Found: {selectedLead.website}</p>
                  <p className="mt-0.5 text-emerald-700">Website is active. Offer SEO optimization and page speed enhancement services.</p>
                </div>
              </div>
            )}

            {(selectedLead.review_count ?? 0) < 100 ? (
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200/80 p-3.5 text-xs text-amber-800">
                <Star className="mt-0.5 h-4 w-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">Boost Review Count (Current: {selectedLead.review_count ?? 0} Reviews)</p>
                  <p className="mt-0.5 text-amber-700">Implement automated SMS/WhatsApp review requests to cross 100+ positive Google reviews.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200/80 p-3.5 text-xs text-blue-800">
                <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold">Strong Review Base ({selectedLead.review_count?.toLocaleString()} Reviews)</p>
                  <p className="mt-0.5 text-blue-700">Great social proof! Recommend review management software to respond to customer inquiries.</p>
                </div>
              </div>
            )}

            {!selectedLead.phone && (
              <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200/80 p-3.5 text-xs text-blue-800">
                <Phone className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold">Add Primary Contact Phone Number</p>
                  <p className="mt-0.5 text-blue-700">Missing direct contact phone line. Update Google Business profile for quick customer calls.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setCurrentView('claim-verification')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500"
          >
            <Building2 className="h-4 w-4" />
            <span>Claim This Business & Verify Gaps</span>
          </button>
        </div>

      </div>
    </div>
  );
}
