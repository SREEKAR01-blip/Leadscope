'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Layers,
  Plus,
  Minus,
  Crosshair,
  SlidersHorizontal,
  Star,
  Globe,
  GlobeLock,
  Phone,
  MapPinned,
  ChevronDown,
  X,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useApp, type ExtendedLead } from '@/lib/app-context';
import { DigitalAuditPanel } from '@/components/dashboard/digital-audit-panel';
import { PitchGeneratorModal } from '@/components/dashboard/pitch-generator-modal';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(
  () => import('./interactive-map'),
  { ssr: false }
);

type PinTier = 'red' | 'yellow' | 'green';

function leadPinTier(lead: ExtendedLead): PinTier {
  if (!lead.website) return 'red';
  if (!lead.website.startsWith('https://') || lead.digital_score < 60) return 'yellow';
  return 'green';
}

const PIN_COLORS: Record<PinTier, { bg: string; ring: string; text: string; label: string }> = {
  red: { bg: 'bg-red-500', ring: 'ring-red-400', text: 'text-red-600', label: 'No Website — High Opportunity' },
  yellow: { bg: 'bg-amber-500', ring: 'ring-amber-400', text: 'text-amber-600', label: 'Weak Website — Medium Opportunity' },
  green: { bg: 'bg-green-500', ring: 'ring-green-400', text: 'text-green-600', label: 'Fully Optimized' },
};

type Filters = {
  city: string;
  category: string;
  minRating: number;
  websiteStatus: 'all' | 'has' | 'missing' | 'no-ssl';
  minScore: number;
};

const DEFAULT_FILTERS: Filters = {
  city: 'all',
  category: 'all',
  minRating: 0,
  websiteStatus: 'all',
  minScore: 0,
};

export function MapExplorerView() {
  const { leads, searchedLocation } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [auditLead, setAuditLead] = useState<ExtendedLead | null>(null);
  const [pitchLead, setPitchLead] = useState<ExtendedLead | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const cities = useMemo(() => ['all', ...Array.from(new Set(leads.map((l) => l.city)))], [leads]);
  const categories = useMemo(() => ['all', ...Array.from(new Set(leads.map((l) => l.category)))], [leads]);

  const points = useMemo(() => {
    if (leads.length === 0) return [];
    const validLeads = leads.filter((l) => l.latitude != null && l.longitude != null);
    if (validLeads.length === 0) return [];
    const lats = validLeads.map((l) => l.latitude!);
    const lngs = validLeads.map((l) => l.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;
    return validLeads.map((lead) => ({
      lead,
      x: ((lead.longitude! - minLng) / lngRange) * 82 + 9,
      y: 100 - (((lead.latitude! - minLat) / latRange) * 82 + 9),
    }));
  }, [leads]);

  const filteredPoints = useMemo(() => {
    return points.filter(({ lead }) => {
      // City filter
      if (filters.city !== 'all' && lead.city !== filters.city) return false;
      // Category filter
      if (filters.category !== 'all' && lead.category !== filters.category) return false;
      // Rating filter
      if ((lead.rating ?? 0) < filters.minRating) return false;
      // Website status filter
      if (filters.websiteStatus === 'has' && !lead.website) return false;
      if (filters.websiteStatus === 'missing' && lead.website) return false;
      if (filters.websiteStatus === 'no-ssl' && (!lead.website || !lead.website.startsWith('https://'))) return false;
      // Score filter
      if (lead.digital_score < filters.minScore) return false;
      return true;
    });
  }, [points, filters]);

  const selectedLead = selectedId ? leads.find((l) => l.id === selectedId) : null;

  const handlePinClick = useCallback((lead: ExtendedLead) => {
    setSelectedId(lead.id);
  }, []);

  const handleOpenAudit = useCallback((lead: ExtendedLead) => {
    setAuditLead(lead);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.minRating > 0) count++;
    if (filters.websiteStatus !== 'all') count++;
    if (filters.minScore > 0) count++;
    return count;
  }, [filters]);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <MapPinned className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">Map Explorer</h1>
            <p className="text-[11px] text-slate-500">
              {searchedLocation ? `${searchedLocation} · ` : ''}{filteredPoints.length} of {leads.length} businesses
            </p>
          </div>
        </div>

        {/* Filters button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              showFilters || activeFilterCount > 0
                ? 'border-blue-400 bg-blue-50 text-blue-600'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible filter tray */}
      {showFilters && (
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex flex-wrap items-end gap-4">
            {/* City */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">City</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? 'All Cities' : c}</option>
                ))}
              </select>
            </div>
            {/* Category */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>
            {/* Rating */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Min Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none"
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3.0+</option>
                <option value={3.5}>3.5+</option>
                <option value={4}>4.0+</option>
                <option value={4.5}>4.5+</option>
              </select>
            </div>
            {/* Website status */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Website Status</label>
              <select
                value={filters.websiteStatus}
                onChange={(e) => setFilters({ ...filters, websiteStatus: e.target.value as Filters['websiteStatus'] })}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="has">Has Website</option>
                <option value="missing">No Website</option>
                <option value="no-ssl">No SSL / Weak</option>
              </select>
            </div>
            {/* Opportunity score */}
            <div className="min-w-[160px]">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Min Score: {filters.minScore}
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
            {/* Reset */}
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Split screen: map | lead details */}
      <div className="flex min-h-0 flex-1">
        {/* Map panel */}
        <div className="relative flex-1 overflow-hidden border-r border-slate-200 bg-slate-50 min-h-[300px]">
          <InteractiveMap
            leads={filteredPoints.map((p) => p.lead)}
            selectedId={selectedId}
            onSelect={(id) => {
              const lead = leads.find((l) => l.id === id);
              if (lead) handlePinClick(lead);
            }}
            searchedLocation={searchedLocation}
          />
        </div>

        {/* Right panel: lead details list */}
        <div className="flex w-80 flex-col bg-white xl:w-96">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Lead Details</p>
            <p className="text-[11px] text-slate-500">{filteredPoints.length} businesses · Click a pin or card</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredPoints.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm text-slate-400">
                No leads match your filters.
              </div>
            ) : (
              <div className="space-y-px">
                {filteredPoints.map(({ lead }) => {
                  const tier = leadPinTier(lead);
                  const colors = PIN_COLORS[tier];
                  const isSelected = selectedId === lead.id;
                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedId(lead.id)}
                      className={cn(
                        'cursor-pointer border-b border-slate-100 p-3.5 transition-colors hover:bg-slate-50',
                        isSelected && 'bg-blue-50/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn('mt-1 h-3 w-3 flex-shrink-0 rounded-full', colors.bg)} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{lead.name}</p>
                          <p className="text-xs text-slate-500">{lead.category} · {lead.city}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {lead.rating != null && (
                              <span className="flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {lead.rating.toFixed(1)}
                              </span>
                            )}
                            <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-medium', colors.text, 'bg-slate-100')}>
                              Score {lead.digital_score}
                            </span>
                            {!lead.website ? (
                              <span className="flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
                                <GlobeLock className="h-3 w-3" />
                                No site
                              </span>
                            ) : !lead.website.startsWith('https://') ? (
                              <span className="flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
                                <GlobeLock className="h-3 w-3" />
                                No SSL
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 rounded-md bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-600">
                                <Globe className="h-3 w-3" />
                                HTTPS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenAudit(lead); }}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
                          >
                            <Zap className="h-3.5 w-3.5" />
                            Run Digital Audit
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected lead quick info bar */}
      {selectedLead && (
        <div className="flex items-center gap-4 border-t border-slate-200 bg-white px-5 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
            {selectedLead.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">{selectedLead.name}</p>
            <p className="text-xs text-slate-500">{selectedLead.address}</p>
          </div>
          {selectedLead.phone && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Phone className="h-3.5 w-3.5" />{selectedLead.phone}
            </span>
          )}
          {selectedLead.rating != null && (
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {selectedLead.rating.toFixed(1)} ({selectedLead.review_count?.toLocaleString()})
            </span>
          )}
          <button
            onClick={() => handleOpenAudit(selectedLead)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
          >
            <Zap className="h-3.5 w-3.5" />
            Digital Audit
          </button>
          <button
            onClick={() => setSelectedId(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Digital Audit Slide-out Panel */}
      <DigitalAuditPanel
        lead={auditLead}
        onClose={() => setAuditLead(null)}
        onGeneratePitch={(lead) => setPitchLead(lead)}
      />

      <PitchGeneratorModal
        lead={pitchLead}
        onClose={() => setPitchLead(null)}
      />
    </div>
  );
}
