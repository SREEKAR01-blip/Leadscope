'use client';

import { Navigation, Loader2 } from 'lucide-react';
import type { ExtendedLead } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Dynamically import InteractiveMap to prevent SSR compilation errors
const InteractiveMap = dynamic(
  () => import('./interactive-map'),
  { ssr: false }
);

type Props = {
  leads: ExtendedLead[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchedLocation?: string | null;
  scanning?: boolean;
  scanProgress?: number;
  scanStepText?: string;
};

export function MapSimulation({
  leads,
  selectedId,
  onSelect,
  searchedLocation,
  scanning = false,
  scanProgress = 0,
  scanStepText = '',
}: Props) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Navigation className="h-4 w-4 text-blue-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Interactive Map</h2>
            <p className="text-[11px] text-slate-500">
              {searchedLocation ? `${searchedLocation} · ` : ''}
              {leads.length} businesses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
              scanning ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
            )}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            {scanning ? 'Scanning' : 'Live Map'}
          </span>
        </div>
      </div>

      {/* Scan progress bar */}
      {scanning && (
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium text-blue-600">{scanStepText}</span>
            <span className="text-[11px] font-semibold text-slate-500">{scanProgress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Map canvas */}
      <div className="relative flex-1 overflow-hidden bg-slate-50 min-h-[300px]">
        {scanning ? (
          <div className="pointer-events-none absolute inset-0 z-20 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center">
            {/* Radar rings */}
            <div className="relative">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/40"
                  style={{
                    width: `${n * 80}px`,
                    height: `${n * 80}px`,
                    animation: `radar-ring 2s ease-out ${n * 0.4}s infinite`,
                  }}
                />
              ))}
              <span className="flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-lg shadow-blue-400/50" />
            </div>
          </div>
        ) : (
          <InteractiveMap
            leads={leads}
            selectedId={selectedId}
            onSelect={onSelect}
            searchedLocation={searchedLocation ?? null}
          />
        )}
      </div>
    </div>
  );
}
