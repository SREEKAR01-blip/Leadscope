// Production Google Places API v1 proxy with websiteUri FieldMask
// Uses the new Places API: https://places.googleapis.com/v1/places:searchText
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';
const MAX_RESULTS = 15;
const FETCH_TIMEOUT_MS = 8000;

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
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!key) {
    console.error('[scan] ERROR: GOOGLE_MAPS_API_KEY not found in environment');
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }

  console.log('[scan] API key found, length:', key.length);
  return key;
}

function categorize(types: string[] | undefined, primaryType: string | undefined): string {
  if (primaryType) {
    const p = primaryType.toLowerCase();
    if (p.includes('restaurant') || p.includes('cafe') || p.includes('food') || p.includes('bakery')) return 'Restaurant';
    if (p.includes('salon') || p.includes('spa') || p.includes('hair') || p.includes('beauty')) return 'Salon';
    if (p.includes('gym') || p.includes('fitness') || p.includes('health')) return 'Gym';
    if (p.includes('boutique') || p.includes('clothing') || p.includes('store') || p.includes('shop')) return 'Boutique';
    if (p.includes('doctor') || p.includes('dentist') || p.includes('clinic') || p.includes('hospital')) return 'Healthcare';
    if (p.includes('lawyer') || p.includes('accountant') || p.includes('insurance') || p.includes('bank')) return 'Professional';
  }

  if (!types) return 'Local Business';
  const set = new Set(types.map(t => t.toLowerCase()));
  if (set.has('restaurant') || set.has('food') || set.has('cafe') || set.has('bakery')) return 'Restaurant';
  if (set.has('hair_care') || set.has('beauty_salon') || set.has('spa')) return 'Salon';
  if (set.has('gym') || set.has('health')) return 'Gym';
  if (set.has('clothing_store') || set.has('store') || set.has('shoe_store')) return 'Boutique';
  if (set.has('doctor') || set.has('dentist') || set.has('hospital')) return 'Healthcare';
  if (set.has('lawyer') || set.has('accountant') || set.has('bank')) return 'Professional';

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

function convertPlaceToLead(place: PlaceResult, location: string): Lead {
  const website = place.websiteUri || null;
  const websiteMissing = !website;
  const category = categorize(place.types, place.primaryTypeDisplayName?.text);
  const digitalScore = computeDigitalScore(place);

  return {
    id: `google-${place.id}`,
    name: place.displayName?.text || 'Unknown Business',
    category,
    address: place.formattedAddress || '',
    city: location,
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

// Non-blocking background persistence
function persistLeadsInBackground(leads: Lead[]): void {
  (async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.log('[scan] Supabase not configured, skipping persistence');
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
            console.error('[scan] Failed to persist lead:', lead.name, e);
          }
        })
      ).then(() => console.log('[scan] Background persistence complete'))
       .catch((e) => console.error('[scan] Background persistence error:', e));
    } catch (e) {
      console.error('[scan] Supabase client creation failed:', e);
    }
  })();
}

export async function POST(req: Request) {
  console.log('[scan] ========== NEW REQUEST (Places API v1) ==========');
  console.log('[scan] Request received at:', new Date().toISOString());

  try {
    // Parse request
    let body: { location?: string };
    try {
      body = await req.json();
      console.log('[scan] Parsed body:', body);
    } catch (parseError) {
      console.error('[scan] Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const location = (body.location || '').trim();
    console.log('[scan] Location:', location);

    if (!location) {
      return NextResponse.json(
        { error: 'A location is required. Enter a city, region, or zip code.' },
        { status: 400 }
      );
    }

    const apiKey = getApiKey();

    // Build Places API v1 request
    // FieldMask includes websiteUri for filtering missing websites
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
      'places.websiteUri',       // Key field for website detection
      'places.nationalPhoneNumber',
      'places.internationalPhoneNumber',
    ].join(',');

    console.log('[scan] FieldMask:', fieldMask);
    console.log('[scan] Calling Places API v1...');

    // Make the API call
    let apiResponse: PlacesAPIResponse;
    try {
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
            textQuery: `local businesses in ${location}`,
            pageSize: MAX_RESULTS,
            languageCode: 'en',
          }),
          cache: 'no-store',
        },
        FETCH_TIMEOUT_MS
      );

      console.log('[scan] API HTTP status:', response.status);

      apiResponse = await response.json();
      console.log('[scan] API response places count:', apiResponse.places?.length || 0);

      // Handle API-level errors
      if (apiResponse.error) {
        console.error('[scan] API error:', apiResponse.error);
        return NextResponse.json(
          {
            error: `Google Places API Error: ${apiResponse.error.status} — ${apiResponse.error.message}`,
            googleStatus: apiResponse.error.status,
          },
          { status: apiResponse.error.code || 500 }
        );
      }
    } catch (fetchError) {
      console.error('[scan] Fetch failed:', fetchError);
      return NextResponse.json(
        {
          error: `Network Error: ${fetchError instanceof Error ? fetchError.message : 'Failed to connect to Google Places API'}`,
          googleStatus: 'NETWORK_ERROR',
        },
        { status: 502 }
      );
    }

    // Process results
    const places = apiResponse.places || [];
    console.log('[scan] Places returned:', places.length);

    if (places.length === 0) {
      return NextResponse.json({
        location,
        scanned: 0,
        flagged: 0,
        inserted: 0,
        skipped: 0,
        errors: [],
        leads: [],
        googleStatus: 'ZERO_RESULTS',
      });
    }

    // Filter operational businesses
    const operational = places.filter(
      (p) => p.businessStatus !== 'CLOSED_TEMPORARILY' && p.businessStatus !== 'CLOSED_PERMANENTLY'
    );
    console.log('[scan] Operational businesses:', operational.length);

    // Convert to leads
    const leads: Lead[] = operational.map((p) => convertPlaceToLead(p, location));

    // Sort by digital score (lowest first = highest opportunity)
    leads.sort((a, b) => a.digital_score - b.digital_score);

    const flaggedCount = leads.filter((l) => !l.website).length;
    console.log('[scan] Leads:', leads.length, '| Missing websites:', flaggedCount);

    // Persist in background
    persistLeadsInBackground(leads);

    console.log('[scan] ========== REQUEST COMPLETE ==========');

    return NextResponse.json({
      location,
      scanned: leads.length,
      flagged: flaggedCount,
      inserted: leads.length,
      skipped: 0,
      errors: [],
      leads,
      googleStatus: 'OK',
    });
  } catch (unhandledError) {
    console.error('[scan] ========== UNHANDLED ERROR ==========');
    console.error('[scan] Error:', unhandledError);

    return NextResponse.json(
      {
        error: `Server Error: ${unhandledError instanceof Error ? unhandledError.message : 'Unknown server error'}`,
        googleStatus: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
