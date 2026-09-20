'use client';

import { useState } from 'react';
import { FileText, Sparkles, Send, Copy, Check, Loader2, Wand2, Pencil } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ProposalGeneratorView() {
  const { leads, projects, updateLeadStatus, setCurrentView, settings, user } = useApp();
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'persuasive'>('professional');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const lead = leads.find((l) => l.id === selectedLead);
  const project = projects.find((p) => p.id === selectedProject);

  const senderName = settings.user_name || user?.name || 'Srikar';

  const handleGenerate = () => {
    if (!lead || !project) return;
    setGenerating(true);
    setGenerated(null);
    setIsEditing(false);

    setTimeout(() => {
      const proposal = `Hi ${lead.name} Team,

I came across ${lead.name} while scanning ${lead.city} for local businesses that could benefit from a stronger digital presence. With a digital score of ${lead.digital_score}/100 and ${lead.review_count?.toLocaleString() ?? '0'} reviews on Google, there's a clear opportunity to ${!lead.website ? 'establish your online presence with a professional website' : 'optimize your existing digital footprint'}.

Project: ${project.title}
Budget: $${project.budget_min.toLocaleString()} – $${project.budget_max.toLocaleString()}

My Proposed Approach:
1. Discovery & Audit — Review your current digital presence, competitors, and local search visibility.
2. ${project.category} Implementation — Deliver the scope outlined in your project posting with weekly milestones.
3. Launch & Optimization — Go-live with performance tracking and 30-day post-launch support.

Why Me:
- ${project.bids_count > 10 ? 'Top-rated freelancer' : 'Verified professional'} with a track record in ${project.category.toLowerCase()}.
- Transparent communication with milestone-based delivery.
- Payment via LeadScope escrow for your protection.

Timeline: 14–21 days
Investment: $${Math.round((project.budget_min + project.budget_max) / 2).toLocaleString()} (negotiable)

I'd love to discuss this further. Are you available for a quick call this week?

Best regards,
${senderName}`;

      setGenerated(proposal);
      setGenerating(false);
    }, 1800);
  };

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(generated);
    setCopied(true);
    toast.success('Proposal copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!lead) return;
    updateLeadStatus(lead.id, 'proposal');
    toast.success(`Proposal successfully sent to ${lead.name}!`);
    setCurrentView('leads');
  };

  return (
    <div className="h-full overflow-y-auto select-none">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">AI Proposal Generator</h1>
            <p className="text-sm text-slate-500">Craft personalized proposals from scanned leads and marketplace projects</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* Config panel */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Select Lead</label>
              <select
                value={selectedLead}
                onChange={(e) => setSelectedLead(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Choose a scanned business...</option>
                {leads.slice(0, 15).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.category} (Score: {l.digital_score})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Select Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Choose a marketplace project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — ${p.budget_min.toLocaleString()}–${p.budget_max.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {(['professional', 'friendly', 'persuasive'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors',
                      tone === t
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {lead && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="mb-1 text-xs font-semibold text-slate-500">Lead Context</p>
                <p className="text-sm font-medium text-slate-800">{lead.name}</p>
                <p className="text-xs text-slate-500">{lead.category} · {lead.city}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">Score: {lead.digital_score}</span>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">{lead.rating?.toFixed(1)} ★</span>
                  {!lead.website && <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">No website</span>}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!selectedLead || !selectedProject || generating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-40 shadow-xs"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {generating ? 'Generating Proposal...' : 'Generate Proposal'}
            </button>
          </div>

          {/* Output panel */}
          <div className="flex min-h-[440px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-800">Generated Proposal</h3>
              </div>
              {generated && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                      isEditing
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {isEditing ? 'Done Editing' : 'Edit Proposal'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </button>
                </div>
              )}
            </div>

            {generating ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-slate-500">Crafting your custom proposal...</p>
              </div>
            ) : generated ? (
              isEditing ? (
                <div className="flex-1 flex flex-col">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-blue-600">
                    <span>✏️ You are editing the proposal below. Changes apply automatically to Copy & Send:</span>
                  </div>
                  <textarea
                    value={generated}
                    onChange={(e) => setGenerated(e.target.value)}
                    rows={16}
                    className="w-full flex-1 min-h-[380px] p-3.5 text-sm font-sans leading-relaxed text-slate-900 bg-slate-50/70 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
                    placeholder="Edit your generated proposal text here..."
                  />
                </div>
              ) : (
                <div
                  onClick={() => setIsEditing(true)}
                  className="group relative flex-1 cursor-pointer overflow-y-auto rounded-xl p-3.5 hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-200"
                  title="Click anywhere to edit this proposal"
                >
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600 border border-blue-200">
                    <Pencil className="h-3 w-3" /> Click to Edit
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">{generated}</pre>
                </div>
              )
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <FileText className="h-10 w-10 text-slate-200" />
                <p className="text-sm text-slate-400">Select a lead and project, then click Generate Proposal.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
