export type UserRole = 'hunter' | 'owner' | 'admin';

export type PropertyStatus =
  | 'available'
  | 'pending'
  | 'sold'
  | 'rented'
  | 'pending_approval'
  | 'rejected';

export type PropertyType = 'room' | 'flat' | 'apartment' | 'house' | 'commercial';

export type ListingType = 'rent' | 'sale';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary?: boolean;
  created_at?: string;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  negotiable: boolean;
  address: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  status: PropertyStatus;
  is_featured?: boolean;
  views?: number;
  views_count?: number;
  created_at: string;
  expires_at?: string; // Listing expiry date
  // Verification Badges (Housing.com style)
  is_self_verified?: boolean;
  self_verified_at?: string;
  self_verification_photo?: string;
  is_platform_verified?: boolean;
  platform_verified_at?: string;
  amenities?: string[];
  images?: PropertyImage[];
  owner?: Profile;
}

export type PaymentPurpose =
  | 'contact_unlock'
  | 'boost_listing'
  | 'owner_subscription'
  | 'hunter_subscription'
  | 'success_fee';

export type PaymentMethod = 'esewa' | 'khalti';

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface Payment {
  id: string;
  user_id: string;
  property_id?: string;
  amount: number;
  purpose: PaymentPurpose;
  method: PaymentMethod;
  transaction_ref: string;
  status: PaymentStatus;
  created_at: string;
  verified_at?: string;
  metadata?: Record<string, any>;
  user?: Profile;
  property?: Property;
}

export interface ContactUnlock {
  id: string;
  user_id: string;
  property_id: string;
  payment_id?: string;
  is_free_quota?: boolean;
  expires_at: string; // 7 days from verification
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string; // 'Starter' | 'Pro Landlord' | 'Agency Elite'
  price: number;
  payment_id?: string;
  status: 'active' | 'expired' | 'pending';
  starts_at: string;
  expires_at: string;
  created_at: string;
}

// Hunter Subscriptions (Housing.com plans)
export type HunterPlanTier = 'free' | 'basic' | 'premium' | 'assisted';

export interface HunterSubscription {
  id: string;
  user_id: string;
  plan_tier: HunterPlanTier;
  plan_name: string;
  contacts_limit: number; // Free: 2, Basic: 10, Premium: 25, Assisted: unlimited (999999)
  contacts_used: number;
  price: number;
  payment_id?: string;
  status: 'active' | 'expired';
  starts_at: string;
  expires_at: string;
  created_at: string;
  priority_support?: boolean;
  whatsapp_assisted?: boolean;
  user?: Profile;
}

// In-App Chat System Types
export interface Conversation {
  id: string;
  property_id: string;
  hunter_id: string;
  owner_id: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  property?: Property;
  hunter?: Profile;
  owner?: Profile;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: UserRole;
  message: string;
  created_at: string;
  read?: boolean;
}

// Leads tracking
export interface OwnerLead {
  id: string;
  property_id: string;
  owner_id: string;
  hunter_id: string;
  action: 'viewed' | 'unlocked' | 'chatted';
  created_at: string;
  property?: Property;
  hunter?: Profile;
}

export interface PropertyFilterState {
  city: string;
  district: string;
  property_type: string;
  listing_type: string;
  minPrice: number | '';
  maxPrice: number | '';
  bedrooms: string;
  searchQuery: string;
  sortBy: 'featured' | 'newest' | 'price_asc' | 'price_desc';
}
