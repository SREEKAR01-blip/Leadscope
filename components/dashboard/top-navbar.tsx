'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  LayoutDashboard,
  Map,
  Building2,
  BarChart3,
  Settings,
  LifeBuoy,
  ChevronRight,
  ChevronDown,
  Check,
  FileText,
  Briefcase,
  Store,
  ShieldCheck,
  Wallet,
  MessageSquare,
  Globe,
  Scale,
  ScrollText,
  User,
  Wrench,
  Search,
  Loader2,
  MapPin,
  Sparkles,
  Compass,
  Bell,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp, type ViewType, type Role } from '@/lib/app-context';
import { REGIONS } from '@/lib/location-data';
import { LogoIcon } from '@/components/ui/logo';

type NavItem = {
  label: string;
  view: ViewType;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const FREELANCER_NAV: NavItem[] = [
  { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { label: 'Map Explorer', view: 'map', icon: Map },
  { label: 'Leads CRM', view: 'leads', icon: Building2 },
  { label: 'AI Proposal', view: 'proposal-generator', icon: FileText },
  { label: 'Portfolio', view: 'portfolio-builder', icon: Briefcase },
  { label: 'Marketplace', view: 'marketplace', icon: Store },
  { label: 'Analytics', view: 'analytics', icon: BarChart3 },
  { label: 'Settings', view: 'settings', icon: Settings },
];

const BUSINESS_NAV: NavItem[] = [
  { label: 'Dashboard', view: 'business-dashboard', icon: LayoutDashboard },
  { label: 'Verification', view: 'claim-verification', icon: ShieldCheck },
  { label: 'Marketplace', view: 'freelancer-marketplace', icon: Store },
  { label: 'AI Audit Score', view: 'ai-audit', icon: Sparkles },
  { label: 'Escrow Payments', view: 'escrow-payments', icon: Wallet },
  { label: 'Chat', view: 'in-app-chat', icon: MessageSquare },
  { label: 'Support', view: 'support', icon: LifeBuoy },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Analytics', view: 'global-analytics', icon: Globe },
  { label: 'Verifications', view: 'verification-requests', icon: ShieldCheck },
  { label: 'Disputes', view: 'dispute-resolution', icon: Scale },
  { label: 'Escrow Audit', view: 'escrow-audit', icon: Wallet },
  { label: 'System Logs', view: 'system-logs', icon: ScrollText },
];

const JOB_SEEKER_NAV: NavItem[] = [
  { label: 'Dashboard', view: 'job-seeker-dashboard', icon: LayoutDashboard },
  { label: 'Search Jobs', view: 'job-search', icon: Briefcase },
  { label: 'Applications', view: 'my-applications', icon: FileText },
  { label: 'Profile', view: 'job-seeker-profile', icon: User },
  { label: 'Chat', view: 'job-seeker-chat', icon: MessageSquare },
];

const ROLE_CONFIG: Record<Role, { label: string; nav: NavItem[]; icon: React.ComponentType<{ className?: string }>; accent: string }> = {
  freelancer: {
    label: 'Freelancer / Agency',
    nav: FREELANCER_NAV,
    icon: Compass,
    accent: 'from-blue-500 to-cyan-500',
  },
  business_owner: {
    label: 'Business Owner',
    nav: BUSINESS_NAV,
    icon: Store,
    accent: 'from-emerald-500 to-teal-500',
  },
  admin: {
    label: 'Platform Admin',
    nav: ADMIN_NAV,
    icon: ShieldCheck,
    accent: 'from-slate-700 to-slate-900',
  },
  job_seeker: {
    label: 'Job Seeker',
    nav: JOB_SEEKER_NAV,
    icon: Briefcase,
    accent: 'from-purple-500 to-indigo-500',
  },
};

type Props = {
  onSearch?: (query: string) => void;
  scanning?: boolean;
  scanStepText?: string;
};

export function TopNavbar({ onSearch, scanning = false, scanStepText = '' }: Props) {
  const { currentView, setCurrentView, role, user, logout, leads } = useApp();
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const config = ROLE_CONFIG[role];
  const navItems = config.nav;
  const newLeadsCount = leads.filter((l) => l.outreach_status === 'new').length;

  const filteredRegions = searchValue.trim()
    ? REGIONS.filter(
        (r) =>
          r.label.toLowerCase().includes(searchValue.trim().toLowerCase()) ||
          r.city.toLowerCase().includes(searchValue.trim().toLowerCase())
      )
    : REGIONS;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed || scanning || !onSearch) return;
    setDropdownOpen(false);
    onSearch(trimmed);
  };

  const handleSelectRegion = (label: string) => {
    if (scanning || !onSearch) return;
    setSearchValue(label);
    setDropdownOpen(false);
    onSearch(label);
  };

  return (
    <header className="flex h-20 w-full flex-col border-b border-slate-200 bg-slate-900 text-white select-none">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-3">
          <LogoIcon size={38} />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-white">
              LeadScope
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              Local Intelligence
            </span>
          </div>
        </div>

        {/* Middle Section: Horizontal Nav Tiles */}
        <nav className="hidden items-center gap-1.5 overflow-x-auto px-4 md:flex lg:gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            const Icon = item.icon;
            const badge = item.view === 'leads' && newLeadsCount > 0 ? String(newLeadsCount) : item.badge;

            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl px-3 py-1.5 text-center transition-all duration-200 min-w-[76px] lg:min-w-[84px] h-[58px] border border-transparent',
                  isActive
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] mb-1 transition-transform group-hover:scale-110',
                    isActive ? 'text-blue-400' : 'text-slate-500'
                  )}
                />
                <span className="text-[10px] font-bold leading-none tracking-wide">
                  {item.label}
                </span>
                {badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white ring-2 ring-slate-900">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Search & Profile & Logout */}
        <div className="flex items-center gap-3">
          {/* Location / Category search */}
          <div className="relative hidden lg:block">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  ref={searchInputRef}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search location or category..."
                  aria-label="Search local businesses"
                  disabled={scanning}
                  className="w-64 rounded-xl border border-slate-800 bg-slate-950/60 py-2 pl-9 pr-20 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                />
                {scanning ? (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />
                ) : (
                  <button
                    type="submit"
                    disabled={!searchValue.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
                  >
                    Search
                  </button>
                )}
              </div>
            </form>

            {/* Dropdown for locations */}
            {dropdownOpen && !scanning && (
              <div
                ref={searchDropdownRef}
                className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl"
              >
                <div className="border-b border-slate-800 px-3 py-2 bg-slate-950/20">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    Quick Directories
                  </p>
                </div>
                {filteredRegions.length > 0 ? (
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {filteredRegions.map((region) => {
                      const noWeb = region.businesses.filter((b) => !b.website).length;
                      return (
                        <button
                          key={region.key}
                          type="button"
                          onMouseDown={() => handleSelectRegion(region.label)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-slate-800"
                        >
                          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
                            <MapPin className="h-4.5 w-4.5" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="block text-xs font-semibold text-white">
                              {region.label}
                            </span>
                            <span className="block text-[9px] text-slate-400">
                              {region.businesses.length} businesses · {noWeb} missing sites
                            </span>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-center text-xs text-slate-500">
                    No matching regions. Press Enter to search categories.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button 
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/20 text-slate-400 transition-colors hover:text-white"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
          </button>

          {/* User profile with dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/20 px-2.5 py-1.5 text-left transition-colors hover:bg-slate-800/40"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-xs font-bold text-white shadow-inner">
                {user ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'JD'}
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="text-xs font-semibold text-white truncate max-w-[80px]">
                  {user ? user.name.split(' ')[0] : 'Guest'}
                </span>
                <span className="text-[9px] font-medium text-slate-400 capitalize">
                  {config.label.split(' ')[0]}
                </span>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 sm:block" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
                <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/20">
                  <p className="text-xs font-bold text-white truncate">{user ? user.name : 'Guest User'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user ? user.email : 'guest@company.com'}</p>
                </div>
                <div className="py-1">
                  <div className="px-3.5 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    Role Locked: {role.replace('_', ' ')}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold text-red-400 transition-colors hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
