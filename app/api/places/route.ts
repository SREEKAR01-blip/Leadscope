import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';
const MAX_RESULTS = 20;
const FETCH_TIMEOUT_MS = 10000;

type PlacesAPIResponse = {
  places?: PlaceResult[];
  error?: { code: number; message: string; status: string };
};

type PlaceResult = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text: string };
  types?: string[];
  businessStatus?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
};

type Lead = {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  review_count: number | null;
  digital_score: number;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  place_id: string;
  created_at: string;
};

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function getApiKey(): string | null {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!key) {
    console.warn('[places] Notice: GOOGLE_MAPS_API_KEY not found in environment. Using local fallback generator.');
    return null;
  }
  return key;
}

function categorize(types: string[] | undefined, primaryType: string | undefined): string {
  if (primaryType) {
    const p = primaryType.toLowerCase();
    if (p.includes('restaurant') || p.includes('cafe') || p.includes('food') || p.includes('bakery') || p.includes('bar') || p.includes('biscuit') || p.includes('pub')) return 'Restaurant';
    if (p.includes('salon') || p.includes('spa') || p.includes('hair') || p.includes('beauty')) return 'Salon';
    if (p.includes('gym') || p.includes('fitness') || p.includes('health') || p.includes('studio')) return 'Gym';
    if (p.includes('boutique') || p.includes('clothing') || p.includes('store') || p.includes('shop') || p.includes('market')) return 'Boutique';
    if (p.includes('doctor') || p.includes('dentist') || p.includes('clinic') || p.includes('hospital') || p.includes('medical') || p.includes('health')) return 'Healthcare';
  }

  if (!types) return 'Local Business';
  const set = new Set(types.map(t => t.toLowerCase()));
  if (set.has('restaurant') || set.has('food') || set.has('cafe') || set.has('bakery') || set.has('bar')) return 'Restaurant';
  if (set.has('hair_care') || set.has('beauty_salon') || set.has('spa')) return 'Salon';
  if (set.has('gym') || set.has('health_club')) return 'Gym';
  if (set.has('clothing_store') || set.has('store') || set.has('shoe_store') || set.has('department_store')) return 'Boutique';
  if (set.has('doctor') || set.has('dentist') || set.has('hospital') || set.has('medical_clinic')) return 'Healthcare';

  return 'Local Business';
}

function computeDigitalScore(place: PlaceResult): number {
  let score = 0;
  if (place.websiteUri) score += 35;
  if (place.nationalPhoneNumber || place.internationalPhoneNumber) score += 15;
  if (place.rating != null) score += Math.min(20, Math.round(place.rating * 4));
  if (place.userRatingCount != null) {
    score += Math.min(20, Math.round(place.userRatingCount / 5));
  }
  return Math.max(0, Math.min(100, score));
}

function convertPlaceToLead(place: PlaceResult, searchCity: string): Lead {
  const website = place.websiteUri || null;
  const category = categorize(place.types, place.primaryTypeDisplayName?.text);
  const digitalScore = computeDigitalScore(place);

  return {
    id: `google-${place.id}`,
    name: place.displayName?.text || 'Unknown Business',
    category,
    address: place.formattedAddress || '',
    city: searchCity || 'Hyderabad',
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
    email: null,
    website,
    rating: place.rating ?? null,
    review_count: place.userRatingCount ?? null,
    digital_score: digitalScore,
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    image_url: null,
    place_id: place.id,
    created_at: new Date().toISOString(),
  };
}

function persistLeadsInBackground(leads: Lead[]): void {
  (async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.log('[places API] Supabase not configured, skipping persistence');
        return;
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

      Promise.all(
        leads.map(async (lead) => {
          try {
            await supabase
              .from('leads')
              .upsert({
                place_id: lead.place_id,
                name: lead.name,
                category: lead.category,
                address: lead.address,
                city: lead.city,
                phone: lead.phone,
                email: lead.email,
                website: lead.website,
                rating: lead.rating,
                review_count: lead.review_count,
                digital_score: lead.digital_score,
                latitude: lead.latitude,
                longitude: lead.longitude,
                image_url: lead.image_url,
              }, { onConflict: 'place_id', ignoreDuplicates: true });
          } catch (e) {
            console.error('[places API] Failed to persist lead:', lead.name, e);
          }
        })
      ).then(() => console.log('[places API] Background persistence complete'))
       .catch((e) => console.error('[places API] Background persistence error:', e));
    } catch (e) {
      console.error('[places API] Supabase client creation failed:', e);
    }
  })();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const apiKey = getApiKey();

    if (!apiKey) {
      const fallbackLeads: Lead[] = [
        {
          id: `fallback-1-${Date.now()}`,
          name: 'Spice Route Kitchen & Bar',
          category: 'Restaurant',
          address: `Road No. 36, ${query}`,
          city: query,
          phone: '+91 98765 43210',
          email: 'contact@spiceroute.com',
          website: 'https://spiceroute.com',
          rating: 4.6,
          review_count: 240,
          digital_score: 85,
          latitude: 17.43,
          longitude: 78.40,
          image_url: null,
          place_id: `place-fallback-1`,
          created_at: new Date().toISOString(),
        },
        {
          id: `fallback-2-${Date.now()}`,
          name: 'Urban Fitness & Gym',
          category: 'Gym',
          address: `Metro Pillar 22, ${query}`,
          city: query,
          phone: '+91 99887 66554',
          email: null,
          website: null,
          rating: 4.2,
          review_count: 85,
          digital_score: 45,
          latitude: 17.44,
          longitude: 78.39,
          image_url: null,
          place_id: `place-fallback-2`,
          created_at: new Date().toISOString(),
        },
        {
          id: `fallback-3-${Date.now()}`,
          name: 'Apollo Dental & Health Clinic',
          category: 'Healthcare',
          address: `Main Road, ${query}`,
          city: query,
          phone: '+91 91234 56789',
          email: 'info@apollodental.in',
          website: 'https://apollodental.in',
          rating: 4.8,
          review_count: 410,
          digital_score: 92,
          latitude: 17.45,
          longitude: 78.41,
          image_url: null,
          place_id: `place-fallback-3`,
          created_at: new Date().toISOString(),
        },
        {
          id: `fallback-4-${Date.now()}`,
          name: 'Silk & Cotton Threads Boutique',
          category: 'Boutique',
          address: `High Street, ${query}`,
          city: query,
          phone: '+91 95432 10987',
          email: null,
          website: null,
          rating: 4.0,
          review_count: 32,
          digital_score: 35,
          latitude: 17.42,
          longitude: 78.42,
          image_url: null,
          place_id: `place-fallback-4`,
          created_at: new Date().toISOString(),
        }
      ];
      return NextResponse.json(fallbackLeads);
    }

    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.primaryTypeDisplayName',
      'places.types',
      'places.businessStatus',
      'places.websiteUri',
      'places.nationalPhoneNumber',
      'places.internationalPhoneNumber',
    ].join(',');

    let textQuery = query;
    const qLower = query.toLowerCase().trim();

    // Check if query has explicit category or preposition filters
    const hasModifier = /\b(in|at|near|by|restaurants?|cafes?|salons?|gyms?|boutiques?|shops?|stores?|clinics?|hospitals?|doctors?|pharmacies|pharmacy|bakeries|hostels?|colleges?|schools?|businesses?|services?)\b/i.test(qLower);

    if (!hasModifier) {
      // User searched a specific neighborhood/locality/area like "kompally", "maisammaguda", "gachibowli"
      // If city isn't specified, append Hyderabad for local precision
      if (qLower.includes('mumbai') || qLower.includes('delhi') || qLower.includes('bangalore') || qLower.includes('pune') || qLower.includes('chennai') || qLower.includes('kolkata') || qLower.includes('jaipur')) {
        textQuery = `businesses and establishments in ${query}`;
      } else if (qLower.includes('hyderabad')) {
        textQuery = `businesses and establishments in ${query}`;
      } else {
        textQuery = `businesses and establishments in ${query} Hyderabad`;
      }
    }

    const fetchPlacesForQuery = async (tQuery: string): Promise<PlaceResult[]> => {
      const response = await fetchWithTimeout(
        PLACES_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': fieldMask,
          },
          body: JSON.stringify({
            textQuery: tQuery,
            pageSize: MAX_RESULTS,
            languageCode: 'en',
          }),
          cache: 'no-store',
        },
        FETCH_TIMEOUT_MS
      );

      if (!response.ok) return [];
      const apiResponse: PlacesAPIResponse = await response.json();
      return apiResponse.places || [];
    };

    let places = await fetchPlacesForQuery(textQuery);

    // If initial query returned fewer than 5 results, run a secondary fallback query for broader coverage
    if (places.length < 5 && !hasModifier) {
      const secondaryQuery = `restaurants cafes and shops in ${query} Hyderabad`;
      const secondaryPlaces = await fetchPlacesForQuery(secondaryQuery);
      const existingIds = new Set(places.map(p => p.id));
      for (const p of secondaryPlaces) {
        if (!existingIds.has(p.id)) {
          places.push(p);
        }
      }
    }

    const operational = places.filter(
      (p) => p.businessStatus !== 'CLOSED_TEMPORARILY' && p.businessStatus !== 'CLOSED_PERMANENTLY'
    );

    // Extract appropriate city / area label
    let defaultCity = query.charAt(0).toUpperCase() + query.slice(1);
    if (!qLower.includes('hyderabad') && !qLower.includes('mumbai') && !qLower.includes('delhi') && !qLower.includes('bangalore')) {
      defaultCity = `${query.charAt(0).toUpperCase() + query.slice(1)}, Hyderabad`;
    }

    const leads = operational.map((p) => {
      let leadCity = defaultCity;
      if (p.formattedAddress) {
        if (p.formattedAddress.toLowerCase().includes('kompally')) leadCity = 'Kompally, Hyderabad';
        else if (p.formattedAddress.toLowerCase().includes('maisammaguda')) leadCity = 'Maisammaguda, Hyderabad';
        else if (p.formattedAddress.toLowerCase().includes('gachibowli')) leadCity = 'Gachibowli, Hyderabad';
        else if (p.formattedAddress.toLowerCase().includes('kukatpally')) leadCity = 'Kukatpally, Hyderabad';
        else if (p.formattedAddress.toLowerCase().includes('madhapur')) leadCity = 'Madhapur, Hyderabad';
        else if (p.formattedAddress.toLowerCase().includes('jubilee hills')) leadCity = 'Jubilee Hills, Hyderabad';
      }
      return convertPlaceToLead(p, leadCity);
    });

    leads.sort((a, b) => a.digital_score - b.digital_score);

    // Persist to database in background
    persistLeadsInBackground(leads);

    return NextResponse.json(leads);
  } catch (err: any) {
    console.error('[places API] error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

