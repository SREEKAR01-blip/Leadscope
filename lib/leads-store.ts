// Server-only Supabase client for writing leads. Uses the service role key so
// the proxy can upsert rows regardless of RLS — the anon key is for the
// browser, the service role key stays on the server.
import { createClient } from '@supabase/supabase-js';
import type { PlaceDetails } from './google-places';
import { categorize } from './google-places';

export type StoredLead = {
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
  place_id: string | null;
  created_at: string;
};

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Prefer service role for writes; fall back to anon for reads.
  // For writes (upsert), service role bypasses RLS; anon key will work for
  // reads because RLS policies grant access to anon/authenticated.
  const key = serviceKey || anonKey;
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured on the server.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// Derive a city from a formatted address. Google returns "123 Main St, Portland, OR 97201, USA".
// We take the second-to-last component before the country.
function deriveCity(formattedAddress: string): string {
  const parts = formattedAddress.split(',').map((p) => p.trim());
  // parts: [street, city, state zip, country]
  if (parts.length >= 3) {
    return parts[parts.length - 3] || parts[1] || 'Unknown';
  }
  if (parts.length >= 2) return parts[1];
  return parts[0] || 'Unknown';
}

// Compute a 0-100 digital score. Missing website is the strongest signal —
// these are the leads we want to surface. Lower scores = bigger opportunity.
export function computeDigitalScore(details: PlaceDetails): number {
  let score = 0;
  if (details.website) score += 35;
  if (details.formatted_phone_number) score += 15;
  if (details.rating != null) score += Math.min(20, Math.round(details.rating * 4));
  if (details.user_ratings_total != null) {
    score += Math.min(20, Math.round(details.user_ratings_total / 5));
  }
  if (details.url) score += 10;
  return Math.max(0, Math.min(100, score));
}

export type UpsertResult = {
  inserted: number;
  skipped: number;
  errors: string[];
};

// Upsert a batch of flagged leads. Dedupes on place_id via the unique index.
// Only leads with a missing/empty website are stored — that is the core
// business rule that defines an "active target lead".
export async function upsertFlaggedLeads(
  details: PlaceDetails[]
): Promise<UpsertResult> {
  const supabase = getServiceClient();
  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const d of details) {
    const websiteMissing = !d.website || d.website.trim() === '';
    if (!websiteMissing) {
      skipped++;
      continue;
    }

    const row = {
      name: d.name,
      category: categorize(d.types),
      address: d.formatted_address,
      city: deriveCity(d.formatted_address),
      phone: d.formatted_phone_number ?? null,
      email: null,
      website: null,
      rating: d.rating ?? null,
      review_count: d.user_ratings_total ?? null,
      digital_score: computeDigitalScore(d),
      latitude: d.geometry?.location?.lat ?? null,
      longitude: d.geometry?.location?.lng ?? null,
      image_url: null,
      place_id: d.place_id,
    };

    const { error } = await supabase
      .from('leads')
      .upsert(row, { onConflict: 'place_id', ignoreDuplicates: true });

    if (error) {
      // 23505 is unique_violation — treat as a skip, not an error.
      if (error.code !== '23505') {
        errors.push(`${d.name}: ${error.message}`);
      } else {
        skipped++;
      }
      continue;
    }
    inserted++;
  }

  return { inserted, skipped, errors };
}

export async function fetchAllLeads(): Promise<StoredLead[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('digital_score', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as StoredLead[];
}
