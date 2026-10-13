/**
 * Complete list of supported major cities of Nepal for Move-In platform
 */
export const NEPAL_CITIES = [
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Pokhara',
  'Bharatpur',
  'Biratnagar',
  'Birgunj',
  'Butwal',
  'Dharan',
  'Itahari',
  'Hetauda',
  'Nepalgunj',
  'Dhangadhi',
  'Janakpur',
  'Birtamod',
  'Damak',
  'Mechinagar',
  'Bhadrapur',
  'Siddharthanagar',
  'Birendranagar',
] as const;

export type NepalCity = (typeof NEPAL_CITIES)[number];

export const CITIES_WITH_ALL = ['All', ...NEPAL_CITIES] as const;

export const DEFAULT_CITY: NepalCity = 'Kathmandu';

/**
 * Frequently searched popular cities for quick selection pills
 */
export const POPULAR_CITIES: NepalCity[] = [
  'Kathmandu',
  'Pokhara',
  'Lalitpur',
  'Bhaktapur',
  'Bharatpur',
  'Biratnagar',
  'Butwal',
  'Dharan',
];

/**
 * Display labels for cities with alternate names (e.g., Bhairahawa)
 */
export const CITY_DISPLAY_LABELS: Record<string, string> = {
  Kathmandu: 'Kathmandu',
  Lalitpur: 'Lalitpur',
  Bhaktapur: 'Bhaktapur',
  Pokhara: 'Pokhara',
  Bharatpur: 'Bharatpur',
  Biratnagar: 'Biratnagar',
  Birgunj: 'Birgunj',
  Butwal: 'Butwal',
  Dharan: 'Dharan',
  Itahari: 'Itahari',
  Hetauda: 'Hetauda',
  Nepalgunj: 'Nepalgunj',
  Dhangadhi: 'Dhangadhi',
  Janakpur: 'Janakpur',
  Birtamod: 'Birtamod',
  Damak: 'Damak',
  Mechinagar: 'Mechinagar',
  Bhadrapur: 'Bhadrapur',
  Siddharthanagar: 'Siddharthanagar (Bhairahawa)',
  Birendranagar: 'Birendranagar',
};

/**
 * Case-insensitive city matching utility supporting aliases
 */
export function isCityMatch(propertyCity?: string, filterCity?: string): boolean {
  if (!filterCity || filterCity === 'All' || filterCity === 'All Nepal' || filterCity === '') {
    return true;
  }
  if (!propertyCity) return false;

  const p = propertyCity.toLowerCase().trim();
  const f = filterCity.toLowerCase().trim();

  if (p === f) return true;
  if (p.includes(f) || f.includes(p)) return true;

  // Handle Siddharthanagar / Bhairahawa alias
  const isSiddharthanagarFilter = f.includes('siddharthanagar') || f.includes('bhairahawa');
  const isSiddharthanagarProp = p.includes('siddharthanagar') || p.includes('bhairahawa');
  if (isSiddharthanagarFilter && isSiddharthanagarProp) {
    return true;
  }

  return false;
}

/**
 * Common district mapping for supported cities
 */
export const CITY_DISTRICT_MAP: Record<NepalCity, string> = {
  Kathmandu: 'Kathmandu',
  Lalitpur: 'Lalitpur',
  Bhaktapur: 'Bhaktapur',
  Pokhara: 'Kaski',
  Bharatpur: 'Chitwan',
  Biratnagar: 'Morang',
  Birgunj: 'Parsa',
  Butwal: 'Rupandehi',
  Dharan: 'Sunsari',
  Itahari: 'Sunsari',
  Hetauda: 'Makwanpur',
  Nepalgunj: 'Banke',
  Dhangadhi: 'Kailali',
  Janakpur: 'Dhanusha',
  Birtamod: 'Jhapa',
  Damak: 'Jhapa',
  Mechinagar: 'Jhapa',
  Bhadrapur: 'Jhapa',
  Siddharthanagar: 'Rupandehi',
  Birendranagar: 'Surkhet',
};

export const NEPAL_DISTRICTS = Array.from(
  new Set(Object.values(CITY_DISTRICT_MAP))
).sort();

export const DISTRICTS_WITH_ALL = ['All', ...NEPAL_DISTRICTS] as const;
