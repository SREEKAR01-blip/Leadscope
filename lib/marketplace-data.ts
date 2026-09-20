import type { ExtendedLead } from './app-context';

export type FreelancerProfile = {
  id: string;
  name: string;
  title: string;
  skills: string[];
  hourly_rate: number;
  rating: number;
  review_count: number;
  projects_completed: number;
  avatar_url: string | null;
  bio: string;
  location: string;
  verified: boolean;
  online: boolean;
};

export type Project = {
  id: string;
  title: string;
  business_name: string;
  category: string;
  budget_min: number;
  budget_max: number;
  description: string;
  bids_count: number;
  posted_at: string;
  status: 'open' | 'awarded' | 'completed';
  location: string;
};

export type Bid = {
  id: string;
  project_id: string;
  freelancer_name: string;
  amount: number;
  delivery_days: number;
  message: string;
  placed_at: string;
  status: 'pending' | 'accepted' | 'declined';
};

export type Proposal = {
  id: string;
  project_id: string;
  freelancer_name: string;
  business_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  created_at: string;
  scope: string;
  timeline: string;
};

export type EscrowContract = {
  id: string;
  project_title: string;
  freelancer_name: string;
  business_name: string;
  amount: number;
  status: 'funded' | 'in_progress' | 'released' | 'disputed';
  funded_at: string;
  milestone_current: number;
  milestone_total: number;
};

export type Message = {
  id: string;
  sender_name: string;
  sender_role: 'freelancer' | 'business_owner' | 'admin';
  recipient_name: string;
  preview: string;
  body: string;
  sent_at: string;
  read: boolean;
  channel: 'direct' | 'project' | 'support';
};

export type Notification = {
  id: string;
  type: 'bid' | 'message' | 'proposal' | 'escrow' | 'verification' | 'dispute' | 'system';
  title: string;
  body: string;
  created_at: string;
  read: boolean;
};

export type VerificationRequest = {
  id: string;
  business_name: string;
  category: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  documents_count: number;
};

export type Dispute = {
  id: string;
  contract_id: string;
  project_title: string;
  freelancer_name: string;
  business_name: string;
  reason: string;
  amount: number;
  status: 'open' | 'investigating' | 'resolved';
  opened_at: string;
};

export type SystemLog = {
  id: string;
  level: 'info' | 'warning' | 'error';
  module: string;
  message: string;
  timestamp: string;
};

// ─── Seed data ─────────────────────────────────────────────────────────────

export const SEED_FREELANCERS: FreelancerProfile[] = [
  {
    id: 'fl-001',
    name: 'Aarav Sharma',
    title: 'Full-Stack Web Developer',
    skills: ['React', 'Next.js', 'Node.js', 'Supabase'],
    hourly_rate: 65,
    rating: 4.9,
    review_count: 127,
    projects_completed: 84,
    avatar_url: null,
    bio: 'Building modern web apps for local businesses — booking systems, dashboards, and storefronts.',
    location: 'Hyderabad, IN',
    verified: true,
    online: true,
  },
  {
    id: 'fl-002',
    name: 'Priya Nair',
    title: 'Brand & UI Designer',
    skills: ['Figma', 'Branding', 'Webflow', 'Illustration'],
    hourly_rate: 55,
    rating: 4.8,
    review_count: 93,
    projects_completed: 61,
    avatar_url: null,
    bio: 'Identity systems and conversion-focused landing pages for restaurants, clinics, and retail.',
    location: 'Bengaluru, IN',
    verified: true,
    online: false,
  },
  {
    id: 'fl-003',
    name: 'Marcus Chen',
    title: 'SEO & Local Marketing Specialist',
    skills: ['SEO', 'Google Ads', 'GMB', 'Content'],
    hourly_rate: 70,
    rating: 4.7,
    review_count: 156,
    projects_completed: 112,
    avatar_url: null,
    bio: 'Helping local businesses rank higher and convert more with data-driven local SEO.',
    location: 'New York, US',
    verified: true,
    online: true,
  },
  {
    id: 'fl-004',
    name: 'Sofia Reyes',
    title: 'Shopify & E-commerce Developer',
    skills: ['Shopify', 'Liquid', 'Klaviyo', 'CSS'],
    hourly_rate: 60,
    rating: 4.9,
    review_count: 78,
    projects_completed: 52,
    avatar_url: null,
    bio: 'Store builds, migrations, and CRO for DTC and local retail brands.',
    location: 'Austin, US',
    verified: false,
    online: true,
  },
  {
    id: 'fl-005',
    name: 'Karthik Reddy',
    title: 'Mobile App Developer',
    skills: ['React Native', 'Flutter', 'Firebase', 'TypeScript'],
    hourly_rate: 75,
    rating: 4.8,
    review_count: 64,
    projects_completed: 41,
    avatar_url: null,
    bio: 'Cross-platform apps for healthcare, fitness, and food delivery startups.',
    location: 'Hyderabad, IN',
    verified: true,
    online: false,
  },
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'prj-001',
    title: 'Restaurant Website with Online Ordering',
    business_name: "Ohri's Jiva Imperia",
    category: 'Web Development',
    budget_min: 1500,
    budget_max: 3000,
    description: 'Need a modern responsive website with online menu, table booking, and pickup ordering integration.',
    bids_count: 12,
    posted_at: '2026-06-25T10:00:00Z',
    status: 'open',
    location: 'Jubilee Hills, IN',
  },
  {
    id: 'prj-002',
    title: 'Google Business Profile Optimization',
    business_name: 'Prost Brew Pub',
    category: 'Local SEO',
    budget_min: 300,
    budget_max: 800,
    description: 'Optimize GMB listing, add photos, respond to reviews, and improve local search ranking.',
    bids_count: 8,
    posted_at: '2026-06-27T14:30:00Z',
    status: 'open',
    location: 'Jubilee Hills, IN',
  },
  {
    id: 'prj-003',
    title: 'Boutique E-commerce Store Setup',
    business_name: 'Kalaniketan Silks',
    category: 'E-commerce',
    budget_min: 2000,
    budget_max: 5000,
    description: 'Shopify store setup with custom theme, product catalog of 200+ items, and payment gateway.',
    bids_count: 15,
    posted_at: '2026-06-20T09:15:00Z',
    status: 'awarded',
    location: 'Jubilee Hills, IN',
  },
  {
    id: 'prj-004',
    title: 'Dental Clinic Booking App',
    business_name: 'Dr. Reddy Dental Studio',
    category: 'Mobile Development',
    budget_min: 3000,
    budget_max: 7000,
    description: 'Patient booking app with reminders, prescription tracking, and telehealth video calls.',
    bids_count: 6,
    posted_at: '2026-06-28T16:45:00Z',
    status: 'open',
    location: 'Hyderabad, IN',
  },
  {
    id: 'prj-005',
    title: 'Brand Identity & Logo Redesign',
    business_name: 'Minerva Coffee Shop',
    category: 'Branding & Design',
    budget_min: 500,
    budget_max: 1200,
    description: 'Refresh logo, menu design, and social media templates for a heritage cafe.',
    bids_count: 9,
    posted_at: '2026-06-22T11:20:00Z',
    status: 'completed',
    location: 'Hyderabad, IN',
  },
];

export const SEED_BIDS: Bid[] = [
  {
    id: 'bid-001',
    project_id: 'prj-001',
    freelancer_name: 'Aarav Sharma',
    amount: 2200,
    delivery_days: 14,
    message: 'I can build a fast Next.js site with online ordering via Stripe. Similar project delivered last month.',
    placed_at: '2026-06-26T08:00:00Z',
    status: 'pending',
  },
  {
    id: 'bid-002',
    project_id: 'prj-001',
    freelancer_name: 'Sofia Reyes',
    amount: 2800,
    delivery_days: 10,
    message: 'Full restaurant site with Shopify-based ordering system. Includes 3 design revisions.',
    placed_at: '2026-06-26T12:30:00Z',
    status: 'pending',
  },
  {
    id: 'bid-003',
    project_id: 'prj-002',
    freelancer_name: 'Marcus Chen',
    amount: 600,
    delivery_days: 5,
    message: 'GMB optimization with review management strategy. 3-month ranking improvement guarantee.',
    placed_at: '2026-06-28T09:00:00Z',
    status: 'pending',
  },
];

export const SEED_PROPOSALS: Proposal[] = [
  {
    id: 'prop-001',
    project_id: 'prj-003',
    freelancer_name: 'Sofia Reyes',
    business_name: 'Kalaniketan Silks',
    amount: 4200,
    status: 'accepted',
    created_at: '2026-06-24T15:00:00Z',
    scope: 'Shopify store build with custom theme, 200 product uploads, payment gateway, and 30-day support.',
    timeline: '21 days',
  },
  {
    id: 'prop-002',
    project_id: 'prj-001',
    freelancer_name: 'Aarav Sharma',
    business_name: "Ohri's Jiva Imperia",
    amount: 2200,
    status: 'viewed',
    created_at: '2026-06-27T10:00:00Z',
    scope: 'Next.js website with online ordering, table booking, and CMS for menu management.',
    timeline: '14 days',
  },
  {
    id: 'prop-003',
    project_id: 'prj-004',
    freelancer_name: 'Karthik Reddy',
    business_name: 'Dr. Reddy Dental Studio',
    amount: 5500,
    status: 'sent',
    created_at: '2026-06-29T14:00:00Z',
    scope: 'React Native booking app with reminders, prescriptions, and telehealth video integration.',
    timeline: '30 days',
  },
];

export const SEED_ESCROW: EscrowContract[] = [
  {
    id: 'esc-001',
    project_title: 'Boutique E-commerce Store Setup',
    freelancer_name: 'Sofia Reyes',
    business_name: 'Kalaniketan Silks',
    amount: 4200,
    status: 'in_progress',
    funded_at: '2026-06-25T12:00:00Z',
    milestone_current: 2,
    milestone_total: 4,
  },
  {
    id: 'esc-002',
    project_title: 'Brand Identity & Logo Redesign',
    freelancer_name: 'Priya Nair',
    business_name: 'Minerva Coffee Shop',
    amount: 950,
    status: 'released',
    funded_at: '2026-06-23T09:00:00Z',
    milestone_current: 3,
    milestone_total: 3,
  },
  {
    id: 'esc-003',
    project_title: 'GMB Optimization Retainer',
    freelancer_name: 'Marcus Chen',
    business_name: 'Paradise Biryani',
    amount: 1200,
    status: 'funded',
    funded_at: '2026-06-30T11:00:00Z',
    milestone_current: 0,
    milestone_total: 3,
  },
];

export const SEED_MESSAGES: Message[] = [
  {
    id: 'msg-001',
    sender_name: 'Sofia Reyes',
    sender_role: 'freelancer',
    recipient_name: "Ohri's Jiva Imperia",
    preview: 'Hi! I saw your project posting and wanted to share my portfolio...',
    body: 'Hi! I saw your project posting and wanted to share my portfolio. I have built 3 restaurant websites with online ordering in the last year. Would love to discuss your requirements.',
    sent_at: '2026-06-27T11:30:00Z',
    read: false,
    channel: 'project',
  },
  {
    id: 'msg-002',
    sender_name: "Ohri's Jiva Imperia",
    sender_role: 'business_owner',
    recipient_name: 'Aarav Sharma',
    preview: 'Thanks for the proposal. Can we schedule a call this week?',
    body: 'Thanks for the proposal. Can we schedule a call this week to discuss the online ordering integration in more detail?',
    sent_at: '2026-06-28T09:15:00Z',
    read: false,
    channel: 'project',
  },
  {
    id: 'msg-003',
    sender_name: 'LeadScope Support',
    sender_role: 'admin',
    recipient_name: 'Aarav Sharma',
    preview: 'Your verification has been approved. You now have a verified badge.',
    body: 'Your verification has been approved. You now have a verified badge on your profile.',
    sent_at: '2026-06-26T16:00:00Z',
    read: true,
    channel: 'support',
  },
  {
    id: 'msg-004',
    sender_name: 'Karthik Reddy',
    sender_role: 'freelancer',
    recipient_name: 'Dr. Reddy Dental Studio',
    preview: 'I have sent the proposal for the booking app. Let me know if...',
    body: 'I have sent the proposal for the booking app. Let me know if you would like to see a prototype of the booking flow before we finalize.',
    sent_at: '2026-06-29T15:00:00Z',
    read: false,
    channel: 'direct',
  },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'ntf-001',
    type: 'bid',
    title: 'New bid on your project',
    body: 'Sofia Reyes placed a $2,800 bid on "Restaurant Website with Online Ordering".',
    created_at: '2026-06-26T12:30:00Z',
    read: false,
  },
  {
    id: 'ntf-002',
    type: 'message',
    title: 'New message from Ohri\'s Jiva Imperia',
    body: 'Thanks for the proposal. Can we schedule a call this week?',
    created_at: '2026-06-28T09:15:00Z',
    read: false,
  },
  {
    id: 'ntf-003',
    type: 'escrow',
    title: 'Escrow milestone released',
    body: 'Milestone 2 of 4 released for "Boutique E-commerce Store Setup" — $1,050.',
    created_at: '2026-06-29T10:00:00Z',
    read: false,
  },
  {
    id: 'ntf-004',
    type: 'verification',
    title: 'Verification approved',
    body: 'Your freelancer profile is now verified with a blue badge.',
    created_at: '2026-06-26T16:00:00Z',
    read: true,
  },
];

export const SEED_VERIFICATIONS: VerificationRequest[] = [
  {
    id: 'ver-001',
    business_name: 'Roastery Coffee House',
    category: 'Cafe',
    submitted_at: '2026-06-28T10:00:00Z',
    status: 'pending',
    documents_count: 3,
  },
  {
    id: 'ver-002',
    business_name: 'Fitness First Studio',
    category: 'Gym',
    submitted_at: '2026-06-27T14:00:00Z',
    status: 'pending',
    documents_count: 2,
  },
  {
    id: 'ver-003',
    business_name: 'Freemans Sporting Club',
    category: 'Boutique',
    submitted_at: '2026-06-25T09:30:00Z',
    status: 'approved',
    documents_count: 4,
  },
  {
    id: 'ver-004',
    business_name: 'Dr. Reddy Dental Studio',
    category: 'Healthcare',
    submitted_at: '2026-06-24T11:15:00Z',
    status: 'rejected',
    documents_count: 1,
  },
];

export const SEED_DISPUTES: Dispute[] = [
  {
    id: 'dsp-001',
    contract_id: 'esc-002',
    project_title: 'Brand Identity & Logo Redesign',
    freelancer_name: 'Priya Nair',
    business_name: 'Minerva Coffee Shop',
    reason: 'Client claims final deliverables did not match agreed scope — menu design missing.',
    amount: 350,
    status: 'open',
    opened_at: '2026-06-29T08:00:00Z',
  },
  {
    id: 'dsp-002',
    contract_id: 'esc-001',
    project_title: 'Boutique E-commerce Store Setup',
    freelancer_name: 'Sofia Reyes',
    business_name: 'Kalaniketan Silks',
    reason: 'Payment delay dispute — milestone 2 release overdue by 5 days.',
    amount: 1050,
    status: 'investigating',
    opened_at: '2026-06-30T13:00:00Z',
  },
];

export const SEED_LOGS: SystemLog[] = [
  {
    id: 'log-001',
    level: 'info',
    module: 'auth',
    message: 'User session created for jordan@company.com (freelancer role)',
    timestamp: '2026-06-30T08:00:00Z',
  },
  {
    id: 'log-002',
    level: 'info',
    module: 'scan',
    message: 'Location scan completed: Jubilee Hills — 10 businesses, 5 missing websites',
    timestamp: '2026-06-30T08:05:00Z',
  },
  {
    id: 'log-003',
    level: 'warning',
    module: 'escrow',
    message: 'Milestone release overdue for contract esc-001 (5 days)',
    timestamp: '2026-06-30T12:00:00Z',
  },
  {
    id: 'log-004',
    level: 'error',
    module: 'places_api',
    message: 'Google Places API rate limit hit — falling back to local catalog',
    timestamp: '2026-06-30T12:15:00Z',
  },
  {
    id: 'log-005',
    level: 'info',
    module: 'verification',
    message: 'Verification request ver-003 approved by admin',
    timestamp: '2026-06-30T14:00:00Z',
  },
];

// ─── Portfolio Reel Data ────────────────────────────────────────────────────

export type ReelItem = {
  id: string;
  freelancer_id: string;
  type: 'video' | 'website' | 'testimonial';
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  // For uploaded media & video items
  duration?: string;
  views?: number;
  mediaUrl?: string;
  mediaType?: 'video' | 'image';
  // For website mockups
  client?: string;
  year?: string;
  // For testimonials
  rating?: number;
  author?: string;
  author_role?: string;
};

export type ServicePackage = {
  id: string;
  freelancer_id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  delivery_days: number;
  popular?: boolean;
};

export const SEED_REELS: ReelItem[] = [
  {
    id: 'reel-001',
    freelancer_id: 'fl-001',
    type: 'video',
    title: 'Restaurant Website — Before & After',
    subtitle: 'Ohri\'s Jiva Imperia · 2-week transformation',
    description: 'Watch how we took a local restaurant from zero online presence to a fully functional ordering platform with table booking.',
    tags: ['Next.js', 'Stripe', 'Supabase'],
    duration: '1:42',
    views: 1240,
  },
  {
    id: 'reel-002',
    freelancer_id: 'fl-001',
    type: 'website',
    title: 'Dental Clinic Booking Platform',
    subtitle: 'SmileCare Clinic · Full-stack build',
    description: 'Custom booking system with appointment scheduling, SMS reminders, and telehealth video integration.',
    tags: ['React', 'Node.js', 'WebRTC'],
    client: 'SmileCare Clinic',
    year: '2025',
  },
  {
    id: 'reel-003',
    freelancer_id: 'fl-001',
    type: 'testimonial',
    title: 'Client Testimonial',
    subtitle: 'Restaurant Owner · Hyderabad',
    description: 'Jordan rebuilt our entire online ordering system in 2 weeks. We went from zero online orders to 200+ per day. The ROI was immediate.',
    tags: ['Web Development', 'Restaurant'],
    rating: 5,
    author: 'Rajesh Ohri',
    author_role: 'Owner, Ohri\'s Jiva Imperia',
  },
  {
    id: 'reel-004',
    freelancer_id: 'fl-002',
    type: 'video',
    title: 'Brand Identity Reel — Minerva Coffee',
    subtitle: 'Logo, menu, and social media kit',
    description: 'A complete brand refresh for a heritage cafe. Watch the design process from concept to final delivery.',
    tags: ['Figma', 'Branding', 'Illustration'],
    duration: '2:15',
    views: 890,
  },
  {
    id: 'reel-005',
    freelancer_id: 'fl-002',
    type: 'website',
    title: 'Boutique E-commerce Store',
    subtitle: 'Kalaniketan Silks · Shopify build',
    description: 'Custom Shopify theme with 200+ product catalog, Klaviyo email automation, and conversion-optimized checkout.',
    tags: ['Shopify', 'Liquid', 'Klaviyo'],
    client: 'Kalaniketan Silks',
    year: '2026',
  },
  {
    id: 'reel-006',
    freelancer_id: 'fl-002',
    type: 'testimonial',
    title: 'Client Testimonial',
    subtitle: 'Boutique Owner · Bengaluru',
    description: 'Priya understood our brand instantly. The new store looks premium and our online sales tripled in the first month.',
    tags: ['Branding', 'E-commerce'],
    rating: 5,
    author: 'Anita Reddy',
    author_role: 'Owner, Kalaniketan Silks',
  },
  {
    id: 'reel-007',
    freelancer_id: 'fl-003',
    type: 'video',
    title: 'Local SEO Case Study — Paradise Biryani',
    subtitle: 'From page 3 to #1 on Google Maps in 60 days',
    description: 'How we optimized GMB, built citations, and improved review velocity to dominate local search for a top restaurant.',
    tags: ['SEO', 'GMB', 'Content'],
    duration: '3:08',
    views: 2150,
  },
  {
    id: 'reel-008',
    freelancer_id: 'fl-003',
    type: 'testimonial',
    title: 'Client Testimonial',
    subtitle: 'Marketing Manager · Restaurant Chain',
    description: 'Marcus got us to #1 on Google Maps in 2 months. Our walk-in traffic increased by 40%. Best investment we made.',
    tags: ['SEO', 'Local Marketing'],
    rating: 5,
    author: 'Vikram Naidu',
    author_role: 'Marketing Manager, Paradise Foods',
  },
];

export const SEED_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg-001',
    freelancer_id: 'fl-001',
    name: 'Restaurant Landing Page Package',
    price: 12000,
    currency: '₹',
    description: 'A high-converting landing page for restaurants with online ordering integration.',
    features: [
      'Custom landing page design',
      'Mobile-responsive layout',
      'Online ordering integration',
      'Google Maps & click-to-call',
      'Contact form with WhatsApp',
      'Delivery in 5 days',
    ],
    delivery_days: 5,
    popular: true,
  },
  {
    id: 'pkg-002',
    freelancer_id: 'fl-001',
    name: 'Full Website + CMS Package',
    price: 35000,
    currency: '₹',
    description: 'Complete website with content management system for menu, blog, and pages.',
    features: [
      '5-page custom website',
      'CMS for self-updates',
      'SEO optimization',
      'SSL & hosting setup',
      'Analytics dashboard',
      '30-day support',
    ],
    delivery_days: 14,
  },
  {
    id: 'pkg-003',
    freelancer_id: 'fl-002',
    name: 'Brand Identity Starter Kit',
    price: 8000,
    currency: '₹',
    description: 'Logo, color palette, typography, and social media templates for new businesses.',
    features: [
      'Logo design (3 concepts)',
      'Brand color palette',
      'Typography guide',
      '5 social media templates',
      'Business card design',
      'Delivery in 7 days',
    ],
    delivery_days: 7,
    popular: true,
  },
  {
    id: 'pkg-004',
    freelancer_id: 'fl-002',
    name: 'E-commerce Store Setup',
    price: 28000,
    currency: '₹',
    description: 'Shopify store with custom theme, product catalog, and payment gateway.',
    features: [
      'Custom Shopify theme',
      'Up to 100 product uploads',
      'Payment gateway setup',
      'Email automation (Klaviyo)',
      'Mobile optimization',
      '14-day support',
    ],
    delivery_days: 10,
  },
  {
    id: 'pkg-005',
    freelancer_id: 'fl-003',
    name: 'Local SEO Domination Package',
    price: 15000,
    currency: '₹',
    description: 'Get your business ranking #1 on Google Maps in 60 days or your money back.',
    features: [
      'Google Business Profile optimization',
      'Local citation building (50+)',
      'Review generation strategy',
      'Monthly ranking report',
      'Competitor analysis',
      '60-day guarantee',
    ],
    delivery_days: 60,
    popular: true,
  },
  {
    id: 'pkg-006',
    freelancer_id: 'fl-003',
    name: 'Google Ads Management',
    price: 10000,
    currency: '₹',
    description: 'Monthly Google Ads management for local businesses with weekly optimization.',
    features: [
      'Campaign setup & tracking',
      'Keyword research',
      'Ad copywriting',
      'Weekly optimization',
      'Monthly performance report',
      'Budget: ₹5,000+/mo recommended',
    ],
    delivery_days: 3,
  },
];
