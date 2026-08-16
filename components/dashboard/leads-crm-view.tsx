'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Building2,
  Phone,
  Globe,
  Mail,
  MoreHorizontal,
  ChevronDown,
  Search,
  Filter,
  Download,
  Plus,
  Clock,
  Send,
  Trophy,
  AlertTriangle,
  ExternalLink,
  X,
  FileText,
  Save,
  CheckCircle,
  MapPin,
  Star,
  Sparkles,
  Handshake,
  XCircle,
  LayoutGrid,
  List,
  Zap,
  TrendingUp,
  MessageSquare,
  PhoneCall,
} from 'lucide-react';
import { useApp, type OutreachStatus, type ExtendedLead } from '@/lib/app-context';
import { OutreachGeneratorModal } from './outreach-generator-modal';
import { cn } from '@/lib/utils';

const STAGES: { key: OutreachStatus; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }[] = [
  { key: 'saved', label: 'Saved', icon: Save, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  { key: 'new', label: 'New Lead', icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' },
  { key: 'contacted', label: 'Contacted', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
  { key: 'proposal', label: 'Proposal Sent', icon: Send, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300' },
  { key: 'negotiation', label: 'Negotiation', icon: Handshake, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300' },
  { key: 'won', label: 'Won', icon: Trophy, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300' },
  { key: 'lost', label: 'Lost', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' },
];

const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.key, s]));

type View = 'pipeline' | 'table';

export function LeadsCRMView() {
  const { leads, setLeads, updateLeadStatus, updateLeadNotes } = useApp();
  const [generating, setGenerating] = useState(false);

  const handleGenerateLookalikes = async () => {
    const savedLeads = leads.filter((l) => l.outreach_status === 'saved');
    if (savedLeads.length === 0) {
      alert("Please add some leads to the pipeline first (click 'Add to Pipeline' inside a business profile) to generate lookalikes based on them!");
      return;
    }

    setGenerating(true);
    try {
      const targets = Array.from(new Set(savedLeads.map((l) => `${l.category} in ${l.city}`)));
      let newLeadsCombined: ExtendedLead[] = [];
      for (const target of targets.slice(0, 2)) {
        const res = await fetch(`/api/places?query=${encodeURIComponent(target)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const existingNames = new Set(leads.map((l) => l.name.toLowerCase()));
            const existingPlaceIds = new Set(leads.map((l) => l.place_id));
            const fresh = data
              .filter((l) => !existingNames.has(l.name.toLowerCase()) && !existingPlaceIds.has(l.place_id))
              .map((l) => ({ ...l, outreach_status: 'new' as const }));
            newLeadsCombined = [...newLeadsCombined, ...fresh];
          }
        }
      }

      if (newLeadsCombined.length > 0) {
        setLeads([...leads, ...newLeadsCombined]);
        alert(`Successfully generated ${newLeadsCombined.length} new leads matching your saved leads' categories!`);
      } else {
        alert("No new similar leads found. Try saving leads from other categories or locations!");
      }
    } catch (err) {
      console.error("Failed to generate lookalike leads", err);
      alert("Error occurred while generating leads.");
    } finally {
      setGenerating(false);
    }
  };
  const [view, setView] = useState<View>('pipeline');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | 'all'>('all');
  const [websiteFilter, setWebsiteFilter] = useState<'all' | 'missing' | 'has'>('all');
  const [sortKey, setSortKey] = useState<'score' | 'rating' | 'name'>('score');
  const [drawerLead, setDrawerLead] = useState<ExtendedLead | null>(null);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [outreachLead, setOutreachLead] = useState<ExtendedLead | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OutreachStatus | null>(null);

  const filteredLeads = useMemo(() => {
    let result = leads.filter((lead) => {
      const matchesSearch =
        !search ||
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.category.toLowerCase().includes(search.toLowerCase()) ||
        lead.city.toLowerCase().includes(search.toLowerCase()) ||
        (lead.notes && lead.notes.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || lead.outreach_status === statusFilter;
      let matchesWebsite = true;
      if (websiteFilter === 'missing') matchesWebsite = !lead.website;
      else if (websiteFilter === 'has') matchesWebsite = !!lead.website;
      return matchesSearch && matchesStatus && matchesWebsite;
    });
    result.sort((a, b) => {
      if (sortKey === 'score') return a.digital_score - b.digital_score;
      if (sortKey === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
    return result;
  }, [leads, search, statusFilter, websiteFilter, sortKey]);

  const leadsByStage = useMemo(() => {
    const map: Record<OutreachStatus, ExtendedLead[]> = {
      saved: [], new: [], contacted: [], proposal: [], negotiation: [], won: [], lost: [],
    };
    filteredLeads.forEach((l) => map[l.outreach_status].push(l));
    return map;
  }, [filteredLeads]);

  const handleOpenDrawer = useCallback((lead: ExtendedLead) => {
    setDrawerLead(lead);
    setNotes(lead.notes || '');
    setNotesSaved(false);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerLead(null);
    setNotes('');
    setNotesSaved(false);
  }, []);

  const handleSaveNotes = useCallback(() => {
    if (drawerLead) {
      updateLeadNotes(drawerLead.id, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  }, [drawerLead, notes, updateLeadNotes]);

  const handleExportCSV = useCallback(() => {
    const headers = ['Business Name', 'Category', 'Address', 'City', 'Phone', 'Website', 'Rating', 'Review Count', 'Digital Score', 'Outreach Status', 'Notes'];
    const rows = leads.map((lead) => [
      `"${lead.name.replace(/"/g, '""')}"`, `"${lead.category}"`,
      `"${lead.address?.replace(/"/g, '""') || ''}"`, `"${lead.city}"`,
      `"${lead.phone || ''}"`, `"${lead.website || ''}"`,
      lead.rating ?? '', lead.review_count ?? '', lead.digital_score,
      lead.outreach_status, `"${(lead.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leadscope-prospects.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [leads]);

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, stage: OutreachStatus) => {
    e.preventDefault();
    setDragOverStage(stage);
  };
  const handleDrop = (stage: OutreachStatus) => {
    if (draggedId) {
      updateLeadStatus(draggedId, stage);
      setDraggedId(null);
      setDragOverStage(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Leads CRM</h1>
          <p className="text-sm text-slate-500">
            {filteredLeads.length} leads · {leads.filter((l) => !l.website).length} missing websites · {leads.filter((l) => l.outreach_status === 'won').length} won
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setView('pipeline')}
              className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors', view === 'pipeline' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Pipeline
            </button>
            <button
              onClick={() => setView('table')}
              className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors', view === 'table' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100')}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
          <button
            onClick={handleGenerateLookalikes}
            disabled={generating}
            className={cn(
              "flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-600 hover:to-cyan-600 hover:shadow disabled:opacity-50",
              generating && "animate-pulse"
            )}
          >
            <Sparkles className={cn("h-4 w-4", generating && "animate-spin")} />
            {generating ? "Generating..." : "Generate from Saved"}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-white p-1 border border-slate-200">
            {(['all', 'missing', 'has'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setWebsiteFilter(f)}
                className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-colors', websiteFilter === f ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100')}
              >
                {f === 'all' ? 'All' : f === 'missing' ? 'No Website' : 'Has Website'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OutreachStatus | 'all')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="all">All Stages</option>
              {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Sort:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as 'score' | 'rating' | 'name')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="score">Digital Score</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      {view === 'pipeline' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-3 p-4" style={{ minWidth: 'max-content' }}>
            {STAGES.map((stage) => {
              const stageLeads = leadsByStage[stage.key];
              const StageIcon = stage.icon;
              const isDragOver = dragOverStage === stage.key;
              return (
                <div
                  key={stage.key}
                  onDragOver={(e) => handleDragOver(e, stage.key)}
                  onDrop={() => handleDrop(stage.key)}
                  onDragLeave={() => setDragOverStage(null)}
                  className={cn(
                    'flex w-72 flex-shrink-0 flex-col rounded-xl border-2 bg-slate-50 transition-colors',
                    isDragOver ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200'
                  )}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', stage.bg)}>
                        <StageIcon className={cn('h-3.5 w-3.5', stage.color)} />
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{stage.label}</span>
                    </div>
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[11px] font-bold text-slate-600">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 space-y-2 overflow-y-auto p-2">
                    {stageLeads.map((lead) => (
                      <PipelineCard
                        key={lead.id}
                        lead={lead}
                        onDragStart={() => handleDragStart(lead.id)}
                        onClick={() => handleOpenDrawer(lead)}
                        onOpenOutreach={() => setOutreachLead(lead)}
                        onUpdateStatus={(s) => updateLeadStatus(lead.id, s)}
                      />
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="flex h-20 items-center justify-center text-xs text-slate-300">
                        Drop leads here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Score</th>
                <th className="w-20 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  lead={lead}
                  onUpdateStatus={(s) => updateLeadStatus(lead.id, s)}
                  onOpenDrawer={() => handleOpenDrawer(lead)}
                  onOpenOutreach={() => setOutreachLead(lead)}
                />
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <Building2 className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No leads found</p>
            </div>
          )}
        </div>
      )}

      {/* Drawer */}
      {drawerLead && (
        <LeadDrawer
          lead={drawerLead}
          notes={notes}
          onNotesChange={setNotes}
          onClose={handleCloseDrawer}
          onSaveNotes={handleSaveNotes}
          notesSaved={notesSaved}
          onUpdateStatus={(s) => updateLeadStatus(drawerLead.id, s)}
          onOpenOutreach={() => { setOutreachLead(drawerLead); handleCloseDrawer(); }}
        />
      )}

      {/* Outreach Generator Modal */}
      <OutreachGeneratorModal lead={outreachLead} onClose={() => setOutreachLead(null)} />
    </div>
  );
}

// ─── Pipeline Card ──────────────────────────────────────────────────────────

function PipelineCard({
  lead,
  onDragStart,
  onClick,
  onOpenOutreach,
  onUpdateStatus,
}: {
  lead: ExtendedLead;
  onDragStart: () => void;
  onClick: () => void;
  onOpenOutreach: () => void;
  onUpdateStatus: (s: OutreachStatus) => void;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const websiteMissing = !lead.website;
  const stage = STAGE_MAP[lead.outreach_status];

  // AI Priority Score: high reviews + no website = high priority
  const priorityScore = useMemo(() => {
    const reviewFactor = Math.min((lead.review_count ?? 0) / 5000, 1) * 50;
    const noSiteBonus = websiteMissing ? 40 : 0;
    const lowScoreBonus = lead.digital_score < 50 ? 10 : 0;
    return Math.min(Math.round(reviewFactor + noSiteBonus + lowScoreBonus), 100);
  }, [lead.review_count, lead.digital_score, websiteMissing]);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="group cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing"
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
            {lead.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{lead.name}</p>
            <p className="text-[11px] text-slate-500">{lead.category} · {lead.city}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {lead.rating != null && (
          <span className="flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {lead.rating.toFixed(1)}
          </span>
        )}
        <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-medium', lead.digital_score >= 75 ? 'bg-green-50 text-green-600' : lead.digital_score >= 50 ? 'bg-blue-50 text-blue-600' : lead.digital_score >= 30 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600')}>
          Score {lead.digital_score}
        </span>
        {websiteMissing ? (
          <span className="flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
            <AlertTriangle className="h-3 w-3" /> No site
          </span>
        ) : (
          <span className="flex items-center gap-0.5 rounded-md bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-600">
            <Globe className="h-3 w-3" /> Site
          </span>
        )}
      </div>

      {/* AI Priority Score */}
      {priorityScore >= 70 && (
        <div className="mb-2 flex items-center gap-1.5 rounded-md bg-gradient-to-r from-red-50 to-orange-50 px-2 py-1">
          <Zap className="h-3 w-3 text-red-500" />
          <span className="text-[11px] font-bold text-red-600">
            PITCH FIRST: {priorityScore}/100
          </span>
        </div>
      )}

      {/* Notes indicator */}
      {lead.notes && (
        <div className="mb-2 flex items-start gap-1.5 rounded-md bg-slate-50 px-2 py-1.5">
          <FileText className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
          <p className="line-clamp-2 text-[11px] text-slate-500">{lead.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {/* Status dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={cn('flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium', stage.bg, stage.color)}
          >
            <stage.icon className="h-3 w-3" />
            {stage.label}
            <ChevronDown className="h-3 w-3" />
          </button>
          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowStatusMenu(false)} />
              <div className="absolute left-0 top-full z-30 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {STAGES.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.key}
                      onClick={() => { onUpdateStatus(s.key); setShowStatusMenu(false); }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Icon className={cn('h-3 w-3', s.color)} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {/* Outreach button */}
        <button
          onClick={onOpenOutreach}
          className="flex items-center gap-1 rounded-md bg-blue-500 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-blue-600"
        >
          <Sparkles className="h-3 w-3" />
          AI
        </button>
      </div>
    </div>
  );
}

// ─── Table Row ──────────────────────────────────────────────────────────────

function TableRow({
  lead,
  onUpdateStatus,
  onOpenDrawer,
  onOpenOutreach,
}: {
  lead: ExtendedLead;
  onUpdateStatus: (s: OutreachStatus) => void;
  onOpenDrawer: () => void;
  onOpenOutreach: () => void;
}) {
  const stage = STAGE_MAP[lead.outreach_status];
  const StageIcon = stage.icon;
  const websiteMissing = !lead.website;
  const [open, setOpen] = useState(false);

  return (
    <tr className="cursor-pointer transition-colors hover:bg-slate-50" onClick={onOpenDrawer}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <Building2 className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{lead.name}</p>
            <p className="text-xs text-slate-500">{lead.address}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{lead.category}</span>
      </td>
      <td className="px-4 py-3">
        {lead.phone ? (
          <div className="flex items-center gap-1.5 text-sm text-slate-600"><Phone className="h-3.5 w-3.5" />{lead.phone}</div>
        ) : <span className="text-xs text-slate-400">No phone</span>}
      </td>
      <td className="px-4 py-3">
        {websiteMissing ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            <AlertTriangle className="h-3 w-3" /> No Website
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
            <Globe className="h-3 w-3" /> Has Website
          </span>
        )}
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className={cn('flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium', stage.bg, stage.color)}>
            <StageIcon className="h-3.5 w-3.5" />{stage.label}<ChevronDown className="h-3 w-3" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
              <div className="absolute left-0 top-full z-30 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {STAGES.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button key={s.key} onClick={() => { onUpdateStatus(s.key); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Icon className="h-3.5 w-3.5" />{s.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn('text-sm font-bold', lead.digital_score >= 75 ? 'text-green-600' : lead.digital_score >= 50 ? 'text-blue-600' : lead.digital_score >= 30 ? 'text-amber-600' : 'text-red-600')}>{lead.digital_score}</span>
      </td>
      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <button onClick={onOpenOutreach} className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:scale-105">
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

// ─── Lead Drawer ────────────────────────────────────────────────────────────

function LeadDrawer({
  lead,
  notes,
  onNotesChange,
  onClose,
  onSaveNotes,
  notesSaved,
  onUpdateStatus,
  onOpenOutreach,
}: {
  lead: ExtendedLead;
  notes: string;
  onNotesChange: (n: string) => void;
  onClose: () => void;
  onSaveNotes: () => void;
  notesSaved: boolean;
  onUpdateStatus: (s: OutreachStatus) => void;
  onOpenOutreach: () => void;
}) {
  const stage = STAGE_MAP[lead.outreach_status];
  const StageIcon = stage.icon;
  const websiteMissing = !lead.website;

  // AI Priority Score
  const priorityScore = useMemo(() => {
    const reviewFactor = Math.min((lead.review_count ?? 0) / 5000, 1) * 50;
    const noSiteBonus = websiteMissing ? 40 : 0;
    const lowScoreBonus = lead.digital_score < 50 ? 10 : 0;
    return Math.min(Math.round(reviewFactor + noSiteBonus + lowScoreBonus), 100);
  }, [lead.review_count, lead.digital_score, websiteMissing]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{lead.name}</h2>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', stage.bg, stage.color)}>{stage.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5 p-6">
          {/* AI Priority Score */}
          <div className={cn('flex items-center gap-3 rounded-xl border p-4', priorityScore >= 70 ? 'border-red-200 bg-gradient-to-r from-red-50 to-orange-50' : 'border-slate-200 bg-slate-50')}>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', priorityScore >= 70 ? 'bg-red-500' : 'bg-slate-400')}>
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className={cn('text-lg font-bold', priorityScore >= 70 ? 'text-red-600' : 'text-slate-600')}>
                {priorityScore >= 70 ? `PITCH THIS FIRST: ${priorityScore}/100` : `Priority Score: ${priorityScore}/100`}
              </p>
              <p className="text-xs text-slate-500">
                {websiteMissing
                  ? `High review volume (${lead.review_count?.toLocaleString()}) with zero website presence`
                  : 'Moderate priority based on digital presence'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-slate-400" /><div><p className="text-sm text-slate-900">{lead.address}</p><p className="text-xs text-slate-500">{lead.city}</p></div></div>
              {lead.phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" /><span className="text-sm text-slate-900">{lead.phone}</span></div>}
              {lead.website ? (
                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-blue-600 hover:underline"><Globe className="h-4 w-4" />{lead.website}<ExternalLink className="h-3 w-3" /></a>
              ) : (
                <div className="flex items-center gap-3 text-sm text-red-600"><Globe className="h-4 w-4" /><span className="font-medium">No Website — High Opportunity!</span></div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Business Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className={cn('text-2xl font-bold', lead.digital_score >= 75 ? 'text-green-600' : lead.digital_score >= 50 ? 'text-blue-600' : lead.digital_score >= 30 ? 'text-amber-600' : 'text-red-600')}>{lead.digital_score}</p>
                <p className="text-xs text-slate-500">Digital Score</p>
              </div>
              {lead.rating != null && <div className="text-center"><p className="text-2xl font-bold text-amber-500">{lead.rating.toFixed(1)}</p><p className="text-xs text-slate-500">Rating</p></div>}
              {lead.review_count != null && <div className="text-center"><p className="text-2xl font-bold text-slate-700">{lead.review_count.toLocaleString()}</p><p className="text-xs text-slate-500">Reviews</p></div>}
            </div>
          </div>

          {/* Stage Selector */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Pipeline Stage</h3>
            <div className="grid grid-cols-3 gap-2">
              {STAGES.map((s) => {
                const Icon = s.icon;
                const isActive = lead.outreach_status === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => onUpdateStatus(s.key)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-[11px] font-medium transition-all',
                      isActive ? cn(s.bg, s.color, 'border-current') : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-slate-600" /><h3 className="text-sm font-semibold text-slate-900">Notes & Log</h3></div>
              {notesSaved && <span className="flex items-center gap-1 text-xs font-medium text-green-600"><CheckCircle className="h-3 w-3" />Saved</span>}
            </div>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes about this lead... e.g., 'Called owner, scheduled redesign pitch for Tuesday'"
              rows={5}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <div className="mt-3 flex justify-end">
              <button onClick={onSaveNotes} className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600">
                <Save className="h-4 w-4" />Save Notes
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button onClick={onOpenOutreach} className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]">
              <Sparkles className="h-4 w-4" />AI Outreach Generator
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
