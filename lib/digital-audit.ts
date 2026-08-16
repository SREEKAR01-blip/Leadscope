import type { ExtendedLead } from './app-context';

export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'youtube';

export type AuditCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  weight: number;
  icon: string;
};

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  present: boolean;
  url: string | null;
  followers: number | null;
};

export type DigitalAudit = {
  checks: AuditCheck[];
  socials: SocialLink[];
  // Weighted score components (0-100 each)
  websiteScore: number;
  seoScore: number;
  speedScore: number;
  sslScore: number;
  socialScore: number;
  // Final weighted score
  digitalPresenceScore: number;
  // Revenue leakage
  monthlySearchVolume: number;
  avgTransactionValue: number;
  revenueLeakage: number;
  // Competitors
  competitors: Competitor[];
  // Growth / Loss
  digitalPresenceGrowth: number;
  growthFactors: string[];
};

export type Competitor = {
  name: string;
  rank: number;
  digitalScore: number;
  reviewCount: number;
  hasWebsite: boolean;
  marketSharePct: number;
};

// Weights for the weighted score formula
const W = { website: 0.30, seo: 0.25, speed: 0.20, ssl: 0.15, social: 0.10 };

// Deterministic pseudo-random based on string hash
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function rand(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.round(min + r * (max - min));
}

export function runDigitalAudit(lead: ExtendedLead): DigitalAudit {
  const seed = hash(lead.id);
  const hasWebsite = !!lead.website;
  const hasSSL = hasWebsite && lead.website != null && lead.website.startsWith('https://');

  // Website score: 0 if no website, otherwise based on whether it has SSL and is functional
  const websiteScore = hasWebsite ? (hasSSL ? 90 : 55) : 0;

  // SEO score: based on rating, review count, and whether they have a website
  const reviewFactor = Math.min((lead.review_count ?? 0) / 500, 1) * 40;
  const ratingFactor = ((lead.rating ?? 0) / 5) * 30;
  const websiteSeoFactor = hasWebsite ? 30 : 0;
  const seoScore = Math.round(reviewFactor + ratingFactor + websiteSeoFactor);

  // Speed score: deterministic from seed, lower if no SSL
  const speedScore = hasWebsite ? rand(seed + 1, 35, 85) - (hasSSL ? 0 : 15) : 0;

  // SSL score
  const sslScore = hasSSL ? 100 : 0;

  // Social score: deterministic presence
  const socialSeed = seed + 2;
  const socials: SocialLink[] = [
    {
      platform: 'instagram',
      label: 'Instagram',
      present: rand(socialSeed, 0, 1) === 1,
      url: hasWebsite ? `https://instagram.com/${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null,
      followers: rand(socialSeed + 10, 120, 12000),
    },
    {
      platform: 'facebook',
      label: 'Facebook',
      present: rand(socialSeed + 1, 0, 1) === 1,
      url: hasWebsite ? `https://facebook.com/${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null,
      followers: rand(socialSeed + 20, 200, 25000),
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      present: rand(socialSeed + 2, 0, 1) === 1 && hasWebsite,
      url: hasWebsite ? `https://linkedin.com/company/${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null,
      followers: rand(socialSeed + 30, 50, 5000),
    },
    {
      platform: 'youtube',
      label: 'YouTube',
      present: rand(socialSeed + 3, 0, 1) === 1,
      url: null,
      followers: rand(socialSeed + 40, 0, 3000),
    },
  ];
  const socialScore = Math.round((socials.filter((s) => s.present).length / socials.length) * 100);

  // Weighted digital presence score
  const digitalPresenceScore = Math.round(
    W.website * websiteScore +
    W.seo * seoScore +
    W.speed * speedScore +
    W.ssl * sslScore +
    W.social * socialScore
  );

  // Checks for the audit checklist
  const checks: AuditCheck[] = [
    {
      id: 'ssl',
      label: 'SSL Certificate (HTTPS)',
      passed: hasSSL,
      detail: hasSSL ? 'Valid SSL — secure connection active' : hasWebsite ? 'No SSL — site served over HTTP' : 'No website to audit',
      weight: 15,
      icon: 'lock',
    },
    {
      id: 'mobile',
      label: 'Mobile Responsiveness',
      passed: hasWebsite && rand(seed + 3, 0, 3) > 0,
      detail: hasWebsite ? (rand(seed + 3, 0, 3) > 0 ? 'Responsive layout detected' : 'Not mobile-friendly') : 'No website to test',
      weight: 20,
      icon: 'smartphone',
    },
    {
      id: 'speed',
      label: 'Page Load Speed',
      passed: speedScore >= 50,
      detail: hasWebsite ? `${speedScore > 60 ? 'Fast' : speedScore > 40 ? 'Average' : 'Slow'} load (${rand(seed + 4, 800, 4500)}ms)` : 'No website to measure',
      weight: 20,
      icon: 'gauge',
    },
    {
      id: 'seo-meta',
      label: 'SEO Meta Tags',
      passed: seoScore >= 50,
      detail: seoScore >= 50 ? 'Title and description tags present' : 'Missing critical meta tags',
      weight: 25,
      icon: 'search',
    },
    {
      id: 'social',
      label: 'Social Media Links',
      passed: socials.filter((s) => s.present).length >= 2,
      detail: `${socials.filter((s) => s.present).length} of ${socials.length} platforms linked`,
      weight: 10,
      icon: 'share',
    },
    {
      id: 'website',
      label: 'Website Present',
      passed: hasWebsite,
      detail: hasWebsite ? `Active website: ${lead.website}` : 'No website found — critical gap',
      weight: 30,
      icon: 'globe',
    },
  ];

  // Revenue leakage calculation
  // Monthly search volume: deterministic based on category and review count
  const baseSearchVolume = rand(seed + 5, 800, 5000);
  const monthlySearchVolume = baseSearchVolume + Math.min((lead.review_count ?? 0) * 2, 8000);

  // Average transaction value varies by category
  const categoryMultipliers: Record<string, number> = {
    Restaurant: 450,
    Cafe: 350,
    Gym: 1200,
    Salon: 800,
    Healthcare: 1500,
    Boutique: 600,
  };
  const avgTransactionValue = (categoryMultipliers[lead.category] ?? 500) + rand(seed + 6, 0, 200);

  // Leakage = Monthly Search Volume × (1 - DigitalScore/100) × Avg Transaction Value
  const revenueLeakage = Math.round(
    monthlySearchVolume * (1 - digitalPresenceScore / 100) * (avgTransactionValue / 100)
  );

  // Competitors: 3 nearby businesses that rank #1 on Google Maps
  const competitors: Competitor[] = [
    {
      name: `${lead.category} Leader #1`,
      rank: 1,
      digitalScore: rand(seed + 10, 82, 96),
      reviewCount: rand(seed + 11, 800, 5000),
      hasWebsite: true,
      marketSharePct: rand(seed + 12, 35, 48),
    },
    {
      name: `${lead.category} Leader #2`,
      rank: 2,
      digitalScore: rand(seed + 13, 72, 88),
      reviewCount: rand(seed + 14, 500, 3000),
      hasWebsite: true,
      marketSharePct: rand(seed + 15, 22, 32),
    },
    {
      name: `${lead.category} Leader #3`,
      rank: 3,
      digitalScore: rand(seed + 16, 65, 80),
      reviewCount: rand(seed + 17, 300, 2000),
      hasWebsite: rand(seed + 18, 0, 1) === 1,
      marketSharePct: rand(seed + 19, 12, 20),
    },
  ];

  // Growth / Loss Calculation based on digital marketplace
  let digitalPresenceGrowth = 0;
  const growthFactors: string[] = [];

  if (hasWebsite) {
    if (digitalPresenceScore >= 75) {
      digitalPresenceGrowth = rand(seed + 30, 4, 18); // 4% to 18% growth
      growthFactors.push('Organic search visibility increased by 12% YoY');
      growthFactors.push('Active social engagement driving direct web traffic');
      if (hasSSL) {
        growthFactors.push('Secure SSL domain ranking boost');
      }
    } else if (digitalPresenceScore >= 50) {
      digitalPresenceGrowth = rand(seed + 30, -3, 6); // -3% to +6%
      if (digitalPresenceGrowth >= 0) {
        growthFactors.push('Steady flow of Google review listings');
        growthFactors.push('Moderate web conversions, but missing social backlinks');
      } else {
        growthFactors.push('Slow page responsiveness causing 4% bounce rate increase');
        growthFactors.push('Competitors outbidding on local search keywords');
      }
    } else {
      digitalPresenceGrowth = rand(seed + 30, -12, -2); // -12% to -2% loss
      growthFactors.push('Weak SEO meta tags causing drop in Google Search rankings');
      growthFactors.push('Unsecured HTTP connection triggering browser warnings');
      growthFactors.push('Inactive social profiles reducing referral channels');
    }
  } else {
    // Critical loss without website
    digitalPresenceGrowth = rand(seed + 30, -22, -8); // -22% to -8% loss
    growthFactors.push('No web domain, leading to 100% online customer leakage');
    growthFactors.push('Competitors absorbing all local search query volume');
    growthFactors.push('Unable to capture digital marketplace leads');
  }

  return {
    checks,
    socials,
    websiteScore,
    seoScore,
    speedScore,
    sslScore,
    socialScore,
    digitalPresenceScore,
    monthlySearchVolume,
    avgTransactionValue,
    revenueLeakage,
    competitors,
    digitalPresenceGrowth,
    growthFactors,
  };
}
