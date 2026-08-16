'use client';

import { useState, useRef, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp, type ViewType, type Role } from '@/lib/app-context';
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
  { label: 'AI Proposal Generator', view: 'proposal-generator', icon: FileText },
  { label: 'Portfolio Builder', view: 'portfolio-builder', icon: Briefcase },
  { label: 'Marketplace Projects', view: 'marketplace', icon: Store },
  { label: 'Analytics', view: 'analytics', icon: BarChart3 },
  { label: 'Settings', view: 'settings', icon: Settings },
];

const BUSINESS_NAV: NavItem[] = [
  { label: 'Business Dashboard', view: 'business-dashboard', icon: LayoutDashboard },
  { label: 'Claim / Verification', view: 'claim-verification', icon: ShieldCheck },
  { label: 'Freelancer Marketplace', view: 'freelancer-marketplace', icon: Store },
  { label: 'AI Audit Score', view: 'ai-audit', icon: Sparkles },
  { label: 'Escrow Payments', view: 'escrow-payments', icon: Wallet },
  { label: 'In-App Chat', view: 'in-app-chat', icon: MessageSquare },
  { label: 'Support', view: 'support', icon: LifeBuoy },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Global Analytics', view: 'global-analytics', icon: Globe },
  { label: 'Verification Requests', view: 'verification-requests', icon: ShieldCheck },
  { label: 'Dispute Resolution Center', view: 'dispute-resolution', icon: Scale },
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
    icon: Wrench,
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

const ROLE_OPTIONS: { value: Role; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { value: 'freelancer', label: 'Freelancer / Agency', icon: Wrench, description: 'Find leads, build proposals, manage projects' },
  { value: 'business_owner', label: 'Business Owner', icon: Store, description: 'Claim your business, hire freelancers, pay via escrow' },
  { value: 'admin', label: 'Platform Admin', icon: ShieldCheck, description: 'Oversee verifications, disputes, and platform health' },
  { value: 'job_seeker', label: 'Job Seeker', icon: Briefcase, description: 'Find local jobs, apply to listings, chat with businesses' },
];

function RoleSwitcher() {
  const { role, setRole } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const config = ROLE_CONFIG[role];
  const RoleIcon = config.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition-all duration-200 hover:border-slate-300 hover:shadow-sm',
          open && 'border-slate-300 shadow-sm'
        )}
      >
        <span className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white', config.accent)}>
          <RoleIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Current View
          </p>
          <p className="truncate text-sm font-semibold text-slate-800">{config.label}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Switch Perspective
            </p>
          </div>
          <div className="py-1">
            {ROLE_OPTIONS.map((opt) => {
              const OptIcon = opt.icon;
              const isActive = role === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setRole(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50',
                    isActive && 'bg-blue-50/50'
                  )}
                >
                  <span className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                  )}>
                    <OptIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-semibold', isActive ? 'text-blue-600' : 'text-slate-800')}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] leading-tight text-slate-500">{opt.description}</p>
                  </div>
                  {isActive && <Check className="mt-1 h-4 w-4 flex-shrink-0 text-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { currentView, setCurrentView, leads, role, settings } = useApp();
  const config = ROLE_CONFIG[role];
  const navItems = config.nav;

  const newLeadsCount = leads.filter((l) => l.outreach_status === 'new').length;

  const renderNav = (items: NavItem[]) =>
    items.map((item) => {
      const isActive = currentView === item.view;
      const Icon = item.icon;
      const badge = item.view === 'leads' && newLeadsCount > 0 ? String(newLeadsCount) : item.badge;
      return (
        <button
          key={item.view}
          onClick={() => setCurrentView(item.view)}
          className={cn(
            'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          <Icon
            className={cn(
              'h-[18px] w-[18px] flex-shrink-0 transition-colors',
              isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'
            )}
          />
          <span className="flex-1 text-left">{item.label}</span>
          {badge && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
              {badge}
            </span>
          )}
          {isActive && <ChevronRight className="h-4 w-4 flex-shrink-0 text-blue-500" />}
        </button>
      );
    });

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-slate-50">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <LogoIcon size={36} />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold tracking-tight text-slate-900">
            LeadScope
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            Local Intelligence
          </span>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="border-b border-slate-200 p-3">
        <RoleSwitcher />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {config.label}
        </p>
        {renderNav(navItems)}
      </nav>

      {/* User card */}
      <div className="border-t border-slate-200 p-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-sm font-semibold text-white">
              {settings.user_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{settings.user_name}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                {config.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
