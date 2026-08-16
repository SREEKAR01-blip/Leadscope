// Server-only Google Places client. Never import this from a client component —
// it reads the API key from server env and must stay on the server.

const PLACES_TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

export type RawPlace = {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  icon?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  business_status?: string;
};

export type PlaceDetails = {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  url?: string;
  types?: string[];
  business_status?: string;
  geometry: { location: { lat: number; lng: number } };
};

export class GooglePlacesError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = 'GooglePlacesError';
  }
}

function getApiKey(): string {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new GooglePlacesError(
      'Google Maps API key is not configured on the server.',
      500
    );
  }
  return key;
}

// Industries we target for lead generation. These are the brick-and-mortar
// categories the product qualifies as "local establishments worth scanning".
const TARGET_QUERIES = [
  'restaurant',
  'hair salon',
  'auto repair shop',
  'gym',
  'boutique',
];

export type TextSearchResult = {
  places: RawPlace[];
  next_page_token?: string;
};

export async function textSearch(
  location: string,
  pageToken?: string
): Promise<TextSearchResult> {
  const apiKey = getApiKey();
  const params = new URLSearchParams();
  params.set('key', apiKey);

  if (pageToken) {
    params.set('pagetoken', pageToken);
  } else {
    // Build a query that targets our industries within the searched location.
    // We run one combined query per location to keep request volume low; the
    // individual industry targeting happens via the `types` filter on the
    // returned results.
    params.set('query', `local businesses in ${location}`);
    params.set('type', 'restaurant');
  }

  const url = `${PLACES_TEXT_SEARCH_URL}?${params.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new GooglePlacesError(
      `Google Places text search failed with HTTP ${res.status}`,
      502
    );
  }

  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    results: RawPlace[];
    next_page_token?: string;
  };

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    const msg = data.error_message || data.status;
    if (data.status === 'OVER_QUERY_LIMIT') {
      throw new GooglePlacesError(
        'Google Places API quota exceeded. Please try again later.',
        429
      );
    }
    if (data.status === 'INVALID_REQUEST') {
      throw new GooglePlacesError(
        'Invalid request to Google Places. Check the location and try again.',
        400
      );
    }
    if (data.status === 'REQUEST_DENIED') {
      throw new GooglePlacesError(
        'Google Places request denied. Verify the API key and restrictions.',
        403
      );
    }
    throw new GooglePlacesError(`Google Places error: ${msg}`, 502);
  }

  return {
    places: data.results ?? [],
    next_page_token: data.next_page_token,
  };
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const apiKey = getApiKey();
  const params = new URLSearchParams();
  params.set('key', apiKey);
  params.set('place_id', placeId);
  params.set(
    'fields',
    'name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,url,types,business_status,geometry'
  );

  const url = `${PLACES_DETAILS_URL}?${params.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    status: string;
    result?: PlaceDetails;
    error_message?: string;
  };

  if (data.status !== 'OK' || !data.result) return null;
  return data.result;
}

// Map a Google Place type to one of our product categories. Falls back to
// "Local Business" if none of the known types match.
export function categorize(types: string[] | undefined): string {
  if (!types) return 'Local Business';
  const set = new Set(types);
  if (set.has('restaurant') || set.has('food') || set.has('meal_delivery')) return 'Restaurant';
  if (set.has('hair_care') || set.has('beauty_salon') || set.has('spa')) return 'Salon';
  if (set.has('car_repair') || set.has('car_dealer')) return 'Auto Repair';
  if (set.has('gym') || set.has('health')) return 'Gym';
  if (set.has('clothing_store') || set.has('store') || set.has('shoe_store')) return 'Boutique';
  return 'Local Business';
}

export const TARGET_CATEGORIES = TARGET_QUERIES;
