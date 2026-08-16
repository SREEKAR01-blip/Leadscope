'use client';

import { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Star,
  Award,
  Play,
  Globe,
  Quote,
  Eye,
  Clock,
  CheckCircle,
  Zap,
  TrendingUp,
  Heart,
  Share2,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { ReelItem, ServicePackage } from '@/lib/marketplace-data';
import { cn } from '@/lib/utils';

type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  client: string;
  year: string;
  description: string;
  tags: string[];
};

const SAMPLE_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'pf-1',
    title: 'Restaurant Ordering Platform',
    category: 'Web Development',
    client: "Ohri's Jiva Imperia",
    year: '2026',
    description: 'Full-stack Next.js website with online ordering, table booking, and CMS-driven menu management.',
    tags: ['Next.js', 'Stripe', 'Supabase'],
  },
  {
    id: 'pf-2',
    title: 'Dental Clinic Booking App',
    category: 'Mobile Development',
    client: 'SmileCare Clinic',
    year: '2025',
    description: 'React Native app with appointment scheduling, reminders, and telehealth video integration.',
    tags: ['React Native', 'Firebase', 'WebRTC'],
  },
  {
    id: 'pf-3',
    title: 'Boutique E-commerce Store',
    category: 'E-commerce',
    client: 'Kalaniketan Silks',
    year: '2026',
    description: 'Shopify store with custom theme, 200+ product catalog, and Klaviyo email automation.',
    tags: ['Shopify', 'Liquid', 'Klaviyo'],
  },
];

function VideoReel({ reel }: { reel: ReelItem }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Video frame */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900">
        {/* Mock video content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, transparent 50%, #06b6d4 100%)',
          }} />
          <button className="group relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-2xl transition-transform hover:scale-110">
            <Play className="ml-1 h-7 w-7 fill-blue-500 text-blue-500" />
            <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
          </button>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
          {reel.duration}
        </div>
        {/* Views badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
          <Eye className="h-3 w-3" />
          {reel.views?.toLocaleString()}
        </div>
        {/* Type tag */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-red-500 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Reel
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-900">{reel.title}</h3>
        <p className="text-xs text-slate-500">{reel.subtitle}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{reel.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {reel.tags.map((t) => (
            <span key={t} className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">{t}</span>
          ))}
        </div>
        {/* Actions */}
        <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3">
          <button
            onClick={() => setLiked(!liked)}
            className={cn('flex items-center gap-1.5 text-xs font-medium transition-colors', liked ? 'text-red-500' : 'text-slate-500 hover:text-red-500')}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-red-500')} />
            {liked ? '1.2k' : '1.1k'}
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-blue-500">
            <MessageCircle className="h-4 w-4" />
            24
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-blue-500">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

function WebsiteMockup({ reel }: { reel: ReelItem }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="ml-2 flex-1 rounded-md bg-white px-3 py-1 text-[11px] text-slate-400">
          {reel.client?.toLowerCase().replace(/\s/g, '')}.com
        </div>
      </div>
      {/* Mock website content */}
      <div className="aspect-video bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
        <div className="flex h-full flex-col">
          {/* Nav bar */}
          <div className="mb-3 flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-slate-300" />
            <div className="flex gap-2">
              <div className="h-2 w-10 rounded bg-slate-200" />
              <div className="h-2 w-10 rounded bg-slate-200" />
              <div className="h-2 w-10 rounded bg-blue-300" />
            </div>
          </div>
          {/* Hero */}
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-2 h-4 w-32 rounded bg-slate-300" />
              <div className="mx-auto mb-3 h-3 w-24 rounded bg-slate-200" />
              <div className="mx-auto h-6 w-20 rounded-full bg-blue-400" />
            </div>
          </div>
          {/* Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 rounded-lg bg-white shadow-sm" />
            <div className="h-12 rounded-lg bg-white shadow-sm" />
            <div className="h-12 rounded-lg bg-white shadow-sm" />
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-slate-900">{reel.title}</h3>
        </div>
        <p className="text-xs text-slate-500">{reel.subtitle}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{reel.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {reel.tags.map((t) => (
            <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{t}</span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Client: {reel.client} · {reel.year}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ reel }: { reel: ReelItem }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-5 shadow-sm">
      <Quote className="mb-3 h-8 w-8 text-amber-300" />
      <p className="mb-4 text-sm leading-relaxed text-slate-700">"{reel.description}"</p>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-sm font-semibold text-white">
          {reel.author?.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{reel.author}</p>
          <p className="text-xs text-slate-500">{reel.author_role}</p>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: reel.rating ?? 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: ServicePackage }) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border-2 bg-white p-5 transition-all hover:shadow-lg',
      pkg.popular ? 'border-blue-400 shadow-md' : 'border-slate-200'
    )}>
      {pkg.popular && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-blue-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Popular
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{pkg.name}</h3>
      <p className="mt-1 text-xs text-slate-500">{pkg.description}</p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">{pkg.currency}{pkg.price.toLocaleString()}</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
        <Clock className="h-3.5 w-3.5" />
        Delivery in {pkg.delivery_days} days
      </div>
      <div className="mt-4 space-y-2">
        {pkg.features.map((f) => (
          <div key={f} className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
            <span className="text-xs text-slate-600">{f}</span>
          </div>
        ))}
      </div>
      <button className={cn(
        'mt-4 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors',
        pkg.popular ? 'bg-blue-500 text-white hover:bg-blue-600' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
      )}>
        Order Package
      </button>
    </div>
  );
}

export function PortfolioBuilderView() {
  const { freelancers, settings, reels, packages } = useApp();
  const [items] = useState<PortfolioItem[]>(SAMPLE_PORTFOLIO);
  const [activeTab, setActiveTab] = useState<'reels' | 'projects' | 'packages'>('reels');
  const profile = freelancers[0];

  const myReels = useMemo(() => reels.filter((r) => r.freelancer_id === profile.id), [reels, profile.id]);
  const myPackages = useMemo(() => packages.filter((p) => p.freelancer_id === profile.id), [packages, profile.id]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Briefcase className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Portfolio Builder</h1>
              <p className="text-sm text-slate-500">Showcase your work to win more projects</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600">
            <Plus className="h-4 w-4" />
            Add Reel
          </button>
        </div>

        {/* Profile summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 text-xl font-semibold text-white">
                {settings.user_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              {profile.online && (
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{profile.name}</h2>
                {profile.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                    <Award className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{profile.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span key={s} className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    <Sparkles className="h-3 w-3 text-blue-400" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{profile.projects_completed}</p>
                <p className="text-xs text-slate-500">Projects</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-900">
                  {profile.rating.toFixed(1)}
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </p>
                <p className="text-xs text-slate-500">{profile.review_count} reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {([
            { key: 'reels' as const, label: 'Portfolio Reels', icon: Play, count: myReels.length },
            { key: 'projects' as const, label: 'Projects', icon: Briefcase, count: items.length },
            { key: 'packages' as const, label: 'Service Packages', icon: Zap, count: myPackages.length },
          ]).map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                <span className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                  isActive ? 'bg-white/20' : 'bg-slate-100'
                )}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reels Feed */}
        {activeTab === 'reels' && (
          <div className="grid gap-5 sm:grid-cols-2">
            {myReels.map((reel) => {
              if (reel.type === 'video') return <VideoReel key={reel.id} reel={reel} />;
              if (reel.type === 'website') return <WebsiteMockup key={reel.id} reel={reel} />;
              return <TestimonialCard key={reel.id} reel={reel} />;
            })}
          </div>
        )}

        {/* Projects Grid */}
        {activeTab === 'projects' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Briefcase className="h-5 w-5 text-slate-500" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.category} · {item.year}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span key={t} className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">{t}</span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Client: {item.client}</p>
              </div>
            ))}
            <button className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-500">
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Add Project</span>
            </button>
          </div>
        )}

        {/* Service Packages */}
        {activeTab === 'packages' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {myPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
            <button className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-500">
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Create Package</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
