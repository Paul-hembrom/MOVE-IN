import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Property, Profile, PropertyStatus, UserRole, Payment, PaymentStatus, PaymentPurpose, PropertyLocation, HunterPlanTier } from '../types';
import { dbService } from '../lib/dbService';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  Building,
  Users,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  X,
  Trash2,
  ExternalLink,
  UserCheck,
  CreditCard,
  DollarSign,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Wallet,
  Clock,
  Award,
  Eye,
  Image as ImageIcon,
  Crown,
} from 'lucide-react';
import { Link } from '../context/RouterContext';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'properties' | 'payments' | 'success_fees' | 'users'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyLocations, setPropertyLocations] = useState<Record<string, PropertyLocation>>({});
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [successFees, setSuccessFees] = useState<
    Array<{ property: Property; feeAmount: number; status: 'paid' | 'pending'; payment?: Payment }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Property Filters
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<string>('all');
  const [propertySearch, setPropertySearch] = useState<string>('');

  // Payment Filters
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentPurposeFilter, setPaymentPurposeFilter] = useState<string>('all');
  const [paymentSearch, setPaymentSearch] = useState<string>('');

  // User Filters
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState<string>('');
  const [userPendingOnly, setUserPendingOnly] = useState<boolean>(false);
  const [hunterSubscriptions, setHunterSubscriptions] = useState<Record<string, any>>({});
  const [ownerSubscriptions, setOwnerSubscriptions] = useState<Record<string, any>>({});
  const [selectedScreenshotModal, setSelectedScreenshotModal] = useState<Payment | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [allProps, allUsers, allPayments, feeReport, allLocations, allHunterSubs, allOwnerSubs] = await Promise.all([
        dbService.getProperties({ status: 'all' }),
        dbService.getAllProfiles(),
        dbService.getPayments(),
        dbService.getSuccessFeeReport(),
        dbService.getAllPropertyLocations(),
        dbService.getAllHunterSubscriptions(),
        dbService.getAllSubscriptions(),
      ]);
      setProperties(allProps);
      setProfiles(allUsers);
      setPayments(allPayments);
      setSuccessFees(feeReport);
      setPropertyLocations(allLocations);

      const hunterMap: Record<string, any> = {};
      allHunterSubs.forEach((sub) => {
        hunterMap[sub.user_id] = sub;
      });
      setHunterSubscriptions(hunterMap);

      const ownerMap: Record<string, any> = {};
      allOwnerSubs.forEach((sub) => {
        ownerMap[sub.user_id] = sub;
      });
      setOwnerSubscriptions(ownerMap);
    } catch (err) {
      console.error(err);
      showToast('Error loading administrative data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Change property status
  const handleUpdateStatus = async (id: string, status: PropertyStatus) => {
    try {
      const ok = await dbService.updatePropertyStatus(id, status);
      if (ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status } : p))
        );
        showToast(`Property status updated to "${status}"`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (propertyId: string, currentStatus?: boolean) => {
    const nextStatus = !currentStatus;
    try {
      const ok = await dbService.togglePropertyFeatured(propertyId, nextStatus);
      if (ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, is_featured: nextStatus } : p))
        );
        showToast(
          nextStatus ? 'Property marked as Featured ⭐' : 'Featured status removed',
          'success'
        );
      }
    } catch (e) {
      showToast('Failed to toggle featured status', 'error');
    }
  };

  // Quick Approve / Reject for pending listings
  const handleQuickApprove = (id: string) => {
    handleUpdateStatus(id, 'available');
  };

  const handleQuickReject = (id: string) => {
    handleUpdateStatus(id, 'rejected');
  };

  // Delete property
  const handleDeleteProperty = async (id: string, title: string) => {
    if (!window.confirm(`Admin: are you sure you want to delete "${title}"?`)) return;
    try {
      const ok = await dbService.deleteProperty(id);
      if (ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        showToast('Property deleted by admin', 'info');
      }
    } catch (e) {
      showToast('Failed to delete property', 'error');
    }
  };

  // Verify Payment
  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const ok = await dbService.verifyPayment(paymentId);
      if (ok) {
        showToast('Payment verified! Activated corresponding features.', 'success');
        await loadAdminData();
      } else {
        showToast('Failed to verify payment', 'error');
      }
    } catch (e) {
      showToast('Error verifying payment', 'error');
    }
  };

  // Reject Payment
  const handleRejectPayment = async (paymentId: string) => {
    try {
      const ok = await dbService.rejectPayment(paymentId);
      if (ok) {
        showToast('Payment rejected.', 'info');
        await loadAdminData();
      } else {
        showToast('Failed to reject payment', 'error');
      }
    } catch (e) {
      showToast('Error rejecting payment', 'error');
    }
  };

  // Update User Role
  const handleUpdateRole = async (profileId: string, newRole: UserRole) => {
    try {
      const ok = await dbService.updateProfileRole(profileId, newRole);
      if (ok) {
        setProfiles((prev) =>
          prev.map((prof) => (prof.id === profileId ? { ...prof, role: newRole } : prof))
        );
        showToast(`User role updated to "${newRole}"`, 'success');
      } else {
        showToast('Failed to update user role', 'error');
      }
    } catch (e) {
      showToast('Error modifying user role', 'error');
    }
  };

  // Revenue Metrics
  const totalCollected = payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPaymentsList = payments.filter((p) => p.status === 'pending');
  const pendingRevenue = pendingPaymentsList.reduce((sum, p) => sum + p.amount, 0);

  const now = new Date();
  const thisMonthRevenue = payments
    .filter((p) => {
      if (p.status !== 'verified') return false;
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingApprovalsCount = properties.filter(
    (p) => p.status === 'pending_approval' || p.status === 'pending'
  ).length;

  const totalOwedSuccessFees = successFees
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + f.feeAmount, 0);

  // Filtered properties
  const filteredProperties = properties.filter((p) => {
    if (propertyStatusFilter !== 'all' && p.status !== propertyStatusFilter) return false;
    if (propertySearch.trim()) {
      const q = propertySearch.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchOwner = p.owner?.full_name?.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      if (!matchTitle && !matchOwner && !matchCity) return false;
    }
    return true;
  });

  // Filtered payments
  const filteredPayments = payments.filter((pay) => {
    if (paymentStatusFilter !== 'all' && pay.status !== paymentStatusFilter) return false;
    if (paymentPurposeFilter !== 'all' && pay.purpose !== paymentPurposeFilter) return false;
    if (paymentSearch.trim()) {
      const q = paymentSearch.toLowerCase();
      const matchRef = pay.transaction_ref?.toLowerCase().includes(q);
      const matchUser = pay.user?.full_name?.toLowerCase().includes(q) || pay.user?.email?.toLowerCase().includes(q);
      const matchProp = pay.property?.title?.toLowerCase().includes(q);
      const matchNote = pay.note?.toLowerCase().includes(q);
      if (!matchRef && !matchUser && !matchProp && !matchNote) return false;
    }
    return true;
  });

  // Filtered users
  const filteredProfiles = profiles.filter((prof) => {
    if (userRoleFilter !== 'all' && prof.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = prof.full_name?.toLowerCase().includes(q);
      const matchEmail = prof.email?.toLowerCase().includes(q);
      const matchPhone = prof.phone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    if (userPendingOnly) {
      const hasPending = payments.some((p) => p.user_id === prof.id && p.status === 'pending');
      if (!hasPending) return false;
    }
    return true;
  });

  const getPurposeBadge = (purpose: PaymentPurpose) => {
    switch (purpose) {
      case 'contact_unlock':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'hunter_subscription':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'boost_listing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'owner_subscription':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'success_fee':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPurposeLabel = (pay: Payment) => {
    switch (pay.purpose) {
      case 'contact_unlock':
        return 'Contact Unlock (Rs 99)';
      case 'hunter_subscription': {
        const tier = pay.metadata?.plan_tier;
        if (tier === 'premium' || pay.amount >= 999) return 'Hunter Premium (Unlimited)';
        if (tier === 'basic' || pay.amount >= 499) return 'Hunter Basic (10 Contacts)';
        return 'Hunter Membership';
      }
      case 'boost_listing':
        return 'Boost Listing (Rs 449)';
      case 'owner_subscription':
        return pay.metadata?.plan_title || 'Owner Pro (Rs 1,299/mo)';
      case 'success_fee':
        return 'Platform Success Fee';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Move-In Administration & Monetization Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Moderation & Financial Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify eSewa/Khalti transactions, moderate properties, toggle featured listings, and track success fees
            </p>
          </div>
        </div>

        {/* REVENUE SUMMARY METRICS (NEW) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 1. Total Collected */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Collected
              </span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              रू {totalCollected.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Verified platform revenue</span>
          </div>

          {/* 2. Pending Verification */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending Payments
              </span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              रू {pendingRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {pendingPaymentsList.length} transaction(s) to verify
            </span>
          </div>

          {/* 3. This Month Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                This Month Revenue
              </span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              रू {thisMonthRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}
            </span>
          </div>

          {/* 4. Owed Success Fees */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Success Fees Owed
              </span>
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-700">
              रू {totalOwedSuccessFees.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">From rented/sold properties</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-6 sm:gap-8 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'properties'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Manage Properties ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 relative ${
              activeTab === 'payments'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments ({payments.length})</span>
            {pendingPaymentsList.length > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {pendingPaymentsList.length} pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('success_fees')}
            className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'success_fees'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Success Fee Tracker ({successFees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({profiles.length})</span>
          </button>
        </div>

        {/* TAB 1: PROPERTIES MANAGEMENT WITH FEATURED TOGGLE */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filter Toolbar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search title, owner name..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={propertyStatusFilter}
                  onChange={(e) => setPropertyStatusFilter(e.target.value)}
                  className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="all">All Properties</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="sold">Sold</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Properties Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Featured Tier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Views</th>
                    <th className="py-3 px-4 text-right">Actions / Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        Loading properties...
                      </td>
                    </tr>
                  ) : filteredProperties.length > 0 ? (
                    filteredProperties.map((prop) => {
                      const ownerName = prop.owner?.full_name || 'Owner';
                      const ownerEmail = prop.owner?.email || 'N/A';
                      const isPending =
                        prop.status === 'pending_approval' || prop.status === 'pending';

                      return (
                        <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Property Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  prop.images?.[0]?.image_url ||
                                  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=150&q=80'
                                }
                                alt=""
                                className="w-12 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                              />
                              <div>
                                <Link
                                  href={`/property/${prop.id}`}
                                  className="font-bold text-slate-900 hover:text-emerald-700 line-clamp-1 max-w-xs"
                                >
                                  {prop.title}
                                </Link>
                                <span className="text-[10px] text-slate-400">
                                  {prop.city} • {prop.property_type}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Owner */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{ownerName}</div>
                            <div className="text-[10px] text-slate-400">{ownerEmail}</div>
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-4 font-bold text-emerald-700">
                            रू {prop.price.toLocaleString('en-IN')}
                          </td>

                          {/* Location Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {propertyLocations[prop.id] ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-emerald-700">✅ Set</span>
                                  <a
                                    href={`https://www.google.com/maps?q=${propertyLocations[prop.id].latitude},${propertyLocations[prop.id].longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                                    title="View on Google Maps"
                                  >
                                    <span>View</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                                {(propertyLocations[prop.id].updated_at || propertyLocations[prop.id].captured_at) && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Updated {new Date(
                                      propertyLocations[prop.id].updated_at || propertyLocations[prop.id].captured_at
                                    ).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="font-medium text-amber-700">⚠️ Missing</span>
                            )}
                          </td>

                          {/* FEATURED TOGGLE (NEW) */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleFeatured(prop.id, prop.is_featured)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                                prop.is_featured
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs hover:bg-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                              title="Toggle Featured Status on portal"
                            >
                              <Sparkles
                                className={`w-3 h-3 ${
                                  prop.is_featured ? 'fill-amber-600 text-amber-600' : 'text-slate-400'
                                }`}
                              />
                              <span>{prop.is_featured ? 'Featured ⭐' : 'Standard'}</span>
                            </button>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <StatusBadge status={prop.status} size="sm" />
                          </td>

                          {/* Views */}
                          <td className="py-3.5 px-4 text-slate-600 font-semibold">
                            {prop.views || prop.views_count || 0}
                          </td>

                          {/* Moderation Controls */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Quick Approve & Reject Buttons */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleQuickApprove(prop.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                                    title="Approve Listing"
                                  >
                                    <Check className="w-3 h-3" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleQuickReject(prop.id)}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                                    title="Reject Listing"
                                  >
                                    <X className="w-3 h-3" />
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Status Dropdown */}
                              <select
                                value={prop.status}
                                onChange={(e) =>
                                  handleUpdateStatus(prop.id, e.target.value as PropertyStatus)
                                }
                                className="text-[11px] font-semibold py-1 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 focus:outline-none cursor-pointer"
                              >
                                <option value="available">Available</option>
                                <option value="pending_approval">Pending Approval</option>
                                <option value="rented">Rented</option>
                                <option value="sold">Sold</option>
                                <option value="rejected">Rejected</option>
                              </select>

                              {/* View public */}
                              <Link
                                href={`/property/${prop.id}`}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                                title="View Public Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteProperty(prop.id, prop.title)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                                title="Delete Property"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        No properties found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENTS TAB (NEW) */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filter Toolbar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search txn ref, user name, email..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Purpose:</span>
                  <select
                    value={paymentPurposeFilter}
                    onChange={(e) => setPaymentPurposeFilter(e.target.value)}
                    className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="all">All Purposes</option>
                    <option value="contact_unlock">Contact Unlock</option>
                    <option value="boost_listing">Boost Listing</option>
                    <option value="owner_subscription">Owner Subscription</option>
                    <option value="success_fee">Success Fee</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Purpose & Plan</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Wallet & Ref ID</th>
                    <th className="py-3 px-4">Payment Screenshot</th>
                    <th className="py-3 px-4">Property Link</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((pay) => {
                      const userName = pay.user?.full_name || 'User';
                      const userEmail = pay.user?.email || 'N/A';
                      const isPending = pay.status === 'pending';

                      return (
                        <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{userName}</div>
                            <div className="text-[10px] text-slate-400">{userEmail}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-block ${getPurposeBadge(
                                pay.purpose
                              )}`}
                            >
                              {getPurposeLabel(pay)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                            रू {pay.amount.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] uppercase text-white font-extrabold ${
                                    pay.method === 'esewa' ? 'bg-emerald-600' : 'bg-purple-600'
                                  }`}
                                >
                                  {pay.method}
                                </span>
                                <span className="text-slate-800">{pay.transaction_ref}</span>
                              </div>
                              {pay.note && (
                                <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1 rounded border border-slate-100 max-w-xs truncate" title={pay.note}>
                                  "{pay.note}"
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Screenshot Proof */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {pay.screenshot_url ? (
                              <button
                                onClick={() => setSelectedScreenshotModal(pay)}
                                className="group inline-flex items-center gap-2 p-1 pr-2 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 transition-all text-left cursor-pointer"
                                title="Click to view full screenshot"
                              >
                                <img
                                  src={pay.screenshot_url}
                                  alt="Proof thumbnail"
                                  className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                                />
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-emerald-600" /> View Proof
                                  </span>
                                  <span className="text-[9px] text-slate-400">Click to enlarge</span>
                                </div>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No screenshot</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {pay.property ? (
                              <Link
                                href={`/property/${pay.property.id}`}
                                className="font-semibold text-slate-700 hover:text-emerald-700 truncate max-w-[160px] block"
                              >
                                {pay.property.title}
                              </Link>
                            ) : (
                              <span className="text-slate-400">Platform Service</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                pay.status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : pay.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {pay.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(pay.created_at).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleVerifyPayment(pay.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                                  title="Verify and activate feature"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(pay.id)}
                                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                                  title="Reject transaction"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 capitalize">{pay.status}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">
                        No payments found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SUCCESS FEE TRACKER (NEW) */}
        {activeTab === 'success_fees' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Success Fee Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracks owners whose properties were rented or sold through Move-In (Rs 500 room / Rs 1,000 flat)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Owner Name & Phone</th>
                    <th className="py-3 px-4">Occupancy Status</th>
                    <th className="py-3 px-4">Fee Expected</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {successFees.length > 0 ? (
                    successFees.map((item, idx) => {
                      const owner = item.property.owner;
                      return (
                        <tr key={item.property.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <Link href={`/property/${item.property.id}`} className="hover:text-emerald-700">
                              {item.property.title}
                            </Link>
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {item.property.city} • {item.property.property_type}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{owner?.full_name || 'Owner'}</div>
                            <div className="text-[10px] text-slate-400">{owner?.phone || 'No phone'}</div>
                          </td>

                          <td className="py-3.5 px-4 capitalize">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {item.property.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-extrabold text-slate-900">
                            रू {item.feeAmount.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                item.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.status === 'paid' ? 'Paid / Cleared' : 'Fee Pending'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {item.status === 'pending' && (
                              <button
                                onClick={async () => {
                                  if (item.payment) {
                                    await handleVerifyPayment(item.payment.id);
                                  } else {
                                    // Create verified record directly
                                    const created = await dbService.createPayment({
                                      user_id: item.property.owner_id,
                                      property_id: item.property.id,
                                      amount: item.feeAmount,
                                      purpose: 'success_fee',
                                      method: 'esewa',
                                      transaction_ref: 'OFFLINE-VERIFIED-' + Date.now(),
                                    });
                                    await dbService.verifyPayment(created.id);
                                    showToast('Success fee marked as paid!', 'success');
                                    await loadAdminData();
                                  }
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Mark as Paid
                              </button>
                            )}
                            {item.status === 'paid' && (
                              <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        No rented or sold properties recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filter Toolbar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="hunter">Hunter</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-amber-50/70 border border-amber-200 px-3 py-2 rounded-xl cursor-pointer hover:bg-amber-100/60 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={userPendingOnly}
                    onChange={(e) => setUserPendingOnly(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Has Pending Payment ({payments.filter((p) => p.status === 'pending').length})</span>
                </label>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User Profile</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Active Plan / Sub</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map((prof) => {
                      const isSuperAdmin = prof.email.trim().toLowerCase() === 'alphanexora38@gmail.com';
                      const hunterSub = hunterSubscriptions[prof.id];
                      const ownerSub = ownerSubscriptions[prof.id];
                      const userPayments = payments.filter((p) => p.user_id === prof.id);
                      const pendingUserPayments = userPayments.filter((p) => p.status === 'pending');
                      const verifiedUserPayments = userPayments.filter((p) => p.status === 'verified');

                      return (
                        <tr key={prof.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                                {prof.full_name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900">{prof.full_name}</span>
                                  {isSuperAdmin && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-2xs">
                                      <Crown className="w-2.5 h-2.5 fill-current" /> Superadmin
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {prof.id.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-medium">{prof.email}</td>

                          <td className="py-3.5 px-4 text-slate-600">{prof.phone || '—'}</td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                prof.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : prof.role === 'owner'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {prof.role}
                            </span>
                          </td>

                          {/* Current Plan / Subscription */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {prof.role === 'hunter' ? (
                              hunterSub ? (
                                hunterSub.plan_tier === 'premium' ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-max">
                                    <Sparkles className="w-3 h-3 text-amber-600" /> Premium (Unlimited)
                                  </span>
                                ) : hunterSub.plan_tier === 'basic' ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 w-max block">
                                    Basic ({hunterSub.contacts_limit || 10} Contacts)
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 w-max block">
                                    Free (2 Contacts)
                                  </span>
                                )
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 w-max block">
                                  Free (2 Contacts)
                                </span>
                              )
                            ) : prof.role === 'owner' ? (
                              ownerSub && ownerSub.status === 'active' && ownerSub.price > 0 ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 w-max block">
                                  Owner Pro (Active)
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 w-max block">
                                  Starter (Free)
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 font-semibold text-[11px]">System Admin</span>
                            )}
                          </td>

                          {/* Related Payment Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {pendingUserPayments.length > 0 ? (
                              <button
                                onClick={() => {
                                  setActiveTab('payments');
                                  setPaymentSearch(prof.email);
                                }}
                                className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse flex items-center gap-1 hover:bg-amber-200 cursor-pointer"
                                title="Click to view and verify payment"
                              >
                                <span>⚠️ {pendingUserPayments.length} Pending</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : verifiedUserPayments.length > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-max">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Verified ({verifiedUserPayments.length})</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No payments</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {prof.created_at ? new Date(prof.created_at).toLocaleDateString() : 'Active'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <select
                              value={prof.role}
                              onChange={(e) => handleUpdateRole(prof.id, e.target.value as UserRole)}
                              disabled={isSuperAdmin}
                              className={`text-xs font-semibold py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none cursor-pointer ${
                                isSuperAdmin ? 'opacity-60 cursor-not-allowed' : ''
                              }`}
                            >
                              <option value="hunter">Hunter</option>
                              <option value="owner">Owner</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        No user profiles found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCREENSHOT LIGHTBOX / VERIFICATION MODAL */}
        {selectedScreenshotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Payment Proof & Verification
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Ref: {selectedScreenshotModal.transaction_ref} • {selectedScreenshotModal.method.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedScreenshotModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* Image Preview */}
                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-2 flex items-center justify-center relative overflow-hidden group">
                  {selectedScreenshotModal.screenshot_url ? (
                    <img
                      src={selectedScreenshotModal.screenshot_url}
                      alt="Payment proof screenshot"
                      className="max-h-[50vh] w-auto max-w-full rounded-xl object-contain shadow-md"
                    />
                  ) : (
                    <div className="py-20 text-slate-400 text-xs">No screenshot image recorded.</div>
                  )}
                  {selectedScreenshotModal.screenshot_url && (
                    <a
                      href={selectedScreenshotModal.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-slate-900/80 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-900 transition-colors backdrop-blur-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Full Image
                    </a>
                  )}
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount</span>
                    <span className="text-emerald-700 font-extrabold text-base">
                      रू {selectedScreenshotModal.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Purpose</span>
                    <span className="text-slate-800 font-bold">
                      {getPurposeLabel(selectedScreenshotModal)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">User</span>
                    <span className="text-slate-800 font-bold truncate block">
                      {selectedScreenshotModal.user?.full_name || 'User'}
                    </span>
                    <span className="text-slate-400 text-[10px] truncate block">
                      {selectedScreenshotModal.user?.email || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase mt-0.5 ${
                        selectedScreenshotModal.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedScreenshotModal.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedScreenshotModal.status}
                    </span>
                  </div>
                </div>

                {/* Optional Note */}
                {selectedScreenshotModal.note && (
                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold block text-[10px] uppercase text-amber-700 mb-0.5">User Note:</span>
                    "{selectedScreenshotModal.note}"
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedScreenshotModal(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>

                {selectedScreenshotModal.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectPayment(selectedScreenshotModal.id)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Reject Payment
                    </button>
                    <button
                      onClick={() => handleVerifyPayment(selectedScreenshotModal.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Verify & Activate
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
