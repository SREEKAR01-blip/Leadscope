'use client';

import { useState, useCallback, useEffect } from 'react';
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
} from 'lucide-react';
import type { ExtendedLead } from '@/lib/app-context';
import { cn } from '@/lib/utils';

type TemplateType = 'direct' | 'seo' | 'competitor';

type Props = {
  lead: ExtendedLead | null;
  onClose: () => void;
};

const templateConfig: Record<TemplateType, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  direct: {
    label: 'Direct Offer',
    icon: Send,
    description: 'Fast 24-hour landing page pitch',
  },
  seo: {
    label: 'SEO Audit',
    icon: Search,
    description: 'Missing website = lost Google rankings',
  },
  competitor: {
    label: 'Competitor Contrast',
    icon: Users,
    description: 'How rivals are winning online',
  },
};

function generateEmailContent(
  lead: ExtendedLead,
  template: TemplateType
): { subject: string; body: string } {
  const businessName = lead.name;
  const city = lead.city;
  const category = lead.category;

  switch (template) {
    case 'direct':
      return {
        subject: `Quick question regarding ${businessName} in ${city}`,
        body: `Hi there,

I noticed ${businessName} doesn't have a website - and I wanted to reach out directly.

I'm a local web designer specializing in ${category.toLowerCase()} businesses in ${city}, and I can build you a professional, mobile-friendly website in 24 hours.

Here's what you'd get:
- Custom design matching your brand
- Mobile-optimized for on-the-go customers
- Google Maps integration so customers find you easily
- Contact form to capture leads 24/7
- Fast loading speed (under 2 seconds)

The investment is straightforward - one flat fee, no monthly hosting charges for the first year.

Would you be open to a quick 10-minute call this week to see some examples of my work?

Best,
Jordan Davis
Web Design Specialist
P.S. I recently helped a ${category.toLowerCase()} business in ${city} double their foot traffic in just 3 months with a new website. Happy to share the case study!`,
      };

    case 'seo':
      return {
        subject: `${businessName} is invisible on Google - here's why that matters`,
        body: `Hi,

I was searching for "${category.toLowerCase()} near me" in ${city} and noticed something concerning:

${businessName} doesn't appear in the search results.

Meanwhile, your competitors are capturing dozens of leads every day from people actively searching for your services.

Here's the reality:
- 97% of consumers search online before visiting a local business
- Without a website, you're losing customers to competitors who show up on Google
- A simple website can put you on the map - literally (Google Maps integration)

I specialize in helping ${category.toLowerCase()} businesses get found online. A professionally designed website can:
- Rank you on the first page of Google for "${category.toLowerCase()} ${city}"
- Capture leads while you sleep with a contact form
- Showcase your reviews and services 24/7

Would you be open to a complimentary SEO audit? I can show you exactly what you're missing and how to fix it.

Let me know,
Jordan Davis
Local SEO Specialist
P.S. The average business I work with sees a 40% increase in calls within 60 days of launching their website.`,
      };

    case 'competitor':
      return {
        subject: `Why ${businessName}'s competitors are winning (and how to catch up)`,
        body: `Hi,

I've been researching ${category.toLowerCase()} businesses in ${city}, and I wanted to share something interesting.

Your local competitors are using their websites to:
- Show up first in Google searches
- Display their hours, services, and pricing
- Collect reviews that build trust
- Capture customer inquiries 24/7

Meanwhile, ${businessName} is missing out on all of this.

Without a website, you're essentially invisible to the 80% of customers who research online before choosing a ${category.toLowerCase()}.

The good news? It's fixable - faster than you might think.

I build websites specifically for ${category.toLowerCase()} businesses like yours. My clients typically see:
- First Google page ranking within 90 days
- 50%+ more phone inquiries
- Professional credibility that wins bigger contracts

I'd love to send you a free competitive analysis showing exactly where you stand vs. the top 3 businesses in ${city}.

Interested?

Best,
Jordan Davis
Web Design & Digital Strategy
P.S. I helped a similar ${category.toLowerCase()} business go from "not found" to #2 on Google Maps in 6 weeks. I can do the same for you.`,
      };

    default:
      return { subject: '', body: '' };
  }
}

export function PitchGeneratorModal({ lead, onClose }: Props) {
  const [template, setTemplate] = useState<TemplateType>('direct');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: '', body: '' });

  // Generate email when lead or template changes
  useEffect(() => {
    if (lead) {
      setEmailContent(generateEmailContent(lead, template));
    }
  }, [lead, template]);

  const handleCopyScript = useCallback(async () => {
    const fullText = `Subject: ${emailContent.subject}\n\n${emailContent.body}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [emailContent]);

  const handleEmailOwner = useCallback(() => {
    const subject = encodeURIComponent(emailContent.subject);
    const body = encodeURIComponent(emailContent.body);
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  }, [emailContent]);

  if (!lead) return null;

  const selectedTemplate = templateConfig[template];
  const TemplateIcon = selectedTemplate.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Quick Pitch Generator</h2>
              <p className="text-sm text-slate-500">AI-powered cold email writer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lead Info Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
            <Building2 className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">{lead.name}</p>
            <p className="text-xs text-slate-500">
              {lead.category} · {lead.city}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <Target className="h-3 w-3" />
            No Website
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Template Selector */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Template
            </label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-slate-300"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <TemplateIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{selectedTemplate.label}</p>
                    <p className="text-xs text-slate-500">{selectedTemplate.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-slate-400 transition-transform',
                    dropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    {(Object.keys(templateConfig) as TemplateType[]).map((key) => {
                      const config = templateConfig[key];
                      const Icon = config.icon;
                      const isSelected = template === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setTemplate(key);
                            setDropdownOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-3 transition-colors',
                            isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                          )}
                        >
                          <div
                            className={cn(
                              'rounded-lg p-2',
                              isSelected ? 'bg-blue-100' : 'bg-slate-100'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-4 w-4',
                                isSelected ? 'text-blue-600' : 'text-slate-500'
                              )}
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <p
                              className={cn(
                                'font-medium',
                                isSelected ? 'text-blue-600' : 'text-slate-900'
                              )}
                            >
                              {config.label}
                            </p>
                            <p className="text-xs text-slate-500">{config.description}</p>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-blue-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Generated Email */}
          <div className="space-y-4">
            {/* Subject Line */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Subject Line
                </label>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">Editable</span>
              </div>
              <input
                type="text"
                value={emailContent.subject}
                onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Email Body */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Email Body
                </label>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">Editable</span>
              </div>
              <textarea
                value={emailContent.body}
                onChange={(e) => setEmailContent({ ...emailContent, body: e.target.value })}
                rows={10}
                className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
            <div className="flex gap-3">
              <button
                onClick={handleCopyScript}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                  copied
                    ? 'bg-green-500 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Script
                  </>
                )}
              </button>
              <button
                onClick={handleEmailOwner}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
              >
                <Mail className="h-4 w-4" />
                Email Owner
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
