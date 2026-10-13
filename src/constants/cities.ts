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
