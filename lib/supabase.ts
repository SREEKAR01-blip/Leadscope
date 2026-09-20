import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : 'https://wbqxeiocnovdtsxzoqll.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_P3xV-pI7AGd8VAiT5Ei2DA_AM7KXiG8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Lead = {
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

export type UserRole = 'freelancer' | 'business_owner' | 'admin' | 'job_seeker';

export type Profile = {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at?: string;
};

export async function syncUserProfileToSupabase(user: { email: string; name: string; role: string; password?: string }) {
  try {
    const email = user.email.trim().toLowerCase();
    const payload: Record<string, any> = {
      email,
      name: user.name,
      role: user.role,
    };
    if (user.password) {
      payload.password = user.password;
    }
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'email' })
      .select();

    if (error) {
      console.warn('[Supabase Profiles Sync Notice]:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('[Supabase Profiles Sync Error]:', err);
  }
}

export async function fetchUserProfileFromSupabase(email: string): Promise<Profile | null> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase Fetch Profile Notice]:', error.message);
      return null;
    }
    return data as Profile | null;
  } catch (err) {
    console.warn('[Supabase Fetch Profile Error]:', err);
    return null;
  }
}

