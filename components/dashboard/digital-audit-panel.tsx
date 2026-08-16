'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  X,
  Lock,
  Smartphone,
  Gauge,
  Search,
  Share2,
  Globe,
  CheckCircle,
  XCircle,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  TrendingDown,
  Users,
  Trophy,
  Zap,
} from 'lucide-react';
import type { ExtendedLead } from '@/lib/app-context';
import { runDigitalAudit, type AuditCheck, type SocialPlatform } from '@/lib/digital-audit';
import { cn } from '@/lib/utils';

type Props = {
  lead: ExtendedLead | null;
  onClose: () => void;
  onGeneratePitch?: (lead: ExtendedLead) => void;
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  lock: Lock,
  smartphone: Smartphone,
  gauge: Gauge,
  search: Search,
  share: Share2,
  globe: Globe,
};

const SOCIAL_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#3b82f6' : score >= 30 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

function CheckRow({ check }: { check: AuditCheck }) {
  const Icon = ICON_MAP[check.icon] ?? Globe;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50">
      <div className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
        check.passed ? 'bg-green-50' : 'bg-red-50'
      )}>
        <Icon className={cn('h-4 w-4', check.passed ? 'text-green-500' : 'text-red-500')} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">{check.label}</p>
          {check.passed ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{check.detail}</p>
      </div>
      <span className="flex-shrink-0 text-[11px] font-medium text-slate-400">{check.weight}%</span>
    </div>
  );
}

function SocialRow({ social }: { social: ReturnType<typeof runDigitalAudit>['socials'][0] }) {
  const Icon = SOCIAL_ICONS[social.platform];
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5">
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg',
        social.present ? 'bg-blue-50' : 'bg-slate-100'
      )}>
        <Icon className={cn('h-4 w-4', social.present ? 'text-blue-500' : 'text-slate-300')} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700">{social.label}</p>
        {social.present && social.followers != null ? (
          <p className="text-[11px] text-slate-500">{social.followers.toLocaleString()} followers</p>
        ) : (
          <p className="text-[11px] text-slate-400">Not linked</p>
        )}
      </div>
      {social.present ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-slate-300" />
      )}
    </div>
  );
}

function CompetitorBar({ competitor, leadScore }: { competitor: ReturnType<typeof runDigitalAudit>['competitors'][0]; leadScore: number }) {
  const barWidth = competitor.digitalScore;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {competitor.rank === 1 && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
          <span className="font-medium text-slate-700">#{competitor.rank} {competitor.name}</span>
        </div>
        <span className="font-semibold text-slate-900">{competitor.digitalScore}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-slate-600 to-slate-800 transition-all duration-700"
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="mt-0.5 flex items-center gap-3 text-[10px] text-slate-400">
        <span>{competitor.reviewCount.toLocaleString()} reviews</span>
        <span>{competitor.marketSharePct}% market share</span>
        {competitor.hasWebsite ? <span className="text-green-500">Website</span> : <span className="text-red-500">No website</span>}
      </div>
    </div>
  );
}

export function DigitalAuditPanel({ lead, onClose, onGeneratePitch }: Props) {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [audit, setAudit] = useState<ReturnType<typeof runDigitalAudit> | null>(null);

  const isOpen = lead !== null;

  const scanSteps = [
    '[audit] Connecting to domain...',
    '[audit] Checking SSL certificate...',
    '[audit] Testing mobile responsiveness...',
    '[audit] Measuring page load speed...',
    '[audit] Crawling SEO meta tags...',
    '[audit] Scanning social media links...',
    '[audit] Calculating digital presence score...',
    '[audit] Estimating revenue leakage...',
    '[audit] Fetching competitor rankings...',
    '[audit] Complete.',
  ];

  useEffect(() => {
    if (!lead) {
      setScanning(false);
      setScanProgress(0);
      setScanStep('');
      setAudit(null);
      return;
    }

    // Start scan animation
    setScanning(true);
    setScanProgress(0);
    setAudit(null);

    const timers: ReturnType<typeof setTimeout>[] = [];
    scanSteps.forEach((step, i) => {
      const t = setTimeout(() => {
        setScanProgress(((i + 1) / scanSteps.length) * 100);
        setScanStep(step);
      }, i * 180);
      timers.push(t);
    });

    const doneTimer = setTimeout(() => {
      setScanning(false);
      setAudit(runDigitalAudit(lead));
    }, scanSteps.length * 180 + 200);
    timers.push(doneTimer);

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

  const currency = useMemo(() => {
    if (!lead) return '₹';
    return lead.city === 'New York' ? '$' : '₹';
  }, [lead]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Digital Audit</h2>
              <p className="text-[11px] text-slate-500">Instant web presence scan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lead info */}
        {lead && (
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
            <p className="text-xs text-slate-500">{lead.category} · {lead.city}</p>
          </div>
        )}

        {/* Scanning state */}
        {scanning && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-blue-500" />
              <Zap className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
            </div>
            <div className="w-full max-w-xs">
              <p className="mb-2 text-center font-mono text-[11px] text-blue-500">{scanStep}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Audit results */}
        {!scanning && audit && lead && (
          <div className="flex-1 overflow-y-auto p-5">
            {/* Score ring */}
            <div className="mb-5 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5">
              <ScoreRing score={audit.digitalPresenceScore} size={130} />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900">AI Digital Presence Score</p>
                <p className="text-xs text-slate-500">Weighted: Website 30% · SEO 25% · Speed 20% · SSL 15% · Social 10%</p>
              </div>
            </div>

            {/* Growth / Loss Trend */}
            <div className={cn(
              'mb-5 rounded-2xl border p-4 flex items-center justify-between shadow-sm',
              audit.digitalPresenceGrowth >= 0 
                ? 'border-green-200 bg-green-50/50 text-green-900' 
                : 'border-red-200 bg-red-50/50 text-red-900'
            )}>
              <div className="flex-1 pr-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Marketplace Index</p>
                <h4 className="text-sm font-bold text-slate-900">
                  {audit.digitalPresenceGrowth >= 0 ? 'Digital Growth Trajectory' : 'Digital Market Share Decline'}
                </h4>
                <div className="mt-2 space-y-1">
                  {audit.growthFactors.map((factor, index) => (
                    <p key={index} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-normal">
                      <span className={cn(
                        'mt-1.5 block h-1.5 w-1.5 rounded-full flex-shrink-0',
                        audit.digitalPresenceGrowth >= 0 ? 'bg-green-500' : 'bg-red-500'
                      )} />
                      {factor}
                    </p>
                  ))}
                </div>
              </div>
              <div className={cn(
                'flex flex-col items-center justify-center rounded-xl p-2.5 text-center min-w-[72px] h-[72px]',
                audit.digitalPresenceGrowth >= 0 ? 'bg-green-100/80 text-green-700' : 'bg-red-100/80 text-red-700'
              )}>
                <span className="text-sm font-extrabold leading-none">
                  {audit.digitalPresenceGrowth >= 0 ? '+' : ''}{audit.digitalPresenceGrowth}%
                </span>
                <span className="text-[8px] uppercase font-bold text-slate-500 mt-1">YoY Trend</span>
              </div>
            </div>

            {/* Score breakdown bars */}
            <div className="mb-5 space-y-2.5">
              {[
                { label: 'Website', score: audit.websiteScore, weight: '30%' },
                { label: 'SEO Meta', score: audit.seoScore, weight: '25%' },
                { label: 'Page Speed', score: audit.speedScore, weight: '20%' },
                { label: 'SSL/Security', score: audit.sslScore, weight: '15%' },
                { label: 'Social Links', score: audit.socialScore, weight: '10%' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{item.weight}</span>
                      <span className="font-semibold text-slate-900">{item.score}/100</span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        item.score >= 75 ? 'bg-green-500' : item.score >= 50 ? 'bg-blue-500' : item.score >= 30 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>



            {/* Audit checks */}
            <div className="mb-5">
              <h3 className="mb-2.5 text-sm font-semibold text-slate-800">Web Scan Results</h3>
              <div className="space-y-2">
                {audit.checks.map((check) => (
                  <CheckRow key={check.id} check={check} />
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="mb-5">
              <h3 className="mb-2.5 text-sm font-semibold text-slate-800">Social Media Presence</h3>
              <div className="grid grid-cols-2 gap-2">
                {audit.socials.map((social) => (
                  <SocialRow key={social.platform} social={social} />
                ))}
              </div>
            </div>

            {/* Competitor graph */}
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">Competitor Visibility</h3>
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {/* This lead's bar */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-blue-600">{lead.name} (You)</span>
                    <span className="font-semibold text-blue-600">{audit.digitalPresenceScore}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${audit.digitalPresenceScore}%` }}
                    />
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  {audit.competitors.map((comp) => (
                    <div key={comp.rank} className="mb-3 last:mb-0">
                      <CompetitorBar competitor={comp} leadScore={audit.digitalPresenceScore} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                if (onGeneratePitch && lead) onGeneratePitch(lead);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              <Zap className="h-4 w-4" />
              Generate Pitch from This Audit
            </button>
          </div>
        )}
      </div>
    </>
  );
}
