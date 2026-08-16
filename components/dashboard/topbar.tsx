'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Search, Bell, ChevronDown, Sparkles, Loader2, MapPin, ChevronRight } from 'lucide-react';
import { REGIONS } from '@/lib/location-data';
import { cn } from '@/lib/utils';

type Props = {
  onSearch?: (location: string) => void;
  scanning?: boolean;
  scanStepText?: string;
};

export function Topbar({ onSearch, scanning = false, scanStepText = '' }: Props) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? REGIONS.filter(
        (r) =>
          r.label.toLowerCase().includes(value.trim().toLowerCase()) ||
          r.city.toLowerCase().includes(value.trim().toLowerCase())
      )
    : REGIONS;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || scanning || !onSearch) return;
    setOpen(false);
    onSearch(trimmed);
  };

  const handleSelect = (label: string) => {
    if (scanning || !onSearch) return;
    setValue(label);
    setOpen(false);
    onSearch(label);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50 px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-500">
          Discover and qualify local business leads
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Location search */}
        <div className="relative hidden md:block">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="City, region, or zip code..."
                aria-label="Search location"
                disabled={scanning}
                className="w-72 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-20 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-60"
              />
              {scanning ? (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />
              ) : (
                <button
                  type="submit"
                  disabled={!value.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-40"
                >
                  Scan
                </button>
              )}
            </div>
          </form>

          {/* Dropdown */}
          {open && !scanning && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            >
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Location Directory
                </p>
              </div>
              {filtered.length > 0 ? (
                <div className="py-1">
                  {filtered.map((region) => {
                    const noWeb = region.businesses.filter((b) => !b.website).length;
                    return (
                      <button
                        key={region.key}
                        onMouseDown={() => handleSelect(region.label)}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50'
                        )}
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <MapPin className="h-4 w-4 text-blue-500" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-slate-900">
                            {region.label}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            {region.businesses.length} businesses · {noWeb} missing websites
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-3 py-4 text-center text-sm text-slate-400">
                  No matching regions. Press Enter to search anyway.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upgrade pill */}
        <button className="hidden items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-2 text-xs font-semibold text-blue-600 transition-all hover:from-blue-100 hover:to-cyan-100 sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          Upgrade
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:text-slate-700">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 transition-colors hover:bg-slate-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-xs font-semibold text-white">
            JD
          </div>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">Jordan</span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
        </button>
      </div>
    </header>
  );
}
