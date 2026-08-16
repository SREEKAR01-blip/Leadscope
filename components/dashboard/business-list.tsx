'use client';

import { useState } from 'react';
import { Star, MapPin, Phone, Globe, Search, SlidersHorizontal, ArrowUpDown, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import type { ExtendedLead } from '@/lib/app-context';
import { cn } from '@/lib/utils';

type Props = {
  leads: ExtendedLead[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onViewProfile: (lead: ExtendedLead) => void;
  onGeneratePitch?: (lead: ExtendedLead) => void;
  scanning?: boolean;
  scanStepText?: string;
  scanProgress?: number;
  onSearch?: (query: string) => void;
};

type SortKey = 'score' | 'rating' | 'name';

export function BusinessList({ leads, selectedId, onSelect, onViewProfile, onGeneratePitch, scanning = false, scanStepText = '', scanProgress = 0, onSearch }: Props) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('score');

  const filtered = leads
    .filter(
      (l) =>
        (l.name || '').toLowerCase().includes(query.toLowerCase()) ||
        (l.category || '').toLowerCase().includes(query.toLowerCase()) ||
        (l.city || '').toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'score') return b.digital_score - a.digital_score;
      if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      return a.name.localeCompare(b.name);
    });

  const handleLocalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Local Businesses</h2>
            <p className="text-[11px] text-slate-500">
              {filtered.length} of {leads.length} results
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleLocalSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or scan (e.g. Apollo)..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={scanning || !query.trim()}
            className="rounded-lg bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            Search
          </button>
        </form>

        {/* Sort tabs */}
        <div className="mt-3 flex items-center gap-1">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          {(['score', 'rating', 'name'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                sort === key
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3">
        {scanning ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-900">
                Scanning businesses...
              </p>
              <p className="font-mono text-[11px] text-blue-500">{scanStepText}</p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-1 flex justify-between">
                <span className="text-[11px] text-slate-400">Progress</span>
                <span className="text-[11px] font-semibold text-slate-600">{scanProgress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            {leads.length === 0 ? (
              <>
                <Search className="h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-500">No leads yet.</p>
                <p className="text-xs text-slate-400">
                  Search a city or zip code above to start scanning.
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-500">No businesses match your search.</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((lead, idx) => {
              const isSelected = selectedId === lead.id;
              const websiteMissing = !lead.website || lead.website.trim() === '';
              return (
                <div
                  key={lead.id}
                  onClick={() => onSelect(lead.id)}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  className={cn(
                    'group cursor-pointer rounded-xl border p-3.5 transition-all duration-200',
                    isSelected
                      ? 'border-blue-300 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                  )}
                >
                  <div className="flex gap-3.5">
                    {/* Image */}
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
                      {lead.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={lead.image_url}
                          alt={lead.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <MapPin className="h-5 w-5" />
                        </div>
                      )}
                      <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-600 backdrop-blur">
                        {lead.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {lead.name}
                          </h3>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {lead.address}, {lead.city}
                            </span>
                          </p>
                        </div>
                        {lead.rating != null && (
                          <div className="flex flex-shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-[11px] font-semibold text-amber-600">
                              {lead.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Website Missing badge */}
                      {websiteMissing && (
                        <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          Website Missing — High Opportunity Lead
                        </div>
                      )}

                      {/* Contact row */}
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        )}
                        {lead.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span className="truncate">Website</span>
                          </span>
                        )}
                        {lead.review_count != null && (
                          <span>{lead.review_count} reviews</span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2.5">
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Score
                          </div>
                          <div className={cn(
                            'text-sm font-bold',
                            lead.digital_score >= 75 ? 'text-green-600' :
                            lead.digital_score >= 50 ? 'text-blue-600' :
                            lead.digital_score >= 30 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {lead.digital_score}/100
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {websiteMissing && onGeneratePitch && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGeneratePitch(lead);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md"
                            >
                              <Sparkles className="h-3 w-3" />
                              Pitch
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewProfile(lead);
                            }}
                            className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
