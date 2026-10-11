import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Property, PropertyType, ListingType, PropertyStatus, Subscription, PaymentPurpose } from '../types';
import { dbService } from '../lib/dbService';
import { reverseGeocodeNominatim, searchAddressNominatim } from '../lib/nominatim';
import { StatusBadge } from '../components/StatusBadge';
import { PaymentModal } from '../components/PaymentModal';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Building,
  Eye,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  UploadCloud,
  X,
  Image as ImageIcon,
  Check,
  Search,
  ExternalLink,
  Sparkles,
  Rocket,
  Crown,
  KeyRound,
  AlertCircle,
  RefreshCw,
  MapPin,
  Crosshair,
  Loader2,
} from 'lucide-react';
import { Link } from '../context/RouterContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Monetization & Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [contactsUnlockedCount, setContactsUnlockedCount] = useState<number>(0);
  const [boostModalProperty, setBoostModalProperty] = useState<Property | null>(null);
  const [successFeeProperty, setSuccessFeeProperty] = useState<Property | null>(null);
  const [renewPlanModalOpen, setRenewPlanModalOpen] = useState(false);

  // Generic Payment Modal config
  const [paymentConfig, setPaymentConfig] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    amount: number;
    purpose: PaymentPurpose;
    propertyId?: string;
    metadata?: Record<string, any>;
  }>({
    isOpen: false,
    title: '',
    amount: 0,
    purpose: 'boost_listing',
  });

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('flat');
  const [listingType, setListingType] = useState<ListingType>('rent');
  const [price, setPrice] = useState<number | ''>('');
  const [negotiable, setNegotiable] = useState(true);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kathmandu');
  const [district, setDistrict] = useState('Kathmandu');
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [areaSqft, setAreaSqft] = useState<number>(650);

  // Property Location state (private coordinates saved to property_locations)
  const [capturedLat, setCapturedLat] = useState<number | null>(null);
  const [capturedLng, setCapturedLng] = useState<number | null>(null);
  const [capturedAccuracy, setCapturedAccuracy] = useState<number | null>(null);
  const [landmark, setLandmark] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [addressSearchResults, setAddressSearchResults] = useState<any[]>([]);

  // Uploaded Images state (can be existing URLs or new Files)
  const [imageFiles, setImageFiles] = useState<{ file?: File; previewUrl: string; isPrimary: boolean }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter in dashboard
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [searchOwnQuery, setSearchOwnQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadOwnerProperties();
    }
  }, [user]);

  const loadOwnerProperties = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // If user is owner, fetch their properties
      const [data, sub, unlockCount] = await Promise.all([
        dbService.getProperties({ status: 'all', ownerId: user.id }),
        dbService.getUserSubscription(user.id),
        dbService.getOwnerContactsUnlockedCount(user.id),
      ]);
      setProperties(data);
      setSubscription(sub);
      setContactsUnlockedCount(unlockCount);
    } catch (err) {
      console.error(err);
      showToast('Error loading your properties', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingPropertyId(null);
    setTitle('');
    setDescription('');
    setPropertyType('flat');
    setListingType('rent');
    setPrice('');
    setNegotiable(true);
    setAddress('');
    setCity('Kathmandu');
    setDistrict('Kathmandu');
    setBedrooms(2);
    setBathrooms(1);
    setAreaSqft(650);
    setImageFiles([]);
    setCapturedLat(null);
    setCapturedLng(null);
    setCapturedAccuracy(null);
    setLandmark('');
    setGeoLoading(false);
    setGeoError(null);
    setShowAddressSearch(false);
    setAddressSearchQuery('');
    setAddressSearchResults([]);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prop: Property) => {
    setEditingPropertyId(prop.id);
    setTitle(prop.title);
    setDescription(prop.description);
    setPropertyType(prop.property_type);
    setListingType(prop.listing_type);
    setPrice(prop.price);
    setNegotiable(prop.negotiable);
    setAddress(prop.address);
    setCity(prop.city);
    setDistrict(prop.district);
    setBedrooms(prop.bedrooms);
    setBathrooms(prop.bathrooms);
    setAreaSqft(prop.area_sqft);
    setCapturedLat(null);
    setCapturedLng(null);
    setCapturedAccuracy(null);
    setLandmark('');
    setGeoLoading(false);
    setGeoError(null);
    setShowAddressSearch(false);
    setAddressSearchQuery('');
    setAddressSearchResults([]);

    // Load property location from property_locations table
    dbService.getPropertyLocation(prop.id, user?.id, user?.role).then((loc) => {
      if (loc) {
        setCapturedLat(loc.latitude);
        setCapturedLng(loc.longitude);
        setCapturedAccuracy(loc.accuracy_meters || null);
        setLandmark(loc.landmark || '');
      }
    });

    // Existing images
    if (prop.images && prop.images.length > 0) {
      setImageFiles(
        prop.images.map((img) => ({
          previewUrl: img.image_url,
          isPrimary: Boolean(img.is_primary),
        }))
      );
    } else {
      setImageFiles([]);
    }

    setIsModalOpen(true);
  };

  // High-accuracy GPS geolocation with Nominatim reverse-geocoding
  const handleUseCurrentLocation = () => {
    setGeoLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser. Please search address instead.';
      setGeoError(msg);
      setGeoLoading(false);
      setShowAddressSearch(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        setCapturedLat(lat);
        setCapturedLng(lng);
        setCapturedAccuracy(accuracy);
        setGeoLoading(false);
        showToast(`GPS location captured! Accuracy: ±${accuracy}m`, 'success');

        // Reverse Geocode using Nominatim (with 1-second debounce rate-limiting)
        try {
          const data = await reverseGeocodeNominatim(lat, lng);
          if (data && data.address) {
            const a = data.address;
            const road =
              a.road ||
              a.suburb ||
              a.neighbourhood ||
              a.village ||
              data.display_name?.split(',')[0] ||
              '';
            const matchedCity =
              a.city || a.town || a.municipality || a.county || '';
            const matchedDistrict =
              a.state_district || a.county || matchedCity || '';

            if (road) setAddress(road);
            if (matchedCity) {
              const knownCities = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Butwal'];
              const found = knownCities.find((c) =>
                matchedCity.toLowerCase().includes(c.toLowerCase())
              );
              if (found) setCity(found);
              else setCity(matchedCity);
            }
            if (matchedDistrict) {
              const knownDistricts = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kaski', 'Chitwan'];
              const found = knownDistricts.find((d) =>
                matchedDistrict.toLowerCase().includes(d.toLowerCase())
              );
              if (found) setDistrict(found);
            }
            showToast('Address details auto-filled from GPS', 'info');
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
        }
      },
      (err) => {
        setGeoLoading(false);
        let msg = 'GPS location unavailable. Please search address instead.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow location permissions in your browser or search address below.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or search address below.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS location unavailable. Please search address below.';
        }
        setGeoError(msg);
        setShowAddressSearch(true);
        showToast(msg, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Fallback: Nominatim search for place/address in Nepal (with 1-second debounce rate-limiting)
  const handleSearchAddress = async () => {
    if (!addressSearchQuery.trim()) return;
    setAddressSearchLoading(true);
    try {
      const data = await searchAddressNominatim(addressSearchQuery.trim());
      setAddressSearchResults(data || []);
      if (!data || data.length === 0) {
        showToast('No matching locations found in Nepal. Try a broader search.', 'info');
      }
    } catch (e) {
      console.warn('Search address error:', e);
      showToast('Error searching address', 'error');
    } finally {
      setAddressSearchLoading(false);
    }
  };

  const handleSelectAddressResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setCapturedLat(lat);
    setCapturedLng(lon);
    setCapturedAccuracy(20);
    const parts = item.display_name.split(',');
    setAddress(parts[0] || item.name || addressSearchQuery);
    const knownCities = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Butwal'];
    const matched = knownCities.find((c) =>
      item.display_name.toLowerCase().includes(c.toLowerCase())
    );
    if (matched) setCity(matched);
    setAddressSearchResults([]);
    setGeoError(null);
    showToast(`Coordinates captured for ${parts[0]}`, 'success');
  };

  // Drag and Drop & File Upload handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const validImages = files.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP)', 'error');
      return;
    }

    const newEntries = validImages.map((file, idx) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: imageFiles.length === 0 && idx === 0,
    }));

    setImageFiles((prev) => [...prev, ...newEntries]);
    showToast(`Added ${validImages.length} image(s)`, 'info');
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      if (copy.length > 0 && !copy.some((item) => item.isPrimary)) {
        copy[0].isPrimary = true;
      }
      return copy;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImageFiles((prev) =>
      prev.map((item, i) => ({
        ...item,
        isPrimary: i === index,
      }))
    );
  };

  // Handle Form Submission
  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !address.trim() || !price) {
      showToast('Please fill in Title, Address, and Price.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Gather files or URLs
      const filesToUpload = imageFiles.map((item) => item.file || item.previewUrl);

      if (editingPropertyId) {
        // Update
        const updated = await dbService.updateProperty(
          editingPropertyId,
          {
            title: title.trim(),
            description: description.trim(),
            property_type: propertyType,
            listing_type: listingType,
            price: Number(price),
            negotiable,
            address: address.trim(),
            city: city.trim(),
            district: district.trim(),
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            area_sqft: Number(areaSqft),
          },
          imageFiles.filter((item) => item.file).map((item) => item.file!)
        );

        if (updated) {
          // Save location to property_locations table
          if (capturedLat !== null && capturedLng !== null) {
            await dbService.savePropertyLocation({
              property_id: editingPropertyId,
              latitude: capturedLat,
              longitude: capturedLng,
              accuracy_meters: capturedAccuracy || undefined,
              landmark: landmark.trim() || undefined,
            });
          }
          showToast('Property updated successfully!', 'success');
          setIsModalOpen(false);
          await loadOwnerProperties();
        } else {
          showToast('Failed to update property.', 'error');
        }
      } else {
        // Create
        const created = await dbService.createProperty(
          {
            owner_id: user.id,
            title: title.trim(),
            description: description.trim(),
            property_type: propertyType,
            listing_type: listingType,
            price: Number(price),
            negotiable,
            address: address.trim(),
            city: city.trim(),
            district: district.trim(),
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            area_sqft: Number(areaSqft),
            status: 'available',
          },
          filesToUpload
        );

        if (created) {
          // Save location to property_locations table
          if (capturedLat !== null && capturedLng !== null) {
            await dbService.savePropertyLocation({
              property_id: created.id,
              latitude: capturedLat,
              longitude: capturedLng,
              accuracy_meters: capturedAccuracy || undefined,
              landmark: landmark.trim() || undefined,
            });
          }
          showToast('Property listed successfully with location!', 'success');
          setIsModalOpen(false);
          await loadOwnerProperties();
        } else {
          showToast('Failed to publish property listing.', 'error');
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error saving property', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Property
  const handleDeleteProperty = async (id: string, propTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${propTitle}"?`)) return;

    try {
      const ok = await dbService.deleteProperty(id);
      if (ok) {
        showToast('Property deleted successfully.', 'info');
        setProperties((prev) => prev.filter((p) => p.id !== id));
      } else {
        showToast('Could not delete property.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting property', 'error');
    }
  };

  // Quick Status Change
  const handleStatusChange = async (id: string, newStatus: PropertyStatus) => {
    try {
      const ok = await dbService.updatePropertyStatus(id, newStatus);
      if (ok) {
        showToast(`Status changed to ${newStatus}`, 'success');
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  // Stats
  const totalListings = properties.length;
  const activeListings = properties.filter((p) => p.status === 'available').length;
  const totalViews = properties.reduce((acc, p) => acc + (p.views_count || 120), 0);
  const rentedOrSold = properties.filter((p) => p.status === 'rented' || p.status === 'sold').length;

  const filteredProperties = properties.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchOwnQuery.trim()) {
      const q = searchOwnQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & New Listing Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Owner Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Property Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your rental flats, rooms, houses, photos, and tenant inquiries
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer w-fit"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Property</span>
          </button>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Crown className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {subscription?.plan_name || 'Starter Plan'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {subscription?.expires_at
                  ? `Plan valid until ${new Date(subscription.expires_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })} • Full tenant inquiry and boost features unlocked`
                  : 'Free Starter Plan • Upgrade for unlimited featured listings and priority verified placement'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRenewPlanModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew / Upgrade Plan</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 1. Total Views */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Views
              </span>
              <Eye className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalViews}</div>
            <span className="text-xs text-slate-400 mt-1 block">Property page visits</span>
          </div>

          {/* 2. Contacts Unlocked */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Contacts Unlocked
              </span>
              <KeyRound className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {contactsUnlockedCount}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Paid tenant inquiries</span>
          </div>

          {/* 3. Active Listings */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Listings
              </span>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {activeListings}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Visible to hunters</span>
          </div>

          {/* 4. Days Active */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Days Active
              </span>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {user?.created_at
                ? Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000))
                : 28}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Account seniority</span>
          </div>
        </div>

        {/* Listings Table / Cards */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">Your Properties</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {filteredProperties.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search within own */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={searchOwnQuery}
                  onChange={(e) => setSearchOwnQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
                <option value="pending_approval">Pending Approval</option>
              </select>
            </div>
          </div>

          {/* Table / List */}
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading your properties...</div>
          ) : filteredProperties.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredProperties.map((prop) => {
                const primaryImg =
                  prop.images?.find((img) => img.is_primary)?.image_url ||
                  prop.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={prop.id}
                    className="p-4 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Thumbnail & Title */}
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={primaryImg}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {prop.is_featured && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center gap-1 shadow-2xs">
                              <Sparkles className="w-3 h-3 fill-slate-950" />
                              Boosted
                            </span>
                          )}
                          <StatusBadge status={prop.status} size="sm" />
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {prop.property_type}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {prop.views || prop.views_count || 0} views
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">
                          {prop.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{prop.address}</p>
                        <div className="text-xs font-bold text-emerald-700">
                          रू {prop.price.toLocaleString('en-IN')}{' '}
                          {prop.listing_type === 'rent' ? '/mo' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Actions and Status Dropdown */}
                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      {/* Boost Listing Button */}
                      <button
                        onClick={() => setBoostModalProperty(prop)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Boost this listing with featured badge"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        <span>Boost</span>
                      </button>

                      {/* Mark as Rented/Sold with Success Fee Trigger */}
                      {(prop.status === 'available' || prop.status === 'pending') && (
                        <button
                          onClick={() => setSuccessFeeProperty(prop)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Mark property as rented or sold"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark Rented/Sold</span>
                        </button>
                      )}

                      {/* Quick status selector */}
                      <select
                        value={prop.status}
                        onChange={(e) => handleStatusChange(prop.id, e.target.value as PropertyStatus)}
                        className="text-xs font-medium py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="rented">Rented</option>
                        <option value="sold">Sold</option>
                      </select>

                      {/* View Link */}
                      <Link
                        href={`/property/${prop.id}`}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(prop)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit Property"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteProperty(prop.id, prop.title)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-sm">No Properties Listed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                List your first room, flat, or house now to start getting direct tenant inquiries.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Your First Property
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT PROPERTY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingPropertyId ? 'Edit Property Listing' : 'List New Property'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingPropertyId
                    ? 'Update specs, description, pricing and photos'
                    : 'Fill in details to post your space on Move-In'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProperty} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Property Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunny 2BHK Flat with 24/7 Water & Balcony in Maharajgunj"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Type & Listing Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="room">Room (Single/Double)</option>
                    <option value="flat">Flat / BHK</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House / Bungalow</option>
                    <option value="commercial">Commercial / Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Listing Purpose
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as ListingType)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="rent">For Rent (Monthly)</option>
                    <option value="sale">For Sale (Outright Purchase)</option>
                  </select>
                </div>
              </div>

              {/* Price & Negotiable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Price (NPR रू) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Price is Negotiable upon discussion
                    </span>
                  </label>
                </div>
              </div>

              {/* GPS Location Capture Section */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Property Exact Location (Google Maps)
                    </span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Kept private until hunter unlocks your contact. Enables 1-click Google Maps navigation.
                    </p>
                  </div>

                  {/* Use My Current Location Button */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={geoLoading}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {geoLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Detecting GPS...</span>
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>📍 Use My Current Location</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Captured GPS Details */}
                {capturedLat !== null && capturedLng !== null && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-emerald-300/80 text-xs shadow-2xs">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Captured:</strong> {capturedLat.toFixed(5)}, {capturedLng.toFixed(5)}
                        {capturedAccuracy && (
                          <span className="text-slate-500 ml-1.5">
                            (Accuracy: ±{capturedAccuracy}m)
                          </span>
                        )}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${capturedLat},${capturedLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Preview in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Clear Error Notification */}
                {geoError && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{geoError}</p>
                      <button
                        type="button"
                        onClick={() => setShowAddressSearch(true)}
                        className="text-rose-900 underline font-bold mt-1 inline-block cursor-pointer"
                      >
                        Search address instead →
                      </button>
                    </div>
                  </div>
                )}

                {/* Fallback prompt if not triggered */}
                {!geoError && !showAddressSearch && (capturedLat === null || capturedLng === null) && (
                  <div className="text-[11px] text-emerald-900">
                    <span>GPS not working or adding from another location? </span>
                    <button
                      type="button"
                      onClick={() => setShowAddressSearch(true)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                    >
                      Search address instead
                    </button>
                  </div>
                )}

                {/* Fallback: Nominatim Address Search */}
                {showAddressSearch && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Search address in Nepal (Nominatim OpenStreetMap)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddressSearch(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Baneshwor Chowk, Kathmandu or Lakeside Pokhara"
                        value={addressSearchQuery}
                        onChange={(e) => setAddressSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchAddress();
                          }
                        }}
                        className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSearchAddress}
                        disabled={addressSearchLoading}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        {addressSearchLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Search className="w-3.5 h-3.5" />
                        )}
                        <span>Search</span>
                      </button>
                    </div>
                    {addressSearchResults.length > 0 && (
                      <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto border border-slate-100 rounded-xl">
                        {addressSearchResults.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectAddressResult(item)}
                            className="w-full text-left p-2.5 hover:bg-emerald-50 text-xs text-slate-700 hover:text-emerald-950 transition-colors block cursor-pointer"
                          >
                            📍 {item.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Landmark text input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1">
                    Landmark & Navigation Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Behind Civil Mall, 2nd house with black gate, near Ganesh Temple"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-white border border-emerald-300/80 rounded-xl focus:outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Location: Address, City, District */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Patan Hospital, Lagankhel"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Butwal">Butwal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Kaski">Kaski (Pokhara)</option>
                    <option value="Chitwan">Chitwan</option>
                  </select>
                </div>
              </div>

              {/* Specs: Bedrooms, Bathrooms, Area */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe room condition, water supply (Melamchi/Boring), parking, floor level, solar heater, electricity meter, and nearby transit..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Photo Upload: Drag & Drop + Multiple Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Property Photos (Supabase Storage Drag & Drop)
                </label>

                {/* Dropzone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">
                    Click to browse or drag & drop property photos here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload multiple images (JPG, PNG, WebP). First image or marked image will be primary.
                  </p>
                </div>

                {/* Previews Grid */}
                {imageFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imageFiles.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 ${
                          img.isPrimary ? 'border-emerald-500 shadow-sm' : 'border-slate-200'
                        }`}
                      >
                        <img
                          src={img.previewUrl}
                          alt={`Uploaded preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Primary Badge or Selector */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryImage(idx);
                          }}
                          className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                            img.isPrimary
                              ? 'bg-emerald-600 text-white'
                              : 'bg-black/60 text-white/90 hover:bg-black/80'
                          }`}
                        >
                          {img.isPrimary ? 'Primary' : 'Make Primary'}
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingPropertyId ? 'Save Changes' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. BOOST LISTING MODAL (Rs 199 / 299 / 499) */}
      {boostModalProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Boost Listing</h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{boostModalProperty.title}</p>
                </div>
              </div>
              <button
                onClick={() => setBoostModalProperty(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Get up to 5x more tenant calls! Boosted listings appear first in search with an exclusive gold badge.
            </p>

            <div className="space-y-3 mb-6">
              {/* Option 1: Basic Boost Rs 199 */}
              <div
                onClick={() => {
                  const prop = boostModalProperty;
                  setBoostModalProperty(null);
                  setPaymentConfig({
                    isOpen: true,
                    title: 'Basic Boost Listing (3 Days)',
                    subtitle: `Feature "${prop.title}" at the top of search for 3 days`,
                    amount: 199,
                    purpose: 'boost_listing',
                    propertyId: prop.id,
                    metadata: { plan: 'Basic Boost', days: 3 },
                  });
                }}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-700 flex items-center justify-center font-bold">
                    🚀
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Basic Boost (3 Days)</h4>
                    <p className="text-xs text-slate-500">2x search impressions • Gold badge</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">रू 199</span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Select →</span>
                </div>
              </div>

              {/* Option 2: Pro Boost Rs 299 */}
              <div
                onClick={() => {
                  const prop = boostModalProperty;
                  setBoostModalProperty(null);
                  setPaymentConfig({
                    isOpen: true,
                    title: 'Pro Boost Listing (7 Days)',
                    subtitle: `Top priority placement for "${prop.title}" for 1 week`,
                    amount: 299,
                    purpose: 'boost_listing',
                    propertyId: prop.id,
                    metadata: { plan: 'Pro Boost', days: 7 },
                  });
                }}
                className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-50/40 hover:bg-amber-50 transition-all cursor-pointer flex items-center justify-between relative shadow-xs"
              >
                <span className="absolute -top-2.5 right-4 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    ⭐
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Pro Boost (7 Days)</h4>
                    <p className="text-xs text-slate-500">5x search impressions • Priority sorting</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-amber-700">रू 299</span>
                  <span className="block text-[10px] text-amber-800 font-bold">Select →</span>
                </div>
              </div>

              {/* Option 3: Super Boost Rs 499 */}
              <div
                onClick={() => {
                  const prop = boostModalProperty;
                  setBoostModalProperty(null);
                  setPaymentConfig({
                    isOpen: true,
                    title: 'Super Boost Listing (14 Days)',
                    subtitle: `Maximum visibility across Kathmandu Valley & Pokhara for "${prop.title}"`,
                    amount: 499,
                    purpose: 'boost_listing',
                    propertyId: prop.id,
                    metadata: { plan: 'Super Boost', days: 14 },
                  });
                }}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-700 flex items-center justify-center font-bold">
                    👑
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Super Boost (14 Days)</h4>
                    <p className="text-xs text-slate-500">10x visibility • Homepage spotlight</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">रू 499</span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Select →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUCCESS FEE PROMPT MODAL (Rs 500 room / Rs 1000 flat) */}
      {successFeeProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Congratulations on Renting / Selling!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Property: <strong className="text-slate-800">{successFeeProperty.title}</strong>
              </p>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mb-5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between font-bold text-emerald-900 text-sm">
                <span>Platform Success Contribution</span>
                <span>
                  रू {successFeeProperty.property_type === 'room' ? '500' : '1,000'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Broker agents in Nepal charge <strong>50% to 100%</strong> of the first month's rent (Rs 10,000+).
                Move-In charged you <strong>Rs 0</strong> to list with direct tenant calls.
                Paying this modest success fee helps keep our listings verified and broker-free.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Pay Now Button */}
              <button
                onClick={() => {
                  const prop = successFeeProperty;
                  const fee = prop.property_type === 'room' ? 500 : 1000;
                  setSuccessFeeProperty(null);
                  setPaymentConfig({
                    isOpen: true,
                    title: `Success Fee for ${prop.title}`,
                    subtitle: `Thank you for contributing to Move-In's broker-free community`,
                    amount: fee,
                    purpose: 'success_fee',
                    propertyId: prop.id,
                  });
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  Pay Success Fee via eSewa / Khalti (रू{' '}
                  {successFeeProperty.property_type === 'room' ? '500' : '1,000'})
                </span>
              </button>

              {/* Record Fee as Pending & Mark Status */}
              <button
                onClick={async () => {
                  const prop = successFeeProperty;
                  const fee = prop.property_type === 'room' ? 500 : 1000;
                  setSuccessFeeProperty(null);
                  await handleStatusChange(
                    prop.id,
                    prop.listing_type === 'rent' ? 'rented' : 'sold'
                  );
                  // Record pending payment
                  await dbService.createPayment({
                    user_id: user!.id,
                    property_id: prop.id,
                    amount: fee,
                    purpose: 'success_fee',
                    method: 'esewa',
                    transaction_ref: 'PENDING-SUCCESS-FEE-' + Date.now(),
                  });
                  showToast(
                    'Listing marked as occupied! Success fee registered as pending.',
                    'info'
                  );
                }}
                className="w-full py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-colors"
              >
                Mark as Rented Now (Pay Fee Later)
              </button>

              <button
                onClick={() => setSuccessFeeProperty(null)}
                className="w-full py-1 text-[11px] text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RENEW / UPGRADE PLAN MODAL */}
      {renewPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Owner Membership Plans
                </h3>
              </div>
              <button
                onClick={() => setRenewPlanModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {/* Starter Plan */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Starter Plan</h4>
                  <p className="text-xs text-slate-500">Up to 3 listings • Standard search</p>
                </div>
                <span className="text-xs font-bold text-slate-600">Free / Standard</span>
              </div>

              {/* Pro Landlord Plan */}
              <div
                onClick={() => {
                  setRenewPlanModalOpen(false);
                  setPaymentConfig({
                    isOpen: true,
                    title: 'Pro Landlord Membership (Monthly)',
                    subtitle: 'Unlimited properties, verified host badge, and priority inquiries',
                    amount: 999,
                    purpose: 'owner_subscription',
                    metadata: { plan_name: 'Pro Landlord' },
                  });
                }}
                className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">Pro Landlord (1 Month)</h4>
                  <p className="text-xs text-slate-500">Unlimited listings • 1 free monthly boost</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-800">रू 999/mo</span>
                  <span className="block text-[10px] text-emerald-600 font-bold">Select →</span>
                </div>
              </div>

              {/* Agency Elite */}
              <div
                onClick={() => {
                  setRenewPlanModalOpen(false);
                  setPaymentConfig({
                    isOpen: true,
                    title: 'Agency Elite Membership (Monthly)',
                    subtitle: 'Complete real estate agency suite with dedicated assistance',
                    amount: 2499,
                    purpose: 'owner_subscription',
                    metadata: { plan_name: 'Agency Elite' },
                  });
                }}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Agency Elite (1 Month)</h4>
                  <p className="text-xs text-slate-500">Multi-agent login • Dedicated account manager</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">रू 2,499/mo</span>
                  <span className="block text-[10px] text-purple-600 font-bold">Select →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC PAYMENT MODAL FOR DASHBOARD */}
      <PaymentModal
        isOpen={paymentConfig.isOpen}
        onClose={() => setPaymentConfig((p) => ({ ...p, isOpen: false }))}
        title={paymentConfig.title}
        subtitle={paymentConfig.subtitle}
        amount={paymentConfig.amount}
        purpose={paymentConfig.purpose}
        propertyId={paymentConfig.propertyId}
        metadata={paymentConfig.metadata}
        onSuccess={async () => {
          await loadOwnerProperties();
        }}
      />
    </div>
  );
};
