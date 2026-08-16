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

function getApiKey(): string {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!key) {
    console.error('[places] ERROR: GOOGLE_MAPS_API_KEY not found in environment');
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
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
          textQuery: query,
          pageSize: MAX_RESULTS,
          languageCode: 'en',
        }),
        cache: 'no-store',
      },
      FETCH_TIMEOUT_MS
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error?.message || 'Failed to fetch places from Google API' },
        { status: response.status }
      );
    }

    const apiResponse: PlacesAPIResponse = await response.json();
    const places = apiResponse.places || [];

    const operational = places.filter(
      (p) => p.businessStatus !== 'CLOSED_TEMPORARILY' && p.businessStatus !== 'CLOSED_PERMANENTLY'
    );

    let searchCity = 'India';
    const queryLower = query.toLowerCase();
    const majorCities = ['delhi', 'mumbai', 'bangalore', 'pune', 'chennai', 'kolkata', 'hyderabad', 'jaipur', 'jubilee hills', 'india'];
    for (const city of majorCities) {
      if (queryLower.includes(city)) {
        searchCity = city === 'jubilee hills' ? 'Jubilee Hills' : city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    const leads = operational.map((p) => convertPlaceToLead(p, searchCity));

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
