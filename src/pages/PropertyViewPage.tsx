import React, { useState, useEffect, useMemo } from 'react';
import { Property, PropertyFilterState, HunterSubscription, HunterPlanTier } from '../types';
import { dbService } from '../lib/dbService';
import { PropertyCard } from '../components/PropertyCard';
import { HunterPlanModal } from '../components/HunterPlanModal';
import { PaymentModal } from '../components/PaymentModal';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Building2,
  ChevronDown,
  X,
  Map as MapIcon,
  LayoutGrid,
  Columns2,
  Crown,
  ShieldCheck,
  Award,
  Zap,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { CITIES_WITH_ALL, DISTRICTS_WITH_ALL } from '../constants/cities';

const PROPERTY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'room', label: 'Room (Single/Double)' },
  { value: 'flat', label: 'Flat (1/2/3 BHK)' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House / Bungalow' },
  { value: 'commercial', label: 'Commercial Space' },
];

export const PropertyViewPage: React.FC = () => {
  const { searchParams } = useRouter();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Hunter quota & subscription state
  const [hunterSub, setHunterSub] = useState<HunterSubscription | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planPaymentConfig, setPlanPaymentConfig] = useState<{
    isOpen: boolean;
    title: string;
    amount: number;
    metadata: Record<string, any>;
  }>({
    isOpen: false,
    title: '',
    amount: 0,
    metadata: {},
  });

  // Filter for verified properties
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Initialize filters from searchParams or defaults
  const [filters, setFilters] = useState<PropertyFilterState>(() => ({
    city: searchParams.get('city') || 'All',
    district: searchParams.get('district') || 'All',
    property_type: searchParams.get('type') || 'all',
    listing_type: searchParams.get('listing_type') || 'all',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '',
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '',
    bedrooms: searchParams.get('bedrooms') || 'all',
    searchQuery: searchParams.get('q') || '',
    sortBy: 'featured',
  }));

  useEffect(() => {
    fetchProperties();
  }, []);

  // Update filters if searchParams change
  useEffect(() => {
    const urlCity = searchParams.get('city');
    const urlType = searchParams.get('type');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');

    if (urlCity || urlType || urlMinPrice || urlMaxPrice) {
      setFilters((prev) => ({
        ...prev,
        city: urlCity || prev.city,
        property_type: urlType || prev.property_type,
        minPrice: urlMinPrice ? Number(urlMinPrice) : prev.minPrice,
        maxPrice: urlMaxPrice ? Number(urlMaxPrice) : prev.maxPrice,
      }));
    }
  }, [searchParams]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await dbService.getProperties({ status: 'available' });
      setProperties(data);

      if (user) {
        const sub = await dbService.getHunterSubscription(user.id);
        setHunterSub(sub);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      dbService.getHunterSubscription(user.id).then(setHunterSub);
    }
  }, [user]);

  const handleResetFilters = () => {
    setFilters({
      city: 'All',
      district: 'All',
      property_type: 'all',
      listing_type: 'all',
      minPrice: '',
      maxPrice: '',
      bedrooms: 'all',
      searchQuery: '',
      sortBy: 'newest',
    });
  };

  // Filter & Sort Logic
  const filteredProperties = useMemo(() => {
    return properties
      .filter((item) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchAddress = item.address.toLowerCase().includes(q);
          const matchCity = item.city.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          if (!matchTitle && !matchAddress && !matchCity && !matchDesc) return false;
        }

        // City
        if (filters.city !== 'All' && item.city.toLowerCase() !== filters.city.toLowerCase()) {
          return false;
        }

        // District
        if (filters.district !== 'All' && item.district.toLowerCase() !== filters.district.toLowerCase()) {
          return false;
        }

        // Property Type
        if (filters.property_type !== 'all' && item.property_type !== filters.property_type) {
          return false;
        }

        // Listing Type
        if (filters.listing_type !== 'all' && item.listing_type !== filters.listing_type) {
          return false;
        }

        // Bedrooms
        if (filters.bedrooms !== 'all') {
          const reqBeds = Number(filters.bedrooms);
          if (item.bedrooms < reqBeds) return false;
        }

        // Min Price
        if (filters.minPrice !== '' && item.price < Number(filters.minPrice)) {
          return false;
        }

        // Max Price
        if (filters.maxPrice !== '' && item.price > Number(filters.maxPrice)) {
          return false;
        }

        // Verified properties filter (Housing.com feature)
        if (verifiedOnly && !item.is_platform_verified && !item.is_self_verified) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'featured') {
          const aFeat = a.is_featured ? 1 : 0;
          const bFeat = b.is_featured ? 1 : 0;
          if (aFeat !== bFeat) return bFeat - aFeat;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (filters.sortBy === 'price_asc') return a.price - b.price;
        if (filters.sortBy === 'price_desc') return b.price - a.price;
        // Default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [properties, filters]);

  const activeFiltersCount = [
    filters.city !== 'All',
    filters.district !== 'All',
    filters.property_type !== 'all',
    filters.listing_type !== 'all',
    filters.minPrice !== '',
    filters.maxPrice !== '',
    filters.bedrooms !== 'all',
    Boolean(filters.searchQuery),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Quick Search Bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Properties & Rooms
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse verified rooms, apartments, and houses across Nepal with geographic map locations
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, location (e.g. Maharajgunj, Patan)..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((p) => ({ ...p, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((p) => ({ ...p, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Hunter Contacts Quota Banner (Housing.com feature) */}
        {user?.role === 'hunter' && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white shadow-md border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-sm text-white">
                    {hunterSub?.plan_name || 'Free Hunter Tier'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      (hunterSub?.contacts_limit || 2) - (hunterSub?.contacts_used || 0) > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                    }`}
                  >
                    {Math.max(0, (hunterSub?.contacts_limit || 2) - (hunterSub?.contacts_used || 0))} Contacts Remaining
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {(hunterSub?.contacts_limit || 2) - (hunterSub?.contacts_used || 0) > 0
                    ? `Use your quota to unlock landlord phone numbers and direct in-app chat with zero brokerage.`
                    : `You have used all free contacts. Upgrade your plan to continue contacting landlords directly.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setPlanModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>
                {(hunterSub?.contacts_limit || 2) - (hunterSub?.contacts_used || 0) > 0
                  ? 'Upgrade Plan'
                  : 'Get Contacts (from Rs 199)'}
              </span>
            </button>
          </div>
        )}

        {/* City Filter Pills & View Mode Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          {/* City Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap mr-1">
              Cities:
            </span>
            {CITIES_WITH_ALL.map((city) => (
              <button
                key={city}
                onClick={() => setFilters((p) => ({ ...p, city }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  filters.city === city
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {city === 'All' ? 'All Cities' : city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Content (Cards & Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP FILTERS SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Refine Search</h3>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Verified Listings Only toggle (Housing.com feature) */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-extrabold text-slate-900">Verified Only</span>
              </div>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
            <p className="text-[10px] text-slate-500 mt-1 pl-6">
              Show only platform & self-verified properties
            </p>
          </div>

          {/* Listing Type (Rent vs Sale) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Listing Purpose
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['all', 'rent', 'sale'].map((lt) => (
                <button
                  key={lt}
                  onClick={() => setFilters((p) => ({ ...p, listing_type: lt }))}
                  className={`py-1.5 rounded-lg capitalize transition-colors ${
                    filters.listing_type === lt
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {lt === 'all' ? 'All' : lt === 'rent' ? 'Rent' : 'Buy'}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Property Type
            </label>
            <select
              value={filters.property_type}
              onChange={(e) => setFilters((p) => ({ ...p, property_type: e.target.value }))}
              className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
              className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {CITIES_WITH_ALL.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Cities' : c}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              District
            </label>
            <select
              value={filters.district}
              onChange={(e) => setFilters((p) => ({ ...p, district: e.target.value }))}
              className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {DISTRICTS_WITH_ALL.map((dist) => (
                <option key={dist} value={dist}>
                  {dist === 'All' ? 'All Districts' : dist}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Bedrooms
            </label>
            <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold">
              {['all', '1', '2', '3', '4'].map((b) => (
                <button
                  key={b}
                  onClick={() => setFilters((p) => ({ ...p, bedrooms: b }))}
                  className={`py-2 rounded-xl border text-center transition-colors ${
                    filters.bedrooms === b
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {b === 'all' ? 'Any' : `${b}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Price Range (NPR)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-700 block mb-1">Min (रू)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      minPrice: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-700 block mb-1">Max (रू)</span>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      maxPrice: e.target.value ? Number(e.target.value) : '',
                    }))
                  }
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden col-span-1 flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filters ({activeFiltersCount})</span>
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-emerald-600 font-semibold"
            >
              Reset
            </button>
          )}
        </div>

        {/* Mobile Filters Modal */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 p-4 flex items-end sm:items-center justify-center">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto space-y-5 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Filter Properties</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {CITIES_WITH_ALL.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Cities' : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">District</label>
                <select
                  value={filters.district}
                  onChange={(e) => setFilters((p) => ({ ...p, district: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {DISTRICTS_WITH_ALL.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Districts' : d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Property Type</label>
                <select
                  value={filters.property_type}
                  onChange={(e) => setFilters((p) => ({ ...p, property_type: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>

              {/* Listing Purpose */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Listing Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'rent', 'sale'].map((lt) => (
                    <button
                      key={lt}
                      onClick={() => setFilters((p) => ({ ...p, listing_type: lt }))}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize border ${
                        filters.listing_type === lt
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {lt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl text-sm"
                >
                  Apply Filters ({filteredProperties.length} results)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              Showing <span className="font-bold text-slate-900">{filteredProperties.length}</span> verified properties
            </span>

            {/* Sort by */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      sortBy: e.target.value as 'featured' | 'newest' | 'price_asc' | 'price_desc',
                    }))
                  }
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 py-1.5 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured First ⭐</option>
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* PROPERTIES GRID VIEW (Clean, fast, no embedded map for hunters) */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl h-84 animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Matching Properties Found</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
                  Try widening your price range, clearing specific filters, or searching in a different city.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
