'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapSimulation } from '@/components/dashboard/map-simulation';
import { BusinessList } from '@/components/dashboard/business-list';
import { ProfileDialog } from '@/components/dashboard/profile-dialog';
import { TopNavbar } from '@/components/dashboard/top-navbar';
import { AuthPage } from '@/components/dashboard/auth-page';
import { MapExplorerView } from '@/components/dashboard/map-explorer-view';
import { LeadsCRMView } from '@/components/dashboard/leads-crm-view';
import { AnalyticsView } from '@/components/dashboard/analytics-view';
import { SettingsView } from '@/components/dashboard/settings-view';
import { SupportView } from '@/components/dashboard/support-view';
import { PitchGeneratorModal } from '@/components/dashboard/pitch-generator-modal';
import { ProposalGeneratorView } from '@/components/dashboard/proposal-generator-view';
import { PortfolioBuilderView } from '@/components/dashboard/portfolio-builder-view';
import { MarketplaceView } from '@/components/dashboard/marketplace-view';
import { BusinessDashboardView } from '@/components/dashboard/business-dashboard-view';
import { ClaimVerificationView } from '@/components/dashboard/claim-verification-view';
import { FreelancerMarketplaceView } from '@/components/dashboard/freelancer-marketplace-view';
import { AIAuditView } from '@/components/dashboard/ai-audit-view';
import { EscrowPaymentsView } from '@/components/dashboard/escrow-payments-view';
import { InAppChatView } from '@/components/dashboard/in-app-chat-view';
import { GlobalAnalyticsView } from '@/components/dashboard/global-analytics-view';
import { VerificationRequestsView } from '@/components/dashboard/verification-requests-view';
import { DisputeResolutionView } from '@/components/dashboard/dispute-resolution-view';
import { EscrowAuditView } from '@/components/dashboard/escrow-audit-view';
import { SystemLogsView } from '@/components/dashboard/system-logs-view';
import { AppProvider, useApp, type ExtendedLead } from '@/lib/app-context';
import { JobSeekerView } from '@/components/dashboard/job-seeker-view';
import { supabase } from '@/lib/supabase';
import { findRegion, getDefaultRegion } from '@/lib/location-data';
import { useScanProgress } from '@/hooks/use-scan-progress';
import { CheckCircle, Loader2 } from 'lucide-react';

type DashboardProps = {
  scanning: boolean;
  progress: number;
  stepText: string;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onSearch?: (query: string) => void;
};

function Dashboard({ scanning, progress, stepText, selectedId, setSelectedId, onSearch }: DashboardProps) {
  const { leads, setLeads, searchedLocation, setSearchedLocation, updateLeadStatus } = useApp();
  const [profileLead, setProfileLead] = useState<ExtendedLead | null>(null);
  const [pitchLead, setPitchLead] = useState<ExtendedLead | null>(null);
  const [scanResult, setScanResult] = useState<{ count: number; noWeb: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const prevScanning = useRef(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data } = await supabase
          .from('leads')
          .select('*')
          .order('digital_score', { ascending: false });
        if (!mounted) return;
        if (data && data.length > 0) {
          setLeads(data.map((l) => ({ ...l, outreach_status: 'new' as const })));
          setSearchedLocation('India');
        } else {
          const res = await fetch('/api/places?query=India');
          if (res.ok) {
            const businesses = await res.json();
            if (Array.isArray(businesses)) {
              setLeads(businesses.map((l) => ({ ...l, outreach_status: 'new' as const })));
            }
          }
          setSearchedLocation('India');
        }
      } catch (err) {
        if (!mounted) return;
        const res = await fetch('/api/places?query=India').catch(() => null);
        if (res && res.ok) {
          const businesses = await res.json();
          if (Array.isArray(businesses)) {
            setLeads(businesses.map((l) => ({ ...l, outreach_status: 'new' as const })));
          }
        }
        setSearchedLocation('India');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevScanning.current && !scanning && leads.length > 0) {
      setScanResult({
        count: leads.length,
        noWeb: leads.filter((l) => !l.website).length,
      });
    }
    prevScanning.current = scanning;
  }, [scanning, leads]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50/10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex-1 overflow-hidden p-4 md:p-6 h-full bg-slate-50/30">
      <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="min-h-0">
          <MapSimulation
            leads={leads}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            searchedLocation={searchedLocation}
            scanning={scanning}
            scanProgress={progress}
            scanStepText={stepText}
          />
        </div>
        <div className="min-h-0">
          <BusinessList
            leads={leads}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            onViewProfile={(lead) => setProfileLead(lead)}
            onGeneratePitch={(lead) => setPitchLead(lead)}
            scanning={scanning}
            scanStepText={stepText}
            scanProgress={progress}
            onSearch={onSearch}
          />
        </div>
      </div>



      <ProfileDialog
        lead={profileLead}
        onClose={() => setProfileLead(null)}
        onAddToPipeline={(lead) => {
          updateLeadStatus(lead.id, 'saved');
          setProfileLead(null);
        }}
      />
      <PitchGeneratorModal lead={pitchLead} onClose={() => setPitchLead(null)} />
    </main>
  );
}

function AppContent() {
  const { currentView, setCurrentView, user, role, postJob, leads, setLeads, searchedLocation, setSearchedLocation } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { scanning, progress, stepText, startScan } = useScanProgress();

  const handleSearch = useCallback(
    (query: string) => {
      if (scanning) return;

      const q = query.trim().toLowerCase();
      if (!q) return;

      const categoryKeywords = {
        'restaurant': 'Restaurant',
        'restaurants': 'Restaurant',
        'food': 'Restaurant',
        'dine': 'Restaurant',
        'biryani': 'Restaurant',
        'clinic': 'Healthcare',
        'clinics': 'Healthcare',
        'doctor': 'Healthcare',
        'doctors': 'Healthcare',
        'health': 'Healthcare',
        'healthcare': 'Healthcare',
        'dentist': 'Healthcare',
        'dentists': 'Healthcare',
        'salon': 'Salon',
        'salons': 'Salon',
        'spa': 'Salon',
        'hair': 'Salon',
        'looks': 'Salon',
        'beauty': 'Salon',
        'cafe': 'Cafe',
        'cafes': 'Cafe',
        'coffee': 'Cafe',
        'tea': 'Cafe',
        'gym': 'Gym',
        'gyms': 'Gym',
        'fitness': 'Gym',
        'workout': 'Gym',
        'boutique': 'Boutique',
        'boutiques': 'Boutique',
        'shop': 'Boutique',
        'shops': 'Boutique',
        'clothing': 'Boutique',
        'silks': 'Boutique',
      };

      let searchLocation = '';
      let searchCategory = '';

      const inMatch = q.match(/(.*?)\s+(?:in|at)\s+(.*)/);
      if (inMatch) {
        searchCategory = inMatch[1].trim();
        searchLocation = inMatch[2].trim();
      } else {
        const region = findRegion(q);
        if (region) {
          searchLocation = q;
        } else {
          searchCategory = q;
        }
      }

      const matchedCategoryKey = Object.keys(categoryKeywords).find(
        (key) => searchCategory.includes(key) || key.includes(searchCategory)
      );
      const targetCategory = matchedCategoryKey ? categoryKeywords[matchedCategoryKey as keyof typeof categoryKeywords] : '';

      const finalLocation = searchLocation || searchedLocation || 'India';
      setSearchedLocation(finalLocation);

      // Construct dynamic Google Places search query
      let apiQuery = '';
      if (searchCategory && searchLocation) {
        apiQuery = `${searchCategory} in ${searchLocation}`;
      } else if (searchCategory) {
        apiQuery = `${searchCategory} in ${finalLocation}`;
      } else {
        apiQuery = `local businesses in ${finalLocation}`;
      }

      // Run fetch and scan progress concurrently for smooth UX flow
      const fetchPromise = fetch(`/api/places?query=${encodeURIComponent(apiQuery)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Search failed');
          return res.json();
        })
        .catch((err) => {
          console.error('[search error]', err);
          return [];
        });

      startScan(async () => {
        const data = await fetchPromise;
        if (Array.isArray(data) && data.length > 0) {
          if (role === 'job_seeker') {
            data.forEach((biz) => {
              const jobTitle = biz.category === 'Restaurant' ? 'Restaurant Helper' : 
                               biz.category === 'Salon' ? 'Salon Stylist' : 
                               biz.category === 'Gym' ? 'Gym Trainer' : 
                               biz.category === 'Healthcare' ? 'Clinic Support Staff' : 'Shop Assistant';

              postJob({
                title: jobTitle,
                salary: biz.salary || `₹${Math.floor(Math.random() * 10 + 15)},000/mo`,
                shiftTiming: ['Morning Shift', 'Evening Shift', 'Night Shift'][Math.floor(Math.random() * 3)] as any,
                description: `Excellent helper vacancy at ${biz.name}. Take charge of operations support, customer welcome, and daily routines.`,
                skillsRequired: biz.category === 'Restaurant' ? ['Food Safety', 'Prep Work'] : ['Customer Care', 'Active Listening'],
                jobType: ['Full Time', 'Part Time', 'Internship'][Math.floor(Math.random() * 3)] as any,
                vacancies: Math.floor(Math.random() * 3) + 1,
                businessName: biz.name,
                location: biz.address || biz.city || 'India',
                latitude: biz.latitude,
                longitude: biz.longitude,
                businessRating: biz.rating || 4.2,
                distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`
              });
            });
            setCurrentView('job-search');
          } else {
            setLeads(data.map((l) => ({ ...l, outreach_status: 'new' as const })));
          }
        } else {
          if (role !== 'job_seeker') setLeads([]);
        }
        setSelectedId(null);
      });
    },
    [scanning, startScan, setLeads, setSearchedLocation, searchedLocation, role, postJob, setCurrentView]
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            scanning={scanning}
            progress={progress}
            stepText={stepText}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onSearch={handleSearch}
          />
        );
      case 'map':
        return <MapExplorerView />;
      case 'leads':
        return <LeadsCRMView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'support':
        return <SupportView />;
      case 'proposal-generator':
        return <ProposalGeneratorView />;
      case 'portfolio-builder':
        return <PortfolioBuilderView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'business-dashboard':
        return <BusinessDashboardView />;
      case 'claim-verification':
        return <ClaimVerificationView />;
      case 'freelancer-marketplace':
        return <FreelancerMarketplaceView />;
      case 'ai-audit':
        return <AIAuditView />;
      case 'escrow-payments':
        return <EscrowPaymentsView />;
      case 'in-app-chat':
        return <InAppChatView />;
      case 'global-analytics':
        return <GlobalAnalyticsView />;
      case 'verification-requests':
        return <VerificationRequestsView />;
      case 'dispute-resolution':
        return <DisputeResolutionView />;
      case 'escrow-audit':
        return <EscrowAuditView />;
      case 'system-logs':
        return <SystemLogsView />;
      case 'job-seeker-dashboard':
      case 'job-search':
      case 'job-details':
      case 'my-applications':
      case 'job-seeker-profile':
      case 'job-seeker-chat':
        return <JobSeekerView view={currentView} />;
      default:
        return (
          <Dashboard
            scanning={scanning}
            progress={progress}
            stepText={stepText}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onSearch={handleSearch}
          />
        );
    }
  };

  // Enforce startup auth page
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white text-slate-900">
      <TopNavbar onSearch={handleSearch} scanning={scanning} scanStepText={stepText} />
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
