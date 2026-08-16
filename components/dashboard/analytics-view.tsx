'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Globe,
  Building2,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronDown,
  Scan,
  PieChart,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

type TimeFilter = 'week' | 'month' | 'all';

// Mock data generators based on time filter
function getMockData(timeFilter: TimeFilter) {
  const multipliers = {
    week: { scan: 1, multiplier: 0.25 },
    month: { scan: 1, multiplier: 0.5 },
    all: { scan: 1, multiplier: 1 },
  };

  const config = multipliers[timeFilter];

  return {
    totalScanVolume: Math.round(142 * config.multiplier),
    websiteOpportunities: Math.round(98 * config.multiplier),
    targetHitRate: 69,
    pitchConversion: 42,

    // Leads discovered over time (7 data points)
    leadsOverTime: timeFilter === 'week'
      ? [
          { label: 'Mon', value: 12 },
          { label: 'Tue', value: 18 },
          { label: 'Wed', value: 24 },
          { label: 'Thu', value: 19 },
          { label: 'Fri', value: 31 },
          { label: 'Sat', value: 22 },
          { label: 'Sun', value: 16 },
        ]
      : timeFilter === 'month'
      ? [
          { label: 'Week 1', value: 45 },
          { label: 'Week 2', value: 62 },
          { label: 'Week 3', value: 78 },
          { label: 'Week 4', value: 91 },
          { label: 'Week 5', value: 68 },
          { label: 'Week 6', value: 84 },
          { label: 'Week 7', value: 72 },
        ]
      : [
          { label: 'Jan', value: 45 },
          { label: 'Feb', value: 62 },
          { label: 'Mar', value: 78 },
          { label: 'Apr', value: 55 },
          { label: 'May', value: 91 },
          { label: 'Jun', value: 84 },
          { label: 'Jul', value: 67 },
        ],

    // Opportunity density by industry
    industryDensity: [
      { industry: 'Restaurants', percentage: 92, count: Math.round(34 * config.multiplier) },
      { industry: 'Salons', percentage: 78, count: Math.round(28 * config.multiplier) },
      { industry: 'Auto Repair', percentage: 65, count: Math.round(22 * config.multiplier) },
      { industry: 'Healthcare', percentage: 54, count: Math.round(18 * config.multiplier) },
      { industry: 'Boutiques', percentage: 48, count: Math.round(16 * config.multiplier) },
      { industry: 'Gyms', percentage: 42, count: Math.round(14 * config.multiplier) },
    ],
  };
}

export function AnalyticsView() {
  const { leads } = useApp();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const mockData = useMemo(() => getMockData(timeFilter), [timeFilter]);

  // Category breakdown from real data
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((lead) => {
      counts[lead.category] = (counts[lead.category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [leads]);

  // KPI Summary Cards
  const kpiCards = [
    {
      title: 'Total Scan Volume',
      value: mockData.totalScanVolume,
      change: '+18%',
      positive: true,
      icon: Scan,
      color: 'blue',
      description: 'Businesses scanned',
    },
    {
      title: 'Website Opportunities',
      value: mockData.websiteOpportunities,
      change: '+24%',
      positive: true,
      icon: Globe,
      color: 'amber',
      description: 'Missing/Unoptimized sites',
    },
    {
      title: 'Target Hit Rate',
      value: `${mockData.targetHitRate}%`,
      change: '+5%',
      positive: true,
      icon: Target,
      color: 'green',
      description: 'Missing website ratio',
    },
    {
      title: 'Pitch Conversion',
      value: `${mockData.pitchConversion}%`,
      change: '+12%',
      positive: true,
      icon: Award,
      color: 'purple',
      description: 'Closed/Contacted rate',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', iconBg: 'bg-cyan-100' },
  };

  const timeFilterLabels: Record<TimeFilter, string> = {
    week: 'This Week',
    month: 'This Month',
    all: 'All Time',
  };

  // Calculate chart dimensions
  const maxLeadValue = Math.max(...mockData.leadsOverTime.map((d) => d.value), 1);
  const chartWidth = 100;
  const chartHeight = 50;
  const chartPadding = 8;

  // Generate SVG path for line/area chart
  const chartPoints = mockData.leadsOverTime.map((d, i) => {
    const x = chartPadding + (i / (mockData.leadsOverTime.length - 1)) * (chartWidth - 2 * chartPadding);
    const y = chartHeight - chartPadding - ((d.value / maxLeadValue) * (chartHeight - 2 * chartPadding));
    return { x, y };
  });

  const linePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const areaPath = `
    M ${chartPadding} ${chartHeight - chartPadding}
    ${chartPoints.map((p, i) => `L ${p.x} ${p.y}`).join(' ')}
    L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - chartPadding}
    Z
  `;

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header with Time Filter */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Analytics Dashboard</h1>
            <p className="text-sm text-slate-500">Performance metrics and business intelligence</p>
          </div>

          {/* Time Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              {timeFilterLabels[timeFilter]}
              <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  {(['week', 'month', 'all'] as TimeFilter[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setTimeFilter(filter);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
                        timeFilter === filter
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span className={cn(
                        'h-2 w-2 rounded-full',
                        timeFilter === filter ? 'bg-blue-500' : 'bg-slate-300'
                      )} />
                      {timeFilterLabels[filter]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* KPI Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => {
            const colors = colorClasses[card.color];
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                {/* Subtle gradient background */}
                <div className={cn('absolute inset-0 opacity-5', colors.bg)} />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className={cn('rounded-lg p-2.5', colors.iconBg)}>
                      <Icon className={cn('h-5 w-5', colors.text)} />
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                        card.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}
                    >
                      {card.positive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {card.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                    <p className="text-sm font-medium text-slate-700">{card.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* SVG Line/Area Chart - Leads Discovered Over Time */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Leads Discovered Over Time</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {timeFilter === 'week' ? 'Last 7 days' : timeFilter === 'month' ? 'Last 7 weeks' : 'Last 7 months'}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-blue-600">
                  +{Math.round(((mockData.leadsOverTime[mockData.leadsOverTime.length - 1].value / mockData.leadsOverTime[0].value) - 1) * 100)}%
                </span>
              </div>
            </div>

            {/* SVG Line/Area Chart */}
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48"
              preserveAspectRatio="none"
            >
              {/* Gradient definition */}
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1={chartPadding}
                  y1={chartPadding + ((100 - y) / 100) * (chartHeight - 2 * chartPadding)}
                  x2={chartWidth - chartPadding}
                  y2={chartPadding + ((100 - y) / 100) * (chartHeight - 2 * chartPadding)}
                  stroke="#e2e8f0"
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {/* Area fill */}
              <path
                d={areaPath}
                fill="url(#areaGradient)"
                vectorEffect="non-scaling-stroke"
              />

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />

              {/* Data points */}
              {chartPoints.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill="white"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}
            </svg>

            {/* X-axis labels */}
            <div className="mt-3 flex justify-between px-2">
              {mockData.leadsOverTime.map((d) => (
                <span key={d.label} className="text-xs text-slate-500">{d.label}</span>
              ))}
            </div>
          </div>

          {/* CSS Bar Chart - Opportunity Density by Industry */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Opportunity Density by Industry</h3>
                <p className="text-xs text-slate-500 mt-0.5">Businesses missing websites by category</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5">
                <PieChart className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">Top 6 Industries</span>
              </div>
            </div>

            {/* Modern Bar Chart */}
            <div className="space-y-4">
              {mockData.industryDensity.map((item, index) => {
                const colors = [
                  { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-400' },
                  { bg: 'bg-green-500', gradient: 'from-green-500 to-green-400' },
                  { bg: 'bg-amber-500', gradient: 'from-amber-500 to-amber-400' },
                  { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-400' },
                  { bg: 'bg-cyan-500', gradient: 'from-cyan-500 to-cyan-400' },
                  { bg: 'bg-rose-500', gradient: 'from-rose-500 to-rose-400' },
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={item.industry} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">{item.industry}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{item.count} leads</span>
                        <span className="text-sm font-bold text-slate-900">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="relative h-8 overflow-hidden rounded-lg bg-slate-100">
                      {/* Background track */}
                      <div className="absolute inset-0 bg-slate-50" />

                      {/* Gradient fill bar */}
                      <div
                        className={cn(
                          'absolute left-0 top-0 h-full rounded-lg bg-gradient-to-r transition-all duration-700 ease-out',
                          color.gradient
                        )}
                        style={{ width: `${item.percentage}%` }}
                      />

                      {/* Shine effect */}
                      <div
                        className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ width: `${item.percentage}%` }}
                      />

                      {/* Percentage label inside bar */}
                      {item.percentage > 20 && (
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ width: `${item.percentage}%` }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow-sm">
                            {item.percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Breakdown - Updated */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Vertical Breakdown</h3>
                <p className="text-xs text-slate-500 mt-0.5">Active leads by category</p>
              </div>
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>

            {/* Donut Chart */}
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="-rotate-90 transform">
                  {(() => {
                    const total = categoryBreakdown.reduce((s, [, c]) => s + c, 0) || 1;
                    let offset = 0;
                    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                    return categoryBreakdown.map(([cat], i) => {
                      const count = categoryBreakdown[i]?.[1] || 0;
                      const percent = (count / total) * 100;
                      const dashArray = `${percent} ${100 - percent}`;
                      const style = {
                        stroke: colors[i % colors.length],
                        strokeDasharray: dashArray,
                        strokeDashoffset: -offset,
                      };
                      offset += percent;
                      return (
                        <circle
                          key={cat}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          strokeWidth="16"
                          style={style}
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-slate-900">{leads.length}</span>
                    <span className="block text-xs text-slate-500">Total</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {categoryBreakdown.map(([cat, count], i) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500', 'bg-cyan-500'];
                  return (
                    <div key={cat} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={cn('h-2.5 w-2.5 rounded-full', colors[i % colors.length])} />
                        <span className="text-slate-600">{cat}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Outreach Funnel - Updated */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Outreach Funnel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pipeline conversion stages</p>
              </div>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </div>

            {(() => {
              const statusCounts = {
                new: leads.filter((l) => l.outreach_status === 'new').length,
                contacted: leads.filter((l) => l.outreach_status === 'contacted').length,
                proposal: leads.filter((l) => l.outreach_status === 'proposal').length,
                won: leads.filter((l) => l.outreach_status === 'won').length,
              };
              const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;
              const stages = [
                { key: 'new', label: 'New Leads', count: statusCounts.new, color: 'bg-slate-500', light: 'bg-slate-100' },
                { key: 'contacted', label: 'Contacted', count: statusCounts.contacted, color: 'bg-blue-500', light: 'bg-blue-100' },
                { key: 'proposal', label: 'Proposal Sent', count: statusCounts.proposal, color: 'bg-amber-500', light: 'bg-amber-100' },
                { key: 'won', label: 'Closed Won', count: statusCounts.won, color: 'bg-green-500', light: 'bg-green-100' },
              ];

              return (
                <div className="space-y-3">
                  {stages.map((stage, index) => {
                    const percentage = Math.round((stage.count / total) * 100);
                    return (
                      <div key={stage.key} className="flex items-center gap-3">
                        <span className="w-24 text-xs text-slate-600">{stage.label}</span>
                        <div className="flex-1">
                          <div className={cn('relative h-7 overflow-hidden rounded-lg', stage.light)}>
                            <div
                              className={cn('absolute left-0 top-0 h-full rounded-lg transition-all duration-500', stage.color)}
                              style={{ width: `${Math.max((stage.count / Math.max(...Object.values(statusCounts), 1)) * 100, 5)}%` }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-700">
                              {stage.count}
                            </span>
                          </div>
                        </div>
                        <div className="w-12 text-right">
                          <span className="text-xs font-medium text-slate-500">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Conversion Rate</span>
                      <span className="font-bold text-green-600">
                        {total > 0 ? Math.round(((statusCounts.contacted + statusCounts.won) / total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
