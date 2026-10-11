import React, { useState, useEffect } from 'react';
import { Property, HunterSubscription, HunterPlanTier } from '../types';
import { dbService } from '../lib/dbService';
import { useRouter, Link } from '../context/RouterContext';
import { ImageGallery } from '../components/ImageGallery';
import { StatusBadge } from '../components/StatusBadge';
import { VerificationBadge } from '../components/VerificationBadge';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyMap } from '../components/PropertyMap';
import { PaymentModal } from '../components/PaymentModal';
import { ChatModal } from '../components/ChatModal';
import { HunterPlanModal } from '../components/HunterPlanModal';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Tag,
  Building,
  Lock,
  Unlock,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const PropertyDetailPage: React.FC = () => {
  const { propertyId, navigate } = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Contact Unlock & Chat State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [hunterPlanModalOpen, setHunterPlanModalOpen] = useState(false);
  const [hunterSub, setHunterSub] = useState<HunterSubscription | null>(null);
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

  useEffect(() => {
    if (propertyId) {
      loadDetails(propertyId);
    }
  }, [propertyId, user]);

  const loadDetails = async (id: string) => {
    setLoading(true);
    try {
      // Increment views
      await dbService.incrementPropertyViews(id);

      const data = await dbService.getPropertyById(id);
      setProperty(data);

      if (user) {
        // Load hunter subscription if user is hunter
        const sub = await dbService.getHunterSubscription(user.id);
        setHunterSub(sub);

        // Check unlock permission
        if (user.role === 'admin' || (data && user.id === data.owner_id)) {
          setIsUnlocked(true);
          setDaysRemaining(30);
        } else if (data) {
          const unlockInfo = await dbService.checkContactUnlocked(user.id, data.id);
          setIsUnlocked(unlockInfo.unlocked);
          setDaysRemaining(unlockInfo.daysRemaining || null);
        }
      } else {
        setIsUnlocked(false);
        setDaysRemaining(null);
      }

      if (data) {
        // Load related properties in the same city
        const all = await dbService.getProperties({ status: 'available' });
        const related = all
          .filter((p) => p.id !== data.id && (p.city === data.city || p.property_type === data.property_type))
          .slice(0, 3);
        setRelatedProperties(related);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockWithQuota = async () => {
    if (!user) {
      showToast('Please log in to unlock landlord contact.', 'info');
      navigate('/login');
      return;
    }
    if (!property) return;

    try {
      const res = await dbService.unlockContactWithQuota(user.id, property.id);
      if (res.success) {
        setIsUnlocked(true);
        setDaysRemaining(7);
        // Refresh hunter subscription quota
        const updatedSub = await dbService.getHunterSubscription(user.id);
        setHunterSub(updatedSub);
        showToast('Contact unlocked using plan quota! Valid for 7 days.', 'success');
      } else {
        showToast(res.error || 'Quota exhausted. Please upgrade your plan.', 'error');
        setHunterPlanModalOpen(true);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to unlock contact', 'error');
    }
  };

  const handleSelectHunterPlan = (plan: {
    tier: HunterPlanTier;
    name: string;
    price: number;
    contacts: number;
  }) => {
    setHunterPlanModalOpen(false);
    setPlanPaymentConfig({
      isOpen: true,
      title: `${plan.name} Membership`,
      amount: plan.price,
      metadata: { plan_tier: plan.tier, contacts: plan.contacts },
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Listing link copied to clipboard!', 'success');
    }
  };

  const formatPrice = (val: number, listingType: string) => {
    if (val >= 10000000) {
      return `रू ${(val / 10000000).toFixed(2)} Crore`;
    }
    if (val >= 100000) {
      return `रू ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `रू ${val.toLocaleString('en-IN')}${listingType === 'rent' ? ' / month' : ''}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Property Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          This listing may have been rented or removed by the owner.
        </p>
        <Link
          href="/propertyview"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>
      </div>
    );
  }

  const ownerName = property.owner?.full_name || 'Verified Property Owner';
  const ownerPhone = property.owner?.phone || '+977-9841234567';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/propertyview"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Listings</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Share Listing</span>
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (Images + Specs + Description) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
              <ImageGallery images={property.images} title={property.title} />
            </div>

            {/* Quick Overview Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <VerificationBadge
                  isPlatformVerified={property.is_platform_verified}
                  isSelfVerified={property.is_self_verified}
                  size="md"
                />
                <StatusBadge status={property.status} />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-white">
                  {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {property.property_type}
                </span>
                {property.negotiable && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Negotiable Price
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 mb-3 leading-snug">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {property.address}, {property.city}, {property.district} District
                </span>
              </div>

              {/* Key Specs Matrix */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-5 border-y border-slate-100">
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <Bed className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bedrooms</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {property.bedrooms > 0 ? property.bedrooms : 'Studio / None'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <Bath className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bathrooms</span>
                  <span className="text-sm font-extrabold text-slate-800">{property.bathrooms}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <Maximize2 className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Area</span>
                  <span className="text-sm font-extrabold text-slate-800">{property.area_sqft} sqft</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl text-center col-span-3 sm:col-span-1">
                  <Calendar className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Listed</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {new Date(property.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  About This Space
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Amenities & Features
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {property.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Geographic Location Map */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Location & Neighborhood
                    </h3>
                    <p className="text-xs text-slate-500">
                      {property.address}, {property.city}, {property.district}
                    </p>
                  </div>
                </div>
                <PropertyMap
                  properties={[property]}
                  selectedPropertyId={property.id}
                  height="340px"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Sticky Sidebar: Price & Owner Contact Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-md sticky top-24">
              {/* Price display */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Listing Price
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight mt-1">
                  {formatPrice(property.price, property.listing_type)}
                </div>
                {property.negotiable && (
                  <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                    ✓ Price negotiable upon room visit
                  </span>
                )}
              </div>

              {/* Owner info */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden">
                    {property.owner?.avatar_url ? (
                      <img
                        src={property.owner.avatar_url}
                        alt={ownerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      ownerName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{ownerName}</h4>
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Property Owner
                    </span>
                  </div>
                </div>

                {/* Contact Owner / Unlock Section */}
                {isUnlocked ? (
                  <div className="space-y-3 bg-emerald-50/80 p-4 rounded-2xl border border-emerald-300 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Contact Unlocked
                      </span>
                      {daysRemaining && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800">
                          {daysRemaining} days remaining
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 tracking-wider font-mono">
                      {ownerPhone}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`tel:${ownerPhone}`}
                        className="py-2.5 px-3 bg-emerald-600 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call Now
                      </a>
                      <a
                        href={`https://wa.me/${ownerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 bg-teal-600 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 hover:bg-teal-700 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    </div>

                    {/* Chat with Owner (Housing.com feature) */}
                    <button
                      onClick={() => setChatModalOpen(true)}
                      className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Chat with Owner (Live)</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {/* Blurred phone number preview */}
                    <div className="relative py-3 px-4 bg-white rounded-xl border border-dashed border-slate-300 text-center overflow-hidden">
                      <div className="text-lg font-bold text-slate-400 select-none filter blur-xs">
                        +977 9841 ••• •••
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/5 backdrop-blur-[2px]">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-800 bg-white/95 px-2.5 py-1 rounded-full shadow-xs border border-slate-200">
                          <Lock className="w-3 h-3 text-amber-500" />
                          Phone & Chat Locked
                        </span>
                      </div>
                    </div>

                    {/* If Hunter has quota remaining */}
                    {hunterSub && hunterSub.contacts_limit - hunterSub.contacts_used > 0 ? (
                      <div className="space-y-2">
                        <button
                          onClick={handleUnlockWithQuota}
                          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                          <span>
                            Unlock Free ({hunterSub.contacts_limit - hunterSub.contacts_used} Left in {hunterSub.plan_name})
                          </span>
                        </button>
                        <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                          <span>Uses 1 of your {hunterSub.contacts_limit} plan contacts</span>
                          <button
                            onClick={() => setHunterPlanModalOpen(true)}
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            View Plans
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Unlock Button or Upgrade Plan */
                      <div className="space-y-2">
                        <button
                          onClick={() => setUnlockModalOpen(true)}
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                          <span>Unlock Contact — Rs 99</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => setHunterPlanModalOpen(true)}
                            className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold rounded-xl text-center transition-colors cursor-pointer"
                          >
                            Plans from Rs 199
                          </button>
                          <button
                            onClick={() => {
                              showToast('Please unlock contact first to message owner.', 'info');
                              setUnlockModalOpen(true);
                            }}
                            className="py-2 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-xl text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>Chat with Owner</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
                      <span>✓ 7 Days Access</span>
                      <span>•</span>
                      <span>In-App Chat Unlocked</span>
                      <span>•</span>
                      <span>Zero Brokerage</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Safety Tips for Room Hunters */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Renter Safety Guidelines
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                  <li>Never transfer advance token money without inspecting the room in person.</li>
                  <li>Confirm drinking water supply and electricity sub-meter readings before signing.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Similar Properties in {property.city}</h3>
                <p className="text-xs text-slate-500 mt-1">Other available rooms and flats you might like</p>
              </div>
              <Link
                href={`/propertyview?city=${property.city}`}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                View all in {property.city} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}

        {/* Contact Unlock Payment Modal */}
        <PaymentModal
          isOpen={unlockModalOpen}
          onClose={() => setUnlockModalOpen(false)}
          title="Unlock Direct Owner Contact"
          subtitle={`Get direct phone and WhatsApp access to ${ownerName} for this property.`}
          amount={99}
          purpose="contact_unlock"
          propertyId={property.id}
          onSuccess={() => {
            setIsUnlocked(true);
            setDaysRemaining(7);
          }}
        />

        {/* Hunter Plan Upgrade Payment Modal */}
        <PaymentModal
          isOpen={planPaymentConfig.isOpen}
          onClose={() => setPlanPaymentConfig((p) => ({ ...p, isOpen: false }))}
          title={planPaymentConfig.title}
          subtitle="Upgrade your hunter membership for discounted contact unlocks and priority landlord responses."
          amount={planPaymentConfig.amount}
          purpose="hunter_subscription"
          metadata={planPaymentConfig.metadata}
          onSuccess={async () => {
            if (user) {
              const updated = await dbService.getHunterSubscription(user.id);
              setHunterSub(updated);
            }
          }}
        />

        {/* In-App Live Chat Modal (Housing.com feature) */}
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          property={property}
          recipient={property.owner}
        />

        {/* Hunter Subscription Plans Modal */}
        <HunterPlanModal
          isOpen={hunterPlanModalOpen}
          onClose={() => setHunterPlanModalOpen(false)}
          currentSubscription={hunterSub}
          onSelectPlan={handleSelectHunterPlan}
        />
      </div>
    </div>
  );
};
