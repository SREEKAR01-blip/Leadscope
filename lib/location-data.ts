import type { Lead } from './supabase';

export type RegionKey = 
  | 'kompally'
  | 'maisammaguda'
  | 'gachibowli'
  | 'kukatpally'
  | 'madhapur'
  | 'jubilee-hills' 
  | 'hyderabad' 
  | 'mumbai' 
  | 'delhi' 
  | 'bangalore' 
  | 'pune' 
  | 'chennai' 
  | 'kolkata' 
  | 'jaipur' 
  | 'india';

export type RegionMeta = {
  key: RegionKey;
  label: string;
  city: string;
  centerLat: number;
  centerLng: number;
  businesses: Lead[];
};

export const REGIONS: RegionMeta[] = [
  {
    key: 'kompally',
    label: 'Kompally',
    city: 'Hyderabad',
    centerLat: 17.5366,
    centerLng: 78.4844,
    businesses: [],
  },
  {
    key: 'maisammaguda',
    label: 'Maisammaguda',
    city: 'Hyderabad',
    centerLat: 17.5631,
    centerLng: 78.4553,
    businesses: [],
  },
  {
    key: 'gachibowli',
    label: 'Gachibowli',
    city: 'Hyderabad',
    centerLat: 17.4401,
    centerLng: 78.3489,
    businesses: [],
  },
  {
    key: 'kukatpally',
    label: 'Kukatpally',
    city: 'Hyderabad',
    centerLat: 17.4947,
    centerLng: 78.3996,
    businesses: [],
  },
  {
    key: 'madhapur',
    label: 'Madhapur',
    city: 'Hyderabad',
    centerLat: 17.4483,
    centerLng: 78.3915,
    businesses: [],
  },
  {
    key: 'jubilee-hills',
    label: 'Jubilee Hills',
    city: 'Jubilee Hills',
    centerLat: 17.4326,
    centerLng: 78.4072,
    businesses: [],
  },
  {
    key: 'hyderabad',
    label: 'Hyderabad',
    city: 'Hyderabad',
    centerLat: 17.4199,
    centerLng: 78.455,
    businesses: [],
  },
  {
    key: 'mumbai',
    label: 'Mumbai',
    city: 'Mumbai',
    centerLat: 19.0760,
    centerLng: 72.8777,
    businesses: [],
  },
  {
    key: 'delhi',
    label: 'Delhi',
    city: 'Delhi',
    centerLat: 28.7041,
    centerLng: 77.1025,
    businesses: [],
  },
  {
    key: 'bangalore',
    label: 'Bangalore',
    city: 'Bangalore',
    centerLat: 12.9716,
    centerLng: 77.5946,
    businesses: [],
  },
  {
    key: 'pune',
    label: 'Pune',
    city: 'Pune',
    centerLat: 18.5204,
    centerLng: 73.8567,
    businesses: [],
  },
  {
    key: 'chennai',
    label: 'Chennai',
    city: 'Chennai',
    centerLat: 13.0827,
    centerLng: 80.2707,
    businesses: [],
  },
  {
    key: 'kolkata',
    label: 'Kolkata',
    city: 'Kolkata',
    centerLat: 22.5726,
    centerLng: 88.3639,
    businesses: [],
  },
  {
    key: 'jaipur',
    label: 'Jaipur',
    city: 'Jaipur',
    centerLat: 26.9124,
    centerLng: 75.7873,
    businesses: [],
  },
  {
    key: 'india',
    label: 'India',
    city: 'India',
    centerLat: 20.5937,
    centerLng: 78.9629,
    businesses: [],
  }
];

export function findRegion(query: string): RegionMeta | null {
  const q = query.trim().toLowerCase();
  
  // Try to find exact or partial match based on label, city, or key substrings
  const found = REGIONS.find(
    (r) =>
      q.includes(r.label.toLowerCase()) ||
      q.includes(r.city.toLowerCase()) ||
      q.includes(r.key.toLowerCase()) ||
      r.label.toLowerCase().includes(q)
  );
  
  return found ?? null;
}

export function getDefaultRegion(): RegionMeta {
  // Default region is the country map overview
  return REGIONS.find(r => r.key === 'india') || REGIONS[0];
}
