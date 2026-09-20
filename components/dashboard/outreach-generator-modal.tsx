'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  Send,
  Search,
  Target,
  Users,
  Building2,
  PhoneCall,
  Calendar,
  Zap,
  TrendingUp,
  AlertTriangle,
  Loader2,
  FileText,
  Clock,
} from 'lucide-react';
import type { ExtendedLead } from '@/lib/app-context';
import { cn } from '@/lib/utils';

type TemplateType = 'direct' | 'seo' | 'competitor';
type TabType = 'email' | 'followup' | 'call';

type Props = {
  lead: ExtendedLead | null;
  onClose: () => void;
};

const TEMPLATE_CONFIG: Record<TemplateType, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  direct: {
    label: 'Direct Website Offer',
    icon: Send,
    description: 'Offer a landing page built in 24 hours',
  },
  seo: {
    label: 'SEO & Google Search Invisible Audit',
    icon: Search,
    description: 'Reveal what they are missing in local search',
  },
  competitor: {
    label: 'Competitor Contrast Pitch',
    icon: Users,
    description: 'Show who is stealing their traffic',
  },
};

const TAB_CONFIG: Record<TabType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  email: { label: 'Cold Email', icon: Mail },
  followup: { label: 'Follow-Up Sequence', icon: Calendar },
  call: { label: 'Cold Call Script', icon: PhoneCall },
};

export function OutreachGeneratorModal({ lead, onClose }: Props) {
  const [template, setTemplate] = useState<TemplateType>('direct');
  const [tab, setTab] = useState<TabType>('email');
  const [generating, setGenerating] = useState(false);
  const [emailBody, setEmailBody] = useState<string | null>(null);
  const [followupDay3, setFollowupDay3] = useState<string | null>(null);
  const [followupDay7, setFollowupDay7] = useState<string | null>(null);
  const [callScript, setCallScript] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isOpen = lead !== null;

  // AI Priority Score
  const priorityScore = useMemo(() => {
    if (!lead) return 0;
    const reviewFactor = Math.min((lead.review_count ?? 0) / 5000, 1) * 50;
    const noSiteBonus = !lead.website ? 40 : 0;
    const lowScoreBonus = lead.digital_score < 50 ? 10 : 0;
    return Math.min(Math.round(reviewFactor + noSiteBonus + lowScoreBonus), 100);
  }, [lead]);

  const priorityLabel = useMemo(() => {
    if (priorityScore >= 90) return `PITCH THIS FIRST: Score ${priorityScore}/100`;
    if (priorityScore >= 70) return `HIGH PRIORITY: Score ${priorityScore}/100`;
    if (priorityScore >= 50) return `MEDIUM PRIORITY: Score ${priorityScore}/100`;
    return `LOW PRIORITY: Score ${priorityScore}/100`;
  }, [priorityScore]);

  const generateEmail = useCallback((l: ExtendedLead, tpl: TemplateType): string => {
    const missingAssets: string[] = [];
    if (!l.website) missingAssets.push('a website');
    if (!l.email) missingAssets.push('a contact email');
    if (l.digital_score < 50) missingAssets.push('SEO optimization');
    if (!l.website || !l.website.startsWith('https://')) missingAssets.push('SSL security');
    const missingStr = missingAssets.length > 0 ? missingAssets.join(', ') : 'some digital improvements';

    const ratingPhrase = l.rating != null ? `${l.rating.toFixed(1)} stars` : 'a strong local rating';
    const reviewsPhrase = l.review_count != null ? `${l.review_count.toLocaleString()} reviews` : 'great customer reviews';
    const customersCount = l.review_count != null ? `${l.review_count.toLocaleString()}` : 'dozens of';

    if (tpl === 'direct') {
      return `Subject: A landing page for ${l.name} — live in 24 hours

Hi ${l.name} Team,

I was searching for top-rated ${l.category.toLowerCase()} businesses in ${l.city} and found you — ${ratingPhrase} with ${reviewsPhrase} is impressive.

But I noticed you're missing ${missingStr}. With ${customersCount} happy customers, you're leaving money on the table every month.

I build high-converting landing pages for local businesses. I can have one live for ${l.name} in 24 hours — designed, deployed, and mobile-ready.

What you get:
- A professional landing page that turns visitors into customers
- Mobile-optimized, fast-loading, SEO-ready
- Click-to-call, directions, and review integration
- Live in 24 hours, no upfront commitment

Want me to send a quick mockup?

Best,
Jordan`;
    }

    if (tpl === 'seo') {
      return `Subject: ${l.name} is invisible on Google — here's the fix

Hi ${l.name} Team,

I ran a quick SEO audit on your business and found something concerning.

You have ${reviewsPhrase} and ${ratingPhrase} — but when someone searches "${l.category.toLowerCase()} in ${l.city}", your business doesn't show up on the first page.

That means ${l.review_count != null ? Math.round(l.review_count * 0.5).toLocaleString() : 'dozens of'}+ potential customers every month are finding your competitors instead of you.

Here's what I found missing:
${missingAssets.map((a) => `  - No ${a}`).join('\n')}

I specialize in local SEO for ${l.category.toLowerCase()} businesses. I can get ${l.name} ranking on the first page of Google Maps within 60 days — or you don't pay.

Can I send you a free, no-obligation audit report?

Best,
Jordan`;
    }

    // competitor
    return `Subject: Your competitors are stealing your customers, ${l.name}

Hi ${l.name} Team,

I did some research on ${l.category.toLowerCase()} businesses in ${l.city} and found something you should know.

${l.name} has ${reviewsPhrase} and ${ratingPhrase} — better than most of your competitors. But they're getting more customers because they show up first on Google Maps and have ${missingStr === 'some digital improvements' ? 'optimized websites' : missingStr}.

Right now, when someone searches "${l.category.toLowerCase()} near me" in ${l.city}, they find:
  1. A competitor with fewer reviews but a better website
  2. Another competitor with SEO-optimized Google Maps listing
  3. ${l.name} — buried on page 2

You have the better business. You just need the better digital presence.

I can help you:
- Build a website that converts visitors into customers
- Optimize your Google Maps listing to rank #1
- Claim the traffic that should already be yours

Want to see what your competitors are doing differently?

Best,
Jordan`;
  }, []);

  const generateFollowUp = useCallback((l: ExtendedLead, tpl: TemplateType, day: 3 | 7): string => {
    const ratingPhrase = l.rating != null ? `${l.rating.toFixed(1)} rating` : 'strong rating';
    const reviewsPhrase = l.review_count != null ? `${l.review_count.toLocaleString()} reviews` : 'great reviews';

    if (day === 3) {
      return `Subject: Re: Quick follow-up — ${l.name}

Hi ${l.name} Team,

I reached out a couple of days ago about helping ${l.name} with ${!l.website ? 'a website' : 'digital optimization'}.

I know you're busy running a ${l.category.toLowerCase()} business with ${reviewsPhrase} (congrats on the ${ratingPhrase}, by the way!), so I'll keep this short.

I have a time slot open this week to build a mockup landing page for ${l.name} — free, no strings attached. You see it, you decide if it's worth a conversation.

Should I send it over?

Best,
Jordan`;
    }

    return `Subject: Last email — ${l.name} opportunity

Hi ${l.name} Team,

This will be my last email for now — I don't want to be a nuisance.

Just wanted to leave you with one thought: every month without a strong digital presence, ${l.name} is losing potential revenue to competitors who rank higher on Google.

If you ever want to fix that, I'm here. I specialize in helping ${l.category.toLowerCase()} businesses in ${l.city} dominate local search.

Reply with "interested" and I'll send a free audit.

All the best,
Jordan`;
  }, []);

  const generateCallScript = useCallback((l: ExtendedLead): string => {
    const ratingPhrase = l.rating != null ? `${l.rating.toFixed(1)} stars` : 'a strong rating';
    const reviewsPhrase = l.review_count != null ? `${l.review_count.toLocaleString()} reviews` : 'great customer reviews';
    const customersCount = l.review_count != null ? `${l.review_count.toLocaleString()}` : 'dozens of';

    return `[30-Second Cold Call Script for ${l.name}]

OPENING (5 sec):
"Hi, is this the owner of ${l.name}? Great — I'll be quick, I know you're running a business."

HOOK (10 sec):
"I was looking for the best ${l.category.toLowerCase()} in ${l.city} and you came up — ${ratingPhrase}, ${reviewsPhrase}. Honestly, you're one of the top-rated spots in the area."

PROBLEM (8 sec):
"But I noticed you don't have a website${l.website && !l.website.startsWith('https://') ? ' with SSL security' : ''}. With ${customersCount} happy customers, you're probably losing customers to competitors who show up first on Google."

VALUE (5 sec):
"I build websites and optimize Google Maps listings for local businesses. I can have a landing page live for you in 24 hours."

CTA (2 sec):
"Can I send you a quick mockup this week — no cost, no commitment?"

[If they say yes]: "Perfect, what's the best email to send it to?"
[If they say no/maybe]: "No problem. Can I at least send you a free audit of your Google ranking? Takes me 10 minutes to put together."
[If they say not interested]: "Totally understand. I'll shoot you one email with a free audit report — if it's helpful, great. If not, you won't hear from me again. What's the best email?"

PRIORITY: ${priorityLabel}
REASON: ${reviewsPhrase} + ${!l.website ? 'zero website presence' : 'weak digital presence'} = massive untapped revenue opportunity.`;
  }, [priorityLabel]);

  const handleGenerate = useCallback(() => {
    if (!lead) return;
    setGenerating(true);

    setTimeout(() => {
      setEmailBody(generateEmail(lead, template));
      setFollowupDay3(generateFollowUp(lead, template, 3));
      setFollowupDay7(generateFollowUp(lead, template, 7));
      setCallScript(generateCallScript(lead));
      setGenerating(false);
    }, 400);
  }, [lead, template, generateEmail, generateFollowUp, generateCallScript]);

  // Auto-generate content on load or lead/template change
  useMemo(() => {
    if (lead) {
      setEmailBody(generateEmail(lead, template));
      setFollowupDay3(generateFollowUp(lead, template, 3));
      setFollowupDay7(generateFollowUp(lead, template, 7));
      setCallScript(generateCallScript(lead));
    }
  }, [lead, template, generateEmail, generateFollowUp, generateCallScript]);

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  // Reset when lead changes
  useMemo(() => {
    if (lead) {
      setEmailBody(null);
      setFollowupDay3(null);
      setFollowupDay7(null);
      setCallScript(null);
      setTab('email');
      setTemplate('direct');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">AI Outreach Generator</h2>
              <p className="text-xs text-slate-500">{lead?.name} · {lead?.category} · {lead?.city}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {lead && (
          <div className="flex-1 overflow-y-auto">
            {/* AI Priority Score Banner */}
            <div className={cn(
              'flex items-center gap-3 px-6 py-3',
              priorityScore >= 70 ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-slate-50'
            )}>
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                priorityScore >= 70 ? 'bg-red-500' : 'bg-slate-400'
              )}>
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className={cn('text-sm font-bold', priorityScore >= 70 ? 'text-red-600' : 'text-slate-600')}>
                  {priorityLabel}
                </p>
                <p className="text-xs text-slate-500">
                  {lead.review_count?.toLocaleString()} reviews · {!lead.website ? 'No website' : 'Has website'} · Score {lead.digital_score}/100
                </p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                  {lead.rating?.toFixed(1)} ★
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  {lead.review_count?.toLocaleString()}
                </span>
                {!lead.website && (
                  <span className="flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    No Website
                  </span>
                )}
              </div>
            </div>

            {/* Template selector */}
            <div className="border-b border-slate-100 px-6 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Email Template</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(TEMPLATE_CONFIG) as TemplateType[]).map((key) => {
                  const cfg = TEMPLATE_CONFIG[key];
                  const Icon = cfg.icon;
                  const isActive = template === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setTemplate(key)}
                      className={cn(
                        'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all',
                        isActive ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-400' : 'border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', isActive ? 'bg-blue-500' : 'bg-slate-100')}>
                        <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-500')} />
                      </div>
                      <p className={cn('text-xs font-semibold', isActive ? 'text-blue-600' : 'text-slate-700')}>{cfg.label}</p>
                      <p className="text-[11px] leading-tight text-slate-500">{cfg.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-100 px-6 py-2">
              {(Object.keys(TAB_CONFIG) as TabType[]).map((key) => {
                const cfg = TAB_CONFIG[key];
                const Icon = cfg.icon;
                const isActive = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {cfg.label}
                  </button>
                );
              })}
              <div className="ml-auto">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {generating ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm text-slate-500">Crafting your {tab === 'email' ? 'cold email' : tab === 'followup' ? 'follow-up sequence' : 'call script'}...</p>
                </div>
              ) : (
                <>
                  {/* Email Tab */}
                  {tab === 'email' && emailBody !== null && (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <h3 className="text-sm font-semibold text-slate-800">Cold Email — {TEMPLATE_CONFIG[template].label}</h3>
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Editable</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const lines = emailBody.split('\n');
                              let subject = '';
                              let bodyLines = emailBody;
                              if (lines[0].toLowerCase().startsWith('subject:')) {
                                subject = lines[0].replace(/^subject:\s*/i, '');
                                bodyLines = lines.slice(1).join('\n').trim();
                              }
                              window.location.href = `mailto:${lead?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;
                            }}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600 shadow-sm"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email Owner
                          </button>
                          <button
                            onClick={() => handleCopy(emailBody, 'email')}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            {copiedField === 'email' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedField === 'email' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="relative rounded-xl border border-slate-300 bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                        <textarea
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          rows={14}
                          className="w-full resize-y rounded-xl bg-transparent p-4 font-sans text-sm leading-relaxed text-slate-800 focus:outline-none"
                          placeholder="Type or customize your cold email pitch here..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Follow-Up Tab */}
                  {tab === 'followup' && followupDay3 !== null && followupDay7 !== null && (
                    <div className="space-y-4">
                      {/* Day 3 */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">D3</span>
                            <h3 className="text-sm font-semibold text-slate-800">Day 3 Follow-Up</h3>
                            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Editable</span>
                          </div>
                          <button
                            onClick={() => handleCopy(followupDay3, 'day3')}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            {copiedField === 'day3' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedField === 'day3' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <div className="rounded-xl border border-slate-300 bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                          <textarea
                            value={followupDay3}
                            onChange={(e) => setFollowupDay3(e.target.value)}
                            rows={8}
                            className="w-full resize-y rounded-xl bg-transparent p-4 font-sans text-sm leading-relaxed text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Day 7 */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-600">D7</span>
                            <h3 className="text-sm font-semibold text-slate-800">Day 7 Follow-Up (Break-Up)</h3>
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Editable</span>
                          </div>
                          <button
                            onClick={() => handleCopy(followupDay7, 'day7')}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            {copiedField === 'day7' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedField === 'day7' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <div className="rounded-xl border border-slate-300 bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                          <textarea
                            value={followupDay7}
                            onChange={(e) => setFollowupDay7(e.target.value)}
                            rows={8}
                            className="w-full resize-y rounded-xl bg-transparent p-4 font-sans text-sm leading-relaxed text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Call Script Tab */}
                  {tab === 'call' && callScript !== null && (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PhoneCall className="h-4 w-4 text-blue-500" />
                          <h3 className="text-sm font-semibold text-slate-800">30-Second Cold Call Script</h3>
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Editable</span>
                        </div>
                        <button
                          onClick={() => handleCopy(callScript, 'call')}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          {copiedField === 'call' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedField === 'call' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="rounded-xl border border-slate-300 bg-slate-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                        <textarea
                          value={callScript}
                          onChange={(e) => setCallScript(e.target.value)}
                          rows={12}
                          className="w-full resize-y rounded-xl bg-transparent p-4 font-sans text-sm leading-relaxed text-slate-800 focus:outline-none"
                        />
                      </div>
                      {/* Timing breakdown */}
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {[
                          { label: 'Opening', time: '5s', color: 'bg-slate-100 text-slate-600' },
                          { label: 'Hook', time: '10s', color: 'bg-blue-50 text-blue-600' },
                          { label: 'Problem', time: '8s', color: 'bg-amber-50 text-amber-600' },
                          { label: 'Value + CTA', time: '7s', color: 'bg-green-50 text-green-600' },
                        ].map((s) => (
                          <div key={s.label} className={cn('rounded-lg p-2 text-center', s.color)}>
                            <p className="text-[11px] font-semibold">{s.label}</p>
                            <p className="text-xs font-bold">{s.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {!emailBody && !callScript && !followupDay3 && (
                    <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                      <Sparkles className="h-10 w-10 text-slate-200" />
                      <p className="text-sm text-slate-400">Select a template and click Generate to create your outreach content.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
