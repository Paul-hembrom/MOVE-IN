import React, { useEffect, useState } from 'react';
import { Property } from '../types';
import { dbService } from '../lib/dbService';
import { PropertyCard } from '../components/PropertyCard';
import { useRouter, Link } from '../context/RouterContext';
import {
  Search,
  MapPin,
  Home,
  CheckCircle2,
  Users,
  Building,
  Key,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Bar state
  const [searchLocation, setSearchLocation] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    setLoading(true);
    try {
      const data = await dbService.getProperties({ status: 'available', limit: 6 });
      setFeaturedProperties(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.append('city', searchLocation);
    if (propertyType !== 'all') params.append('type', propertyType);

    if (priceRange === 'under15k') {
      params.append('maxPrice', '15000');
    } else if (priceRange === '15k-30k') {
      params.append('minPrice', '15000');
      params.append('maxPrice', '30000');
    } else if (priceRange === '30k-50k') {
      params.append('minPrice', '30000');
      params.append('maxPrice', '50000');
    } else if (priceRange === 'above50k') {
      params.append('minPrice', '50000');
    }

    navigate(`/propertyview?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle geometric background aura */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Nepal's Most Trusted Room & Flat Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Find Your Next <span className="text-emerald-400">Room</span>,{' '}
            <span className="text-teal-300">Flat</span> or{' '}
            <span className="text-cyan-400">Home</span> in Nepal
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Zero broker fees. Verified listings in Kathmandu, Lalitpur, Bhaktapur, and Pokhara.
            Connect directly with verified owners with one click.
          </p>

          {/* Search Bar Component */}
          <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/20 text-slate-900 max-w-4xl mx-auto">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Location */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-left w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Location / City
                  </label>
                  <select
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Nepal Cities</option>
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Chitwan">Chitwan</option>
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Home className="w-5 h-5 text-teal-600 shrink-0" />
                <div className="text-left w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Any Type</option>
                    <option value="room">Single / Double Room</option>
                    <option value="flat">Flat / Apartment</option>
                    <option value="house">Independent House</option>
                    <option value="commercial">Commercial / Shutter</option>
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-cyan-600 shrink-0" />
                <div className="text-left w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Budget (NPR)
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Any Price</option>
                    <option value="under15k">Under रू 15,000</option>
                    <option value="15k-30k">रू 15,000 - 30,000</option>
                    <option value="30k-50k">रू 30,000 - 50,000</option>
                    <option value="above50k">Above रू 50,000</option>
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Find Properties</span>
              </button>
            </form>
          </div>

          {/* Quick search pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400">Popular Searches:</span>
            {['Rooms in Kathmandu', '2BHK in Lalitpur', 'Flats in Bhaktapur', 'Lakeside Pokhara'].map(
              (query) => (
                <button
                  key={query}
                  onClick={() => {
                    const city = query.split(' ')[2] || 'Kathmandu';
                    navigate(`/propertyview?city=${city}`);
                  }}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors"
                >
                  {query}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS GRID */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <Building className="w-3.5 h-3.5" />
              <span>Verified Direct Listings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Available Properties
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Freshly listed spaces across the valley with real photos and exact pricing
            </p>
          </div>

          <Link
            href="/propertyview"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors w-fit"
          >
            <span>Explore All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-slate-100 rounded-2xl h-80 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-600 font-medium">No available properties found right now.</p>
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
              Simple & Transparent
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4">
              How SajiloKotha Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A hassle-free real estate experience built specifically for renters, buyers, and property owners in Nepal.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* For Hunters (3 Steps) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">For Room & Flat Hunters</h3>
                  <p className="text-xs text-slate-500">Rent or buy without third-party commission</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Search & Filter Verified Spaces</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Filter by city (Kathmandu, Lalitpur, etc.), budget, room count, and amenities like 24/7 water and parking.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Inspect Real Photos & Specs</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Review authentic high-resolution images, transparent pricing, negotiable tags, and detailed descriptions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Directly Contact the Owner</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Click "Contact Owner" to get the phone number directly. Call or WhatsApp the owner right away with zero broker charges!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href="/propertyview"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  Start Hunting Rooms
                </Link>
              </div>
            </div>

            {/* For Owners (3 Steps) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">For Property Owners</h3>
                  <p className="text-xs text-slate-500">Find reliable tenants quickly and stress-free</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Create Free Owner Account</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Sign up in seconds as an Owner. Keep your phone number handy so interested tenants can reach you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">List Property & Upload Photos</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Use our drag-and-drop multiple photo uploader. Set price, address, amenities, and negotiable status in your dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Receive Direct Tenant Calls</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Screen potential tenants yourself, schedule room visits at your convenience, and mark listings as "Rented" once occupied!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  List Your Property For Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION BANNERS */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Zero Brokerage Charges</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Why pay 50% of your first month's rent to local middle-men? On SajiloKotha, tenants contact house owners directly for free.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Admin Reviewed & Verified</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our admin panel oversees listings to minimize fake posts, exaggerated pricing, and misleading photos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Tailored for Nepal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Designed with Nepal-specific housing needs: water availability (Melamchi/Boring), solar backup, bike/car parking, and sub-meters.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
