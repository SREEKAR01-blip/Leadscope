'use client';

import {
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp, type ExtendedLead } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import { runDigitalAudit } from '@/lib/digital-audit';

type Props = {
  lead: ExtendedLead | null;
  onClose: () => void;
  onAddToPipeline?: (lead: ExtendedLead) => void;
};

function hasPresence(value: string | null) {
  return value != null && value.length > 0;
}

export function ProfileDialog({ lead, onClose, onAddToPipeline }: Props) {
  const { setCurrentView } = useApp();
  if (!lead) return null;

  const audit = runDigitalAudit(lead);

  const checks = [
    { label: 'Website', ok: hasPresence(lead.website) },
    { label: 'Phone Listed', ok: hasPresence(lead.phone) },
    { label: 'Email Listed', ok: hasPresence(lead.email) },
    { label: 'Reviews', ok: (lead.review_count ?? 0) > 50 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Banner */}
        <div className="relative h-28 overflow-hidden">
          {lead.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lead.image_url} alt={lead.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-400 to-cyan-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-slate-700 backdrop-blur transition-colors hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {/* Title */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
              {lead.category}
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900">{lead.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {lead.address}, {lead.city}
            </p>
          </div>

          {/* Rating row */}
          <div className="mb-4 grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-base font-bold text-slate-900">
                  {lead.rating?.toFixed(1) ?? '—'}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Rating</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-base font-bold text-slate-900">
                  {lead.review_count ?? '—'}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Reviews</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-base font-bold text-slate-900">
                  {new Date(lead.created_at).getFullYear()}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Added</p>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Contact
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {lead.phone && (
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-900">{lead.phone}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-900">{lead.email}</span>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium hover:underline flex items-center gap-1 truncate"
                  >
                    <span>{lead.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {!lead.phone && !lead.email && !lead.website && (
                <p className="text-sm text-slate-500">No contact information available.</p>
              )}
            </div>
          </div>

          {/* Digital presence checklist */}
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Globe className="h-3.5 w-3.5" />
              Digital Presence
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {checks.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  {c.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-xs text-slate-700">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Marketplace Growth/Loss Trend */}
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Marketplace Trend
            </h3>
            <div className={cn(
              'flex items-center justify-between rounded-xl border p-3',
              audit.digitalPresenceGrowth >= 0 ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
            )}>
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {audit.digitalPresenceGrowth >= 0 ? 'Growth Trajectory' : 'Market Share Decline'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {audit.digitalPresenceGrowth >= 0 
                    ? 'Online footprint is growing steadily.' 
                    : 'Losing customers to digital competitors.'}
                </p>
              </div>
              <span className={cn(
                'rounded-lg px-2 py-1 text-xs font-bold',
                audit.digitalPresenceGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {audit.digitalPresenceGrowth >= 0 ? '+' : ''}{audit.digitalPresenceGrowth}% YoY
              </span>
            </div>
          </div>

          {/* Insight */}
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
            <p className="text-xs leading-relaxed text-slate-600">
              {lead.digital_score >= 75
                ? 'Strong digital footprint — a well-optimized competitor. Consider a differentiated pitch.'
                : lead.digital_score >= 50
                ? 'Moderate online presence with clear gaps in their digital strategy worth highlighting.'
                : 'Limited digital presence — a prime prospect for services that improve online visibility.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Close
          </button>
          <button
            onClick={() => {
              setCurrentView('ai-audit');
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
          >
            <Sparkles className="h-4 w-4" /> Digital Audit
          </button>
          <button
            onClick={() => {
              if (onAddToPipeline) onAddToPipeline(lead);
            }}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Add to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
