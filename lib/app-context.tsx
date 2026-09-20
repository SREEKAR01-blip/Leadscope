'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase, syncUserProfileToSupabase, fetchUserProfileFromSupabase, type Lead } from './supabase';
import {
  SEED_FREELANCERS,
  SEED_PROJECTS,
  SEED_BIDS,
  SEED_PROPOSALS,
  SEED_ESCROW,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
  SEED_VERIFICATIONS,
  SEED_DISPUTES,
  SEED_LOGS,
  SEED_REELS,
  SEED_PACKAGES,
  type FreelancerProfile,
  type Project,
  type Bid,
  type Proposal,
  type EscrowContract,
  type Message,
  type Notification,
  type VerificationRequest,
  type Dispute,
  type SystemLog,
  type ReelItem,
  type ServicePackage,
} from './marketplace-data';

export type Role = 'freelancer' | 'business_owner' | 'admin' | 'job_seeker';

export type ViewType =
  | 'dashboard'
  | 'map'
  | 'leads'
  | 'analytics'
  | 'settings'
  | 'support'
  // Freelancer views
  | 'proposal-generator'
  | 'portfolio-builder'
  | 'marketplace'
  // Business owner views
  | 'business-dashboard'
  | 'claim-verification'
  | 'freelancer-marketplace'
  | 'ai-audit'
  | 'escrow-payments'
  | 'in-app-chat'
  // Admin views
  | 'global-analytics'
  | 'verification-requests'
  | 'dispute-resolution'
  | 'escrow-audit'
  | 'system-logs'
  // Job Seeker views
  | 'job-seeker-dashboard'
  | 'job-search'
  | 'job-details'
  | 'my-applications'
  | 'job-seeker-profile'
  | 'job-seeker-chat';

export type OutreachStatus = 'new' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'saved';

export type ExtendedLead = Lead & {
  outreach_status: OutreachStatus;
  notes?: string;
};

export type Settings = {
  api_key: string;
  user_name: string;
  user_email: string;
  dark_mode: boolean;
};

export type User = {
  email: string;
  name: string;
  role: Role;
};

export interface Job {
  id: string;
  title: string;
  businessName: string;
  businessRating: number;
  distance: string;
  salary: string;
  jobType: 'Part Time' | 'Full Time' | 'Internship';
  shiftTiming: 'Morning Shift' | 'Evening Shift' | 'Night Shift';
  location: string;
  description: string;
  skillsRequired: string[];
  vacancies: number;
  postedDate: string;
  contactDetails: {
    phone: string;
    email: string;
  };
  experienceNeeded?: string;
  matchPercentage?: number;
  matchReason?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  businessName: string;
  appliedDate: string;
  status: 'Pending' | 'Viewed' | 'Shortlisted' | 'Interview' | 'Accepted' | 'Rejected';
  resumeName: string;
  introduction: string;
  expectedSalary: string;
  availability: string;
  preferredShift: string;
}

export interface SeekerProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  photoUrl: string | null;
  aboutMe: string;
  skills: string[];
  education: { school: string; degree: string; year: string }[];
  experience: { company: string; role: string; duration: string }[];
  languages: string[];
  resumeName: string | null;
  resumeText: string | null;
  preferredCategories: string[];
  preferredShift: string;
  preferredSalary: string;
}

export interface SeekerNotification {
  id: string;
  type: 'job' | 'view' | 'interview' | 'status';
  title: string;
  body: string;
  created_at: string;
  read: boolean;
}

export interface SeekerMessage {
  id: string;
  jobId: string;
  businessName: string;
  sender: 'seeker' | 'business';
  text: string;
  fileUrl?: string;
  fileName?: string;
  voiceNoteUrl?: string;
  sentAt: string;
}

type AppContextType = {
  // View routing
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Role
  role: Role;
  setRole: (role: Role) => void;
  // Auth State
  user: User | null;
  login: (email: string, name: string, role: Role) => void;
  signup: (email: string, name: string, role: Role, phone?: string, city?: string) => void;
  logout: () => void;  // Global data — Leads
  leads: ExtendedLead[];
  setLeads: (leads: ExtendedLead[]) => void;
  updateLeadStatus: (id: string, status: OutreachStatus) => void;
  updateLeadNotes: (id: string, notes: string) => void;

  // Global data — Marketplace
  freelancers: FreelancerProfile[];
  updateFreelancerProfile: (id: string, updated: Partial<FreelancerProfile>) => void;
  projects: Project[];
  bids: Bid[];
  proposals: Proposal[];
  escrowContracts: EscrowContract[];
  messages: Message[];
  notifications: Notification[];
  verifications: VerificationRequest[];
  disputes: Dispute[];
  systemLogs: SystemLog[];
  reels: ReelItem[];
  addReel: (reel: ReelItem) => void;
  deleteReel: (id: string) => void;
  packages: ServicePackage[];

  // Business Owner Actions
  claimBusiness: (leadId: string | null, businessDetails: { name: string; gstNumber?: string; domain?: string; phone?: string; email?: string; address?: string; city?: string }) => void;
  hireFreelancer: (freelancerName: string, projectTitle: string, amount: number, milestones?: number) => void;
  acceptProposal: (proposalId: string) => void;
  rejectProposal: (proposalId: string) => void;
  releaseEscrowMilestone: (contractId: string) => void;
  updateJobApplicationStatus: (applicationId: string, status: 'Pending' | 'Viewed' | 'Shortlisted' | 'Interview' | 'Accepted' | 'Rejected') => void;
  sendDirectMessage: (recipientName: string, text: string, channel?: 'direct' | 'project' | 'support') => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // Analytics
  totalScanned: number;
  successRatio: number;
  missingWebsites: number;

  // Search state
  searchedLocation: string | null;
  setSearchedLocation: (location: string | null) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;

  // Job Seeker State & Actions
  jobs: Job[];
  applications: JobApplication[];
  savedJobIds: string[];
  seekerProfile: SeekerProfile;
  seekerNotifications: SeekerNotification[];
  seekerMessages: SeekerMessage[];
  postJob: (job: { 
    title: string; 
    salary: string; 
    shiftTiming: 'Morning Shift' | 'Evening Shift' | 'Night Shift'; 
    description: string; 
    skillsRequired: string[]; 
    jobType: 'Part Time' | 'Full Time' | 'Internship'; 
    vacancies: number;
    businessName?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    businessRating?: number;
    distance?: string;
  }) => void;
  applyToJob: (jobId: string, introduction: string, expectedSalary: string, availability: string, preferredShift: string, resumeName: string) => void;
  withdrawApplication: (applicationId: string) => void;
  toggleSaveJob: (jobId: string) => void;
  updateSeekerProfile: (updates: Partial<SeekerProfile>) => void;
  sendSeekerMessage: (jobId: string, text: string, options?: { fileUrl?: string; fileName?: string; voiceNoteUrl?: string }) => void;
  triggerSeekerNotification: (notif: { type: 'job' | 'view' | 'interview' | 'status'; title: string; body: string }) => void;
};

export const SEED_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Restaurant Helper',
    businessName: 'Spice Route Kitchen',
    businessRating: 4.5,
    distance: '1.2 km',
    salary: '₹18,000/mo',
    jobType: 'Part Time',
    shiftTiming: 'Morning Shift',
    location: 'Jubilee Hills, Hyderabad',
    description: 'Assist kitchen staff with food prep, washing dishes, and cleaning dining areas. Previous experience preferred but not required.',
    skillsRequired: ['Food Safety', 'Quick Learner', 'Active Listening'],
    vacancies: 3,
    postedDate: '2026-07-10',
    contactDetails: { phone: '+91 98765 43210', email: 'careers@spiceroute.com' },
    experienceNeeded: '0-1 years',
    matchPercentage: 92,
    matchReason: 'Matches your location and preferred working hours.'
  },
  {
    id: 'job-2',
    title: 'Delivery Partner',
    businessName: 'Zomato Logistics',
    businessRating: 4.2,
    distance: '2.5 km',
    salary: '₹22,000/mo',
    jobType: 'Full Time',
    shiftTiming: 'Evening Shift',
    location: 'Bandra West, Mumbai',
    description: 'Deliver food packages safely to customers. Must own a smartphone and a valid two-wheeler driving license.',
    skillsRequired: ['Driving', 'Time Management', 'Navigation'],
    vacancies: 15,
    postedDate: '2026-07-11',
    contactDetails: { phone: '+91 99988 87776', email: 'delivery@zomato.com' },
    experienceNeeded: 'No experience required',
    matchPercentage: 88,
    matchReason: 'High demand in your city with premium evening rates.'
  },
  {
    id: 'job-3',
    title: 'Office Assistant',
    businessName: 'TechPark Solutions',
    businessRating: 4.0,
    distance: '3.1 km',
    salary: '₹25,000/mo',
    jobType: 'Full Time',
    shiftTiming: 'Morning Shift',
    location: 'Outer Ring Road, Bangalore',
    description: 'Manage front desk files, courier entry, answering calls, and assisting in basic computer entries.',
    skillsRequired: ['MS Office', 'Data Entry', 'Communication'],
    vacancies: 2,
    postedDate: '2026-07-09',
    contactDetails: { phone: '+91 91234 56789', email: 'hr@techpark.in' },
    experienceNeeded: '1-2 years',
    matchPercentage: 85,
    matchReason: 'Matches your office/computer skills preferences.'
  },
  {
    id: 'job-4',
    title: 'Retail Sales Associate',
    businessName: 'FabIndia Retail',
    businessRating: 4.6,
    distance: '0.8 km',
    salary: '₹20,000/mo',
    jobType: 'Part Time',
    shiftTiming: 'Morning Shift',
    location: 'Connaught Place, New Delhi',
    description: 'Greet customers, help them select clothing/handicrafts, handle billing counters, and organize shelf inventory.',
    skillsRequired: ['Sales', 'Customer Service', 'Active Listening'],
    vacancies: 5,
    postedDate: '2026-07-12',
    contactDetails: { phone: '+91 95432 10987', email: 'jobs@fabindia.com' },
    experienceNeeded: '0-2 years',
    matchPercentage: 90,
    matchReason: 'Very close to your location and matches customer service preferences.'
  },
  {
    id: 'job-5',
    title: 'Graphic Design Intern',
    businessName: 'PixelCraft Studio',
    businessRating: 4.7,
    distance: '1.5 km',
    salary: '₹12,000/mo',
    jobType: 'Internship',
    shiftTiming: 'Morning Shift',
    location: 'Koregaon Park, Pune',
    description: 'Collaborate on creating social media posters, UI assets, and banner ads. Experience with Figma, Photoshop or Canva is a must.',
    skillsRequired: ['Figma', 'Photoshop', 'Canva', 'Creativity'],
    vacancies: 1,
    postedDate: '2026-07-08',
    contactDetails: { phone: '+91 88877 66655', email: 'design@pixelcraft.co' },
    experienceNeeded: 'Student / Portfolio required',
    matchPercentage: 80,
    matchReason: 'Matches your creative skills listed in your profile.'
  }
];

export const DEFAULT_SEEKER_PROFILE: SeekerProfile = {
  name: 'Jordan Davis',
  email: 'jordan@company.com',
  phone: '+91 99887 76655',
  city: 'Hyderabad',
  photoUrl: null,
  aboutMe: 'Enthusiastic and hardworking job seeker looking for opportunities in customer service, sales, and administration. Eager to learn and contribute to growing local businesses.',
  skills: ['Communication', 'Customer Service', 'MS Office', 'Data Entry'],
  education: [
    { school: 'Govt Boys High School', degree: 'HSC (12th)', year: '2024' }
  ],
  experience: [
    { company: 'Local Supermarket', role: 'Billing Helper', duration: '6 months' }
  ],
  languages: ['English', 'Hindi', 'Telugu'],
  resumeName: null,
  resumeText: null,
  preferredCategories: ['Restaurant', 'Boutique', 'Healthcare'],
  preferredShift: 'Morning Shift',
  preferredSalary: '₹15,000 - ₹25,000/mo'
};

const defaultSettings: Settings = {
  api_key: '',
  user_name: 'Jordan Davis',
  user_email: 'jordan@company.com',
  dark_mode: false,
};

const AppContext = createContext<AppContextType | null>(null);

const USER_STORAGE_KEY = 'leadscope_user';
const ROLE_STORAGE_KEY = 'leadscope_role';
const LEADS_STORAGE_KEY = 'leadforge_leads';
const SETTINGS_STORAGE_KEY = 'leadforge_settings';
const JOBS_STORAGE_KEY = 'leadscope_jobs';
const APPLICATIONS_STORAGE_KEY = 'leadscope_applications';
const SAVED_JOBS_STORAGE_KEY = 'leadscope_saved_jobs';
const PROFILE_STORAGE_KEY = 'leadscope_seeker_profile';
const SEEKER_NOTIFICATIONS_STORAGE_KEY = 'leadscope_seeker_notifications';
const SEEKER_MESSAGES_STORAGE_KEY = 'leadscope_seeker_messages';
const FREELANCERS_STORAGE_KEY = 'leadscope_freelancers';

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [role, setRoleState] = useState<Role>('freelancer');
  const [user, setUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<ExtendedLead[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [searchedLocation, setSearchedLocation] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>(() => {
    return SEED_FREELANCERS.map((f, idx) =>
      idx === 0 ? { ...f, name: defaultSettings.user_name } : f
    );
  });

  const updateFreelancerProfile = useCallback((id: string, updated: Partial<FreelancerProfile>) => {
    setFreelancers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updated } : f))
    );
    if (updated.name) {
      setSettings((s) => ({ ...s, user_name: updated.name! }));
    }
  }, []);
  const [projects] = useState<Project[]>(SEED_PROJECTS);
  const [bids] = useState<Bid[]>(SEED_BIDS);
  const [proposals, setProposals] = useState<Proposal[]>(SEED_PROPOSALS);
  const [escrowContracts, setEscrowContracts] = useState<EscrowContract[]>(SEED_ESCROW);
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [notifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [verifications, setVerifications] = useState<VerificationRequest[]>(SEED_VERIFICATIONS);
  const [disputes] = useState<Dispute[]>(SEED_DISPUTES);
  const [systemLogs] = useState<SystemLog[]>(SEED_LOGS);
  const [reels, setReels] = useState<ReelItem[]>(SEED_REELS);
  const [packages] = useState<ServicePackage[]>(SEED_PACKAGES);

  const addReel = useCallback((reel: ReelItem) => {
    setReels((prev) => [reel, ...prev]);
  }, []);

  const deleteReel = useCallback((id: string) => {
    setReels((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Job Seeker State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [seekerProfile, setSeekerProfile] = useState<SeekerProfile>(DEFAULT_SEEKER_PROFILE);
  const [seekerNotifications, setSeekerNotifications] = useState<SeekerNotification[]>([]);
  const [seekerMessages, setSeekerMessages] = useState<SeekerMessage[]>([]);

  // Load persisted state on mount
  useEffect(() => {
    // Check initial Supabase Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const userRole = (meta.role as Role) || 'freelancer';
        const userName = meta.full_name || session.user.email?.split('@')[0] || 'User';
        const newUser: User = {
          email: session.user.email || '',
          name: userName,
          role: userRole,
        };
        setUser(newUser);
        setRoleState(userRole);
      }
    }).catch(() => {});

    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const userRole = (meta.role as Role) || 'freelancer';
        const userName = meta.full_name || session.user.email?.split('@')[0] || 'User';
        const newUser: User = {
          email: session.user.email || '',
          name: userName,
          role: userRole,
        };
        setUser(newUser);
        setRoleState(userRole);
      }
    });

    // Load User
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        if (parsed && parsed.email && parsed.role) {
          setUser(parsed);
          setRoleState(parsed.role);
          
          // Route to proper start view based on role
          if (parsed.role === 'business_owner') {
            setCurrentView('business-dashboard');
          } else if (parsed.role === 'admin') {
            setCurrentView('global-analytics');
          } else if (parsed.role === 'job_seeker') {
            setCurrentView('job-seeker-dashboard');
          } else {
            setCurrentView('dashboard');
          }
        }
      } catch {
        // Fall back to default
      }
    } else {
      // If no user is logged in, default role is freelancer, but user will be null
      const storedRole = localStorage.getItem(ROLE_STORAGE_KEY);
      if (storedRole === 'freelancer' || storedRole === 'business_owner' || storedRole === 'admin' || storedRole === 'job_seeker') {
        setRoleState(storedRole as Role);
      }
    }

    // Leads
    const storedLeads = localStorage.getItem(LEADS_STORAGE_KEY);
    if (storedLeads) {
      try {
        const parsed = JSON.parse(storedLeads);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
        }
      } catch {
        // fall through
      }
    }

    // Load Seeker Data
    const storedJobs = localStorage.getItem(JOBS_STORAGE_KEY);
    if (storedJobs) {
      try { setJobs(JSON.parse(storedJobs)); } catch {}
    } else {
      setJobs(SEED_JOBS);
    }

    const storedApps = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    if (storedApps) {
      try { setApplications(JSON.parse(storedApps)); } catch {}
    }

    const storedSaved = localStorage.getItem(SAVED_JOBS_STORAGE_KEY);
    if (storedSaved) {
      try { setSavedJobIds(JSON.parse(storedSaved)); } catch {}
    }

    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (storedProfile) {
      try { setSeekerProfile(JSON.parse(storedProfile)); } catch {}
    }

    const storedNotifs = localStorage.getItem(SEEKER_NOTIFICATIONS_STORAGE_KEY);
    if (storedNotifs) {
      try { setSeekerNotifications(JSON.parse(storedNotifs)); } catch {}
    } else {
      setSeekerNotifications([
        {
          id: 'notif-1',
          type: 'job',
          title: 'Welcome to LeadScope Jobs!',
          body: 'Explore nearby opportunities, optimize your resume with AI, and connect directly with local businesses.',
          created_at: new Date().toISOString(),
          read: false
        }
      ]);
    }

    const storedMsgs = localStorage.getItem(SEEKER_MESSAGES_STORAGE_KEY);
    if (storedMsgs) {
      try { setSeekerMessages(JSON.parse(storedMsgs)); } catch {}
    }

    const storedFreelancers = localStorage.getItem(FREELANCERS_STORAGE_KEY);
    if (storedFreelancers) {
      try {
        const parsed = JSON.parse(storedFreelancers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFreelancers(parsed);
        }
      } catch {}
    }

    setSearchedLocation(null);
  }, []);

  // Persist freelancers
  useEffect(() => {
    if (freelancers.length > 0) {
      localStorage.setItem(FREELANCERS_STORAGE_KEY, JSON.stringify(freelancers));
    }
  }, [freelancers]);

  // Persist leads
  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads]);

  // Load settings
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        // use defaults
      }
    }
  }, []);

  // Sync dark mode class on html element
  useEffect(() => {
    if (settings.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.dark_mode]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Seeker Persistors
  useEffect(() => {
    if (jobs.length > 0) localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(seekerProfile));
  }, [seekerProfile]);

  useEffect(() => {
    localStorage.setItem(SEEKER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(seekerNotifications));
  }, [seekerNotifications]);

  useEffect(() => {
    localStorage.setItem(SEEKER_MESSAGES_STORAGE_KEY, JSON.stringify(seekerMessages));
  }, [seekerMessages]);

  const login = useCallback((email: string, name: string, role: Role) => {
    const newUser = { email, name, role };
    setUser(newUser);
    setRoleState(role);
    setSettings((prev) => ({
      ...prev,
      user_name: name,
      user_email: email,
    }));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    
    // Sync profile with Supabase DB
    syncUserProfileToSupabase({ email, name, role });

    if (role === 'job_seeker') {
      setSeekerProfile((prev) => ({
        ...prev,
        name: prev.name === DEFAULT_SEEKER_PROFILE.name ? name : prev.name,
        email: prev.email === DEFAULT_SEEKER_PROFILE.email ? email : prev.email
      }));
    }
    
    if (role === 'business_owner') {
      setCurrentView('business-dashboard');
    } else if (role === 'admin') {
      setCurrentView('global-analytics');
    } else if (role === 'job_seeker') {
      setCurrentView('job-seeker-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  }, []);

  const signup = useCallback((email: string, name: string, role: Role, phone?: string, city?: string) => {
    const newUser = { email, name, role };
    setUser(newUser);
    setRoleState(role);
    setSettings((prev) => ({
      ...prev,
      user_name: name,
      user_email: email,
    }));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    
    // Sync profile with Supabase DB
    syncUserProfileToSupabase({ email, name, role });

    if (role === 'job_seeker') {
      setSeekerProfile((prev) => ({
        ...prev,
        name,
        email,
        phone: phone || prev.phone,
        city: city || prev.city
      }));
    }
    
    if (role === 'business_owner') {
      setCurrentView('business-dashboard');
    } else if (role === 'admin') {
      setCurrentView('global-analytics');
    } else if (role === 'job_seeker') {
      setCurrentView('job-seeker-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    setCurrentView('dashboard');
  }, []);

  const setRole = useCallback((newRole: Role) => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      console.warn('Cannot change role while logged in. Please sign out first.');
      return;
    }
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  }, []);

  const updateLeadStatus = useCallback((id: string, status: OutreachStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, outreach_status: status } : l))
    );
  }, []);

  const updateLeadNotes = useCallback((id: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notes } : l))
    );
  }, []);

  const claimBusiness = useCallback((leadId: string | null, businessDetails: { name: string; gstNumber?: string; domain?: string; phone?: string; email?: string; address?: string; city?: string }) => {
    setLeads((prev) => {
      const existingIndex = leadId ? prev.findIndex((l) => l.id === leadId) : -1;
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          name: businessDetails.name || updated[existingIndex].name,
          website: businessDetails.domain ? (businessDetails.domain.startsWith('http') ? businessDetails.domain : `https://${businessDetails.domain}`) : updated[existingIndex].website,
          phone: businessDetails.phone || updated[existingIndex].phone,
          email: businessDetails.email || updated[existingIndex].email,
          address: businessDetails.address || updated[existingIndex].address,
          city: businessDetails.city || updated[existingIndex].city,
          digital_score: Math.max(updated[existingIndex].digital_score, 88),
          outreach_status: 'won',
        };
        return updated;
      } else {
        const newLead: ExtendedLead = {
          id: `lead-claimed-${Date.now()}`,
          name: businessDetails.name,
          category: 'Verified Business',
          address: businessDetails.address || 'Business District',
          city: businessDetails.city || 'Hyderabad',
          phone: businessDetails.phone || '+91 99887 76655',
          email: businessDetails.email || user?.email || 'owner@business.com',
          website: businessDetails.domain ? (businessDetails.domain.startsWith('http') ? businessDetails.domain : `https://${businessDetails.domain}`) : 'https://mybusiness.com',
          rating: 4.8,
          review_count: 15,
          digital_score: 92,
          latitude: 17.43,
          longitude: 78.40,
          image_url: null,
          place_id: null,
          created_at: new Date().toISOString(),
          outreach_status: 'won',
        };
        return [newLead, ...prev];
      }
    });

    const newVerif: VerificationRequest = {
      id: `ver-${Date.now()}`,
      business_name: businessDetails.name,
      category: 'Verified Business',
      submitted_at: new Date().toISOString(),
      status: 'approved',
      documents_count: 2,
    };
    setVerifications((prev) => [newVerif, ...prev]);

    if (user?.email) {
      syncUserProfileToSupabase({
        email: user.email,
        name: businessDetails.name || user.name,
        role: 'business_owner',
      });
    }
  }, [user]);

  const hireFreelancer = useCallback((freelancerName: string, projectTitle: string, amount: number, milestones: number = 2) => {
    const newContract: EscrowContract = {
      id: `escrow-${Date.now()}`,
      project_title: projectTitle,
      freelancer_name: freelancerName,
      business_name: user?.name || 'My Business',
      amount,
      status: 'funded',
      funded_at: new Date().toISOString(),
      milestone_current: 0,
      milestone_total: milestones,
    };
    setEscrowContracts((prev) => [newContract, ...prev]);
  }, [user?.name]);

  const acceptProposal = useCallback((proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'accepted' as const } : p))
    );
    const prop = proposals.find((p) => p.id === proposalId);
    if (prop) {
      const newContract: EscrowContract = {
        id: `escrow-prop-${Date.now()}`,
        project_title: prop.scope.slice(0, 40) || 'Project Contract',
        freelancer_name: prop.freelancer_name,
        business_name: prop.business_name || user?.name || 'My Business',
        amount: prop.amount,
        status: 'in_progress',
        funded_at: new Date().toISOString(),
        milestone_current: 1,
        milestone_total: 2,
      };
      setEscrowContracts((prev) => [newContract, ...prev]);
    }
  }, [proposals, user?.name]);

  const rejectProposal = useCallback((proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'rejected' as const } : p))
    );
  }, []);

  const releaseEscrowMilestone = useCallback((contractId: string) => {
    setEscrowContracts((prev) =>
      prev.map((e) => {
        if (e.id === contractId) {
          const nextMilestone = Math.min(e.milestone_current + 1, e.milestone_total);
          const isFinished = nextMilestone >= e.milestone_total;
          return {
            ...e,
            milestone_current: nextMilestone,
            status: isFinished ? ('released' as const) : ('in_progress' as const),
          };
        }
        return e;
      })
    );
  }, []);

  const updateJobApplicationStatus = useCallback((applicationId: string, status: 'Pending' | 'Viewed' | 'Shortlisted' | 'Interview' | 'Accepted' | 'Rejected') => {
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
    );
  }, []);

  const sendDirectMessage = useCallback((recipientName: string, body: string, channel: 'direct' | 'project' | 'support' = 'direct') => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender_name: user?.name || 'Me',
      sender_role: (role as any) || 'business_owner',
      recipient_name: recipientName,
      preview: body.slice(0, 40),
      body,
      sent_at: new Date().toISOString(),
      read: true,
      channel,
    };
    setMessages((prev) => [newMsg, ...prev]);
  }, [user?.name, role]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const totalScanned = leads.length;
  const missingWebsites = leads.filter((l) => !l.website).length;
  const successRatio = totalScanned > 0 ? Math.round(((totalScanned - missingWebsites) / totalScanned) * 100) : 0;

  // Job Seeker Callbacks
  const triggerSeekerNotification = useCallback((notif: { type: 'job' | 'view' | 'interview' | 'status'; title: string; body: string }) => {
    const newNotif: SeekerNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      created_at: new Date().toISOString(),
      read: false
    };
    setSeekerNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const postJob = useCallback((newJob: { 
    title: string; 
    salary: string; 
    shiftTiming: 'Morning Shift' | 'Evening Shift' | 'Night Shift'; 
    description: string; 
    skillsRequired: string[]; 
    jobType: 'Part Time' | 'Full Time' | 'Internship'; 
    vacancies: number;
    businessName?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    businessRating?: number;
    distance?: string;
  }) => {
    const job: Job = {
      ...newJob,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      businessName: newJob.businessName || user?.name || 'Local Business',
      businessRating: newJob.businessRating || 4.5,
      distance: newJob.distance || '0.5 km',
      location: newJob.location || seekerProfile.city || 'Hyderabad',
      latitude: newJob.latitude ?? null,
      longitude: newJob.longitude ?? null,
      postedDate: new Date().toISOString().split('T')[0],
      contactDetails: {
        phone: '+91 99887 76655',
        email: user?.email || 'hr@business.com'
      },
      experienceNeeded: '0-2 years',
      matchPercentage: 85,
      matchReason: 'Posted by local business'
    };
    setJobs((prev) => [job, ...prev]);

    triggerSeekerNotification({
      type: 'job',
      title: 'New Nearby Job Posted',
      body: `${job.businessName} just posted a new job: ${job.title}. Check it out!`
    });
  }, [user, seekerProfile.city, triggerSeekerNotification]);

  const applyToJob = useCallback((jobId: string, introduction: string, expectedSalary: string, availability: string, preferredShift: string, resumeName: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      jobId,
      jobTitle: job.title,
      businessName: job.businessName,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      resumeName: resumeName || 'Resume.pdf',
      introduction,
      expectedSalary,
      availability,
      preferredShift
    };

    setApplications((prev) => [newApp, ...prev]);

    // Simulate business viewing the profile after 8 seconds
    setTimeout(() => {
      setApplications((prev) =>
        prev.map((app) => (app.id === newApp.id ? { ...app, status: 'Viewed' } : app))
      );
      triggerSeekerNotification({
        type: 'view',
        title: 'Profile Viewed',
        body: `${job.businessName} viewed your profile for the ${job.title} vacancy.`
      });
    }, 8000);

    // Simulate interview request after 20 seconds
    setTimeout(() => {
      setApplications((prev) =>
        prev.map((app) => (app.id === newApp.id ? { ...app, status: 'Interview' } : app))
      );
      triggerSeekerNotification({
        type: 'interview',
        title: 'Interview Invitation',
        body: `${job.businessName} invited you for an interview for ${job.title}.`
      });

      // Send a chat message from business
      const mockBusinessMessage: SeekerMessage = {
        id: `msg-${Date.now()}-mock`,
        jobId,
        businessName: job.businessName,
        sender: 'business',
        text: `Hi, thank you for applying to the ${job.title} position. We reviewed your profile and would love to schedule a brief chat. Are you available tomorrow morning?`,
        sentAt: new Date().toISOString()
      };
      setSeekerMessages((prev) => [...prev, mockBusinessMessage]);
    }, 20000);
  }, [jobs, triggerSeekerNotification]);

  const withdrawApplication = useCallback((applicationId: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== applicationId));
  }, []);

  const toggleSaveJob = useCallback((jobId: string) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  }, []);

  const updateSeekerProfile = useCallback((updates: Partial<SeekerProfile>) => {
    setSeekerProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const sendSeekerMessage = useCallback((jobId: string, text: string, options?: { fileUrl?: string; fileName?: string; voiceNoteUrl?: string }) => {
    const job = jobs.find((j) => j.id === jobId);
    const bName = job?.businessName || 'Business';
    const newMsg: SeekerMessage = {
      id: `msg-${Date.now()}`,
      jobId,
      businessName: bName,
      sender: 'seeker',
      text,
      fileUrl: options?.fileUrl,
      fileName: options?.fileName,
      voiceNoteUrl: options?.voiceNoteUrl,
      sentAt: new Date().toISOString()
    };
    setSeekerMessages((prev) => [...prev, newMsg]);

    // Mock quick business reply
    setTimeout(() => {
      const replyMsg: SeekerMessage = {
        id: `msg-${Date.now() + 1}`,
        jobId,
        businessName: bName,
        sender: 'business',
        text: `Thanks for the details! We are reviewing it and will get back to you shortly.`,
        sentAt: new Date().toISOString()
      };
      setSeekerMessages((prev) => [...prev, replyMsg]);
    }, 3000);
  }, [jobs]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        role,
        setRole,
        user,
        login,
        signup,
        logout,
        leads,
        setLeads,
        updateLeadStatus,
        updateLeadNotes,
        freelancers,
        updateFreelancerProfile,
        projects,
        bids,
        proposals,
        escrowContracts,
        messages,
        notifications,
        verifications,
        disputes,
        systemLogs,
        reels,
        addReel,
        deleteReel,
        packages,
        settings,
        updateSettings,
        totalScanned,
        successRatio,
        missingWebsites,
        searchedLocation,
        setSearchedLocation,
        isScanning,
        setIsScanning,
        // Job Seeker values
        jobs,
        applications,
        savedJobIds,
        seekerProfile,
        seekerNotifications,
        seekerMessages,
        claimBusiness,
        hireFreelancer,
        acceptProposal,
        rejectProposal,
        releaseEscrowMilestone,
        updateJobApplicationStatus,
        sendDirectMessage,
        postJob,
        applyToJob,
        withdrawApplication,
        toggleSaveJob,
        updateSeekerProfile,
        sendSeekerMessage,
        triggerSeekerNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
