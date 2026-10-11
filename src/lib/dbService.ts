import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import {
  INITIAL_PROFILES,
  INITIAL_PROPERTIES,
  INITIAL_PAYMENTS,
  INITIAL_CONTACT_UNLOCKS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_HUNTER_SUBSCRIPTIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_LEADS,
} from './mockData';
import {
  Profile,
  Property,
  PropertyImage,
  PropertyStatus,
  UserRole,
  Payment,
  ContactUnlock,
  Subscription,
  HunterSubscription,
  HunterPlanTier,
  Conversation,
  ChatMessage,
  OwnerLead,
} from '../types';

const STORAGE_PROPS_KEY = 'movein_local_properties';
const STORAGE_PROFILES_KEY = 'movein_local_profiles';
const STORAGE_PAYMENTS_KEY = 'movein_local_payments';
const STORAGE_UNLOCKS_KEY = 'movein_local_contact_unlocks';
const STORAGE_SUBSCRIPTIONS_KEY = 'movein_local_subscriptions';
const STORAGE_HUNTER_SUBS_KEY = 'movein_local_hunter_subscriptions';
const STORAGE_CONVERSATIONS_KEY = 'movein_local_conversations';
const STORAGE_MESSAGES_KEY = 'movein_local_messages';
const STORAGE_LEADS_KEY = 'movein_local_leads';

const CITY_COORDS: Record<string, [number, number]> = {
  Kathmandu: [27.7172, 85.324],
  Lalitpur: [27.671, 85.32],
  Bhaktapur: [27.671, 85.4298],
  Pokhara: [28.2096, 83.9595],
  Chitwan: [27.6833, 84.4333],
  Butwal: [27.7006, 83.4484],
};

// Initialize local store if not already set
const getLocalProperties = (): Property[] => {
  if (typeof window === 'undefined') return INITIAL_PROPERTIES;
  try {
    const raw = localStorage.getItem(STORAGE_PROPS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PROPS_KEY, JSON.stringify(INITIAL_PROPERTIES));
      return INITIAL_PROPERTIES;
    }
    const parsed: Property[] = JSON.parse(raw);
    // Ensure all properties have coordinates
    let updated = false;
    const enriched = parsed.map((p) => {
      if (!p.latitude || !p.longitude) {
        const initialMatch = INITIAL_PROPERTIES.find((init) => init.id === p.id);
        if (initialMatch && initialMatch.latitude && initialMatch.longitude) {
          updated = true;
          return { ...p, latitude: initialMatch.latitude, longitude: initialMatch.longitude };
        }
        const base = CITY_COORDS[p.city] || CITY_COORDS.Kathmandu;
        updated = true;
        return {
          ...p,
          latitude: base[0] + (Math.random() - 0.5) * 0.02,
          longitude: base[1] + (Math.random() - 0.5) * 0.02,
        };
      }
      return p;
    });
    if (updated) {
      localStorage.setItem(STORAGE_PROPS_KEY, JSON.stringify(enriched));
    }
    return enriched;
  } catch {
    return INITIAL_PROPERTIES;
  }
};

const saveLocalProperties = (props: Property[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PROPS_KEY, JSON.stringify(props));
  }
};

const getLocalProfiles = (): Profile[] => {
  if (typeof window === 'undefined') return INITIAL_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(INITIAL_PROFILES));
      return INITIAL_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROFILES;
  }
};

const saveLocalProfiles = (profiles: Profile[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  }
};

const getLocalPayments = (): Payment[] => {
  if (typeof window === 'undefined') return INITIAL_PAYMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_PAYMENTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
};

const saveLocalPayments = (payments: Payment[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
  }
};

const getLocalUnlocks = (): ContactUnlock[] => {
  if (typeof window === 'undefined') return INITIAL_CONTACT_UNLOCKS;
  try {
    const raw = localStorage.getItem(STORAGE_UNLOCKS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_UNLOCKS_KEY, JSON.stringify(INITIAL_CONTACT_UNLOCKS));
      return INITIAL_CONTACT_UNLOCKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CONTACT_UNLOCKS;
  }
};

const saveLocalUnlocks = (unlocks: ContactUnlock[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_UNLOCKS_KEY, JSON.stringify(unlocks));
  }
};

const getLocalSubscriptions = (): Subscription[] => {
  if (typeof window === 'undefined') return INITIAL_SUBSCRIPTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_SUBSCRIPTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      return INITIAL_SUBSCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBSCRIPTIONS;
  }
};

const saveLocalSubscriptions = (subs: Subscription[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(subs));
  }
};

const getLocalHunterSubscriptions = (): HunterSubscription[] => {
  if (typeof window === 'undefined') return INITIAL_HUNTER_SUBSCRIPTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_HUNTER_SUBS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_HUNTER_SUBS_KEY, JSON.stringify(INITIAL_HUNTER_SUBSCRIPTIONS));
      return INITIAL_HUNTER_SUBSCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_HUNTER_SUBSCRIPTIONS;
  }
};

const saveLocalHunterSubscriptions = (subs: HunterSubscription[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_HUNTER_SUBS_KEY, JSON.stringify(subs));
  }
};

const getLocalConversations = (): Conversation[] => {
  if (typeof window === 'undefined') return INITIAL_CONVERSATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
      return INITIAL_CONVERSATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CONVERSATIONS;
  }
};

const saveLocalConversations = (convs: Conversation[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(convs));
  }
};

const getLocalMessages = (): ChatMessage[] => {
  if (typeof window === 'undefined') return INITIAL_CHAT_MESSAGES;
  try {
    const raw = localStorage.getItem(STORAGE_MESSAGES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(INITIAL_CHAT_MESSAGES));
      return INITIAL_CHAT_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CHAT_MESSAGES;
  }
};

const saveLocalMessages = (msgs: ChatMessage[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(msgs));
  }
};

const getLocalLeads = (): OwnerLead[] => {
  if (typeof window === 'undefined') return INITIAL_LEADS;
  try {
    const raw = localStorage.getItem(STORAGE_LEADS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LEADS;
  }
};

const saveLocalLeads = (leads: OwnerLead[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(leads));
  }
};

export const dbService = {
  // Fetch available properties (or all if specified)
  async getProperties(options?: {
    status?: PropertyStatus | 'all';
    ownerId?: string;
    limit?: number;
  }): Promise<Property[]> {
    const client = getSupabaseClient();

    if (client && isSupabaseConfigured()) {
      try {
        let query = client
          .from('properties')
          .select(`
            *,
            property_images (*),
            owner:profiles (*)
          `)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (options?.status && options.status !== 'all') {
          query = query.eq('status', options.status);
        } else if (!options?.status) {
          // By default only available properties
          query = query.eq('status', 'available');
        }

        if (options?.ownerId) {
          query = query.eq('owner_id', options.ownerId);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('Supabase getProperties returned error, falling back to local data:', error.message);
        } else if (data && data.length > 0) {
          return data.map((item: any) => ({
            ...item,
            images: item.property_images || [],
            owner: item.owner || undefined,
          })) as Property[];
        }
      } catch (err) {
        console.warn('Supabase fetch exception:', err);
      }
    }

    // Fallback / Local mode
    let list = getLocalProperties();
    const profiles = getLocalProfiles();

    if (options?.status && options.status !== 'all') {
      list = list.filter((p) => p.status === options.status);
    } else if (!options?.status) {
      list = list.filter((p) => p.status === 'available');
    }

    if (options?.ownerId) {
      list = list.filter((p) => p.owner_id === options.ownerId);
    }

    // Attach owner info
    list = list.map((p) => ({
      ...p,
      owner: profiles.find((prof) => prof.id === p.owner_id) || p.owner,
    }));

    // Prioritize featured properties first, then newest
    list = [...list].sort((a, b) => {
      const aFeat = a.is_featured ? 1 : 0;
      const bFeat = b.is_featured ? 1 : 0;
      if (aFeat !== bFeat) return bFeat - aFeat;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (options?.limit) {
      list = list.slice(0, options.limit);
    }

    return list;
  },

  // Fetch single property by ID
  async getPropertyById(id: string): Promise<Property | null> {
    const client = getSupabaseClient();

    if (client && isSupabaseConfigured()) {
      try {
        const { data, error } = await client
          .from('properties')
          .select(`
            *,
            property_images (*),
            owner:profiles (*)
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.warn('Supabase getPropertyById error:', error.message);
        } else if (data) {
          return {
            ...data,
            images: data.property_images || [],
            owner: data.owner || undefined,
          } as Property;
        }
      } catch (err) {
        console.warn('Supabase getPropertyById exception:', err);
      }
    }

    const localList = getLocalProperties();
    const found = localList.find((p) => p.id === id);
    if (!found) return null;

    const profiles = getLocalProfiles();
    return {
      ...found,
      owner: profiles.find((prof) => prof.id === found.owner_id) || found.owner,
    };
  },

  // Create a new property
  async createProperty(
    propertyData: Omit<Property, 'id' | 'created_at' | 'images' | 'owner'>,
    imageFilesOrUrls: (string | File)[]
  ): Promise<Property> {
    const client = getSupabaseClient();
    const generatedId = 'prop-' + Date.now();
    const createdAt = new Date().toISOString();

    const baseCoords = CITY_COORDS[propertyData.city] || CITY_COORDS.Kathmandu;
    const finalLat =
      propertyData.latitude || baseCoords[0] + (Math.random() - 0.5) * 0.02;
    const finalLng =
      propertyData.longitude || baseCoords[1] + (Math.random() - 0.5) * 0.02;

    // Process images
    const uploadedImages: PropertyImage[] = [];

    for (let i = 0; i < imageFilesOrUrls.length; i++) {
      const item = imageFilesOrUrls[i];
      let imageUrl = '';

      if (typeof item === 'string') {
        imageUrl = item;
      } else {
        // Try uploading to Supabase Storage if available
        if (client && isSupabaseConfigured()) {
          try {
            const fileExt = item.name.split('.').pop() || 'jpg';
            const fileName = `${generatedId}_${Date.now()}_${i}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await client.storage
              .from('property-images')
              .upload(fileName, item);

            if (!uploadError && uploadData) {
              const { data: publicUrlData } = client.storage
                .from('property-images')
                .getPublicUrl(fileName);
              imageUrl = publicUrlData.publicUrl;
            }
          } catch (e) {
            console.warn('Storage upload error, fallback to data URL', e);
          }
        }

        // Fallback to data URL
        if (!imageUrl) {
          imageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(item);
          });
        }
      }

      uploadedImages.push({
        id: `img-${Date.now()}-${i}`,
        property_id: generatedId,
        image_url: imageUrl,
        is_primary: i === 0,
        created_at: new Date().toISOString(),
      });
    }

    if (client && isSupabaseConfigured()) {
      try {
        const { data: propData, error: propError } = await client
          .from('properties')
          .insert([
            {
              id: generatedId,
              owner_id: propertyData.owner_id,
              title: propertyData.title,
              description: propertyData.description,
              property_type: propertyData.property_type,
              listing_type: propertyData.listing_type,
              price: propertyData.price,
              negotiable: propertyData.negotiable,
              address: propertyData.address,
              city: propertyData.city,
              district: propertyData.district,
              latitude: finalLat,
              longitude: finalLng,
              bedrooms: propertyData.bedrooms,
              bathrooms: propertyData.bathrooms,
              area_sqft: propertyData.area_sqft,
              status: propertyData.status,
              created_at: createdAt,
            },
          ])
          .select()
          .single();

        if (!propError && propData) {
          // Insert images
          if (uploadedImages.length > 0) {
            await client.from('property_images').insert(
              uploadedImages.map((img) => ({
                id: img.id,
                property_id: generatedId,
                image_url: img.image_url,
                is_primary: img.is_primary,
              }))
            );
          }

          return {
            ...propData,
            images: uploadedImages,
          } as Property;
        }
      } catch (err) {
        console.warn('Supabase createProperty error, fallback to local', err);
      }
    }

    // Local save
    const newProperty: Property = {
      ...propertyData,
      id: generatedId,
      latitude: finalLat,
      longitude: finalLng,
      created_at: createdAt,
      images: uploadedImages,
      views_count: 1,
    };

    const current = getLocalProperties();
    saveLocalProperties([newProperty, ...current]);
    return newProperty;
  },

  // Update a property
  async updateProperty(
    id: string,
    updates: Partial<Property>,
    newImages?: (string | File)[]
  ): Promise<Property | null> {
    const client = getSupabaseClient();

    if (client && isSupabaseConfigured()) {
      try {
        const payload: Record<string, any> = { ...updates };
        delete payload.images;
        delete payload.owner;

        const { data, error } = await client
          .from('properties')
          .update(payload)
          .eq('id', id)
          .select(`
            *,
            property_images (*),
            owner:profiles (*)
          `)
          .single();

        if (!error && data) {
          return {
            ...data,
            images: data.property_images || [],
            owner: data.owner,
          };
        }
      } catch (err) {
        console.warn('Supabase updateProperty failed, falling to local', err);
      }
    }

    const localList = getLocalProperties();
    const index = localList.findIndex((p) => p.id === id);
    if (index === -1) return null;

    let updatedImages = localList[index].images || [];
    if (newImages && newImages.length > 0) {
      const added: PropertyImage[] = [];
      for (let i = 0; i < newImages.length; i++) {
        const item = newImages[i];
        let url = '';
        if (typeof item === 'string') {
          url = item;
        } else {
          url = await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.readAsDataURL(item);
          });
        }
        added.push({
          id: `img-${Date.now()}-${i}`,
          property_id: id,
          image_url: url,
          is_primary: updatedImages.length === 0 && i === 0,
        });
      }
      updatedImages = [...updatedImages, ...added];
    }

    const updatedProp: Property = {
      ...localList[index],
      ...updates,
      images: updatedImages,
    };

    localList[index] = updatedProp;
    saveLocalProperties([...localList]);
    return updatedProp;
  },

  // Delete a property
  async deleteProperty(id: string): Promise<boolean> {
    const client = getSupabaseClient();

    if (client && isSupabaseConfigured()) {
      try {
        // Delete images first
        await client.from('property_images').delete().eq('property_id', id);
        const { error } = await client.from('properties').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    const list = getLocalProperties();
    const filtered = list.filter((p) => p.id !== id);
    saveLocalProperties(filtered);
    return true;
  },

  // Update property status (admin/owner)
  async updatePropertyStatus(id: string, status: PropertyStatus): Promise<boolean> {
    const client = getSupabaseClient();

    if (client && isSupabaseConfigured()) {
      try {
        const { error } = await client
          .from('properties')
          .update({ status })
          .eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase update status error:', err);
      }
    }

    const list = getLocalProperties();
    const item = list.find((p) => p.id === id);
    if (item) {
      item.status = status;
      saveLocalProperties([...list]);
      return true;
    }
    return false;
  },

  // Fetch all profiles (admin user management)
  async getAllProfiles(): Promise<Profile[]> {
    const client = getSupabaseClient();

    if (client && isSupabaseConfigured()) {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Profile[];
        }
      } catch (err) {
        console.warn('Supabase getAllProfiles error:', err);
      }
    }

    return getLocalProfiles();
  },

  // Update profile role (admin)
  async updateProfileRole(profileId: string, role: UserRole): Promise<boolean> {
    const client = getSupabaseClient();

    if (client && isSupabaseConfigured()) {
      try {
        const { error } = await client
          .from('profiles')
          .update({ role })
          .eq('id', profileId);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase updateProfileRole error:', err);
      }
    }

    const list = getLocalProfiles();
    const found = list.find((p) => p.id === profileId);
    if (found) {
      found.role = role;
      saveLocalProfiles([...list]);
      return true;
    }
    return false;
  },

  // Toggle featured status of a property (admin or after boost payment)
  async togglePropertyFeatured(propertyId: string, isFeatured: boolean): Promise<boolean> {
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client.from('properties').update({ is_featured: isFeatured }).eq('id', propertyId);
      } catch (err) {
        console.warn('Supabase toggle is_featured error:', err);
      }
    }
    const list = getLocalProperties();
    const item = list.find((p) => p.id === propertyId);
    if (item) {
      item.is_featured = isFeatured;
      saveLocalProperties([...list]);
      return true;
    }
    return false;
  },

  // Increment property view count
  async incrementPropertyViews(propertyId: string): Promise<void> {
    const list = getLocalProperties();
    const item = list.find((p) => p.id === propertyId);
    if (item) {
      item.views = (item.views || item.views_count || 0) + 1;
      item.views_count = item.views;
      saveLocalProperties([...list]);
    }
  },

  // Get all payments (with user and property joined)
  async getPayments(): Promise<Payment[]> {
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        const { data, error } = await client
          .from('payments')
          .select(`
            *,
            user:profiles (*),
            property:properties (*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Payment[];
        }
      } catch (err) {
        console.warn('Supabase getPayments error:', err);
      }
    }

    const localPayments = getLocalPayments();
    const profiles = getLocalProfiles();
    const properties = getLocalProperties();

    return localPayments.map((pay) => ({
      ...pay,
      user: profiles.find((u) => u.id === pay.user_id),
      property: properties.find((p) => p.id === pay.property_id),
    }));
  },

  // Create payment record (status='pending')
  async createPayment(
    paymentData: Omit<Payment, 'id' | 'created_at' | 'status'>
  ): Promise<Payment> {
    const newPayment: Payment = {
      ...paymentData,
      id: 'pay-' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        const { data, error } = await client.from('payments').insert([newPayment]).select().single();
        if (!error && data) {
          return data as Payment;
        }
      } catch (err) {
        console.warn('Supabase createPayment error:', err);
      }
    }

    const current = getLocalPayments();
    saveLocalPayments([newPayment, ...current]);
    return newPayment;
  },

  // Verify payment (status='verified') and execute corresponding monetization activation
  async verifyPayment(paymentId: string): Promise<boolean> {
    const client = getSupabaseClient();
    const verifiedAt = new Date().toISOString();

    if (client && isSupabaseConfigured()) {
      try {
        await client
          .from('payments')
          .update({ status: 'verified', verified_at: verifiedAt })
          .eq('id', paymentId);
      } catch (err) {
        console.warn('Supabase verifyPayment error:', err);
      }
    }

    const payments = getLocalPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return false;

    payment.status = 'verified';
    payment.verified_at = verifiedAt;
    saveLocalPayments([...payments]);

    // Side-effects based on purpose:
    if (payment.purpose === 'contact_unlock' && payment.property_id) {
      // Create contact unlock valid for 7 days
      const unlocks = getLocalUnlocks();
      const newUnlock: ContactUnlock = {
        id: 'unlock-' + Date.now(),
        user_id: payment.user_id,
        property_id: payment.property_id,
        payment_id: payment.id,
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days
        created_at: verifiedAt,
      };
      saveLocalUnlocks([newUnlock, ...unlocks]);
    } else if (payment.purpose === 'boost_listing' && payment.property_id) {
      // Mark property as featured
      await this.togglePropertyFeatured(payment.property_id, true);
    } else if (payment.purpose === 'owner_subscription') {
      // Activate or renew subscription
      const subs = getLocalSubscriptions();
      const planName = payment.metadata?.plan_name || 'Pro Landlord';
      const existingSub = subs.find((s) => s.user_id === payment.user_id);
      if (existingSub) {
        existingSub.status = 'active';
        existingSub.plan_name = planName;
        existingSub.expires_at = new Date(Date.now() + 30 * 86400000).toISOString();
        saveLocalSubscriptions([...subs]);
      } else {
        const newSub: Subscription = {
          id: 'sub-' + Date.now(),
          user_id: payment.user_id,
          plan_name: planName,
          price: payment.amount,
          payment_id: payment.id,
          status: 'active',
          starts_at: verifiedAt,
          expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
          created_at: verifiedAt,
        };
        saveLocalSubscriptions([newSub, ...subs]);
      }
    } else if (payment.purpose === 'hunter_subscription') {
      // Activate Hunter Subscription Plan
      const planTier = (payment.metadata?.plan_tier as HunterPlanTier) || 'basic';
      await this.upgradeHunterPlan(payment.user_id, planTier, payment.id);
    }

    return true;
  },

  // Reject payment
  async rejectPayment(paymentId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client.from('payments').update({ status: 'rejected' }).eq('id', paymentId);
      } catch (e) {
        console.warn('Supabase rejectPayment error:', e);
      }
    }

    const payments = getLocalPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      payment.status = 'rejected';
      saveLocalPayments([...payments]);
      return true;
    }
    return false;
  },

  // Check if contact is unlocked for user on a property (valid for 7 days)
  async checkContactUnlocked(
    userId: string,
    propertyId: string
  ): Promise<{ unlocked: boolean; expires_at?: string; daysRemaining?: number }> {
    const unlocks = getLocalUnlocks();
    const now = new Date().getTime();

    const activeUnlock = unlocks.find(
      (u) =>
        u.user_id === userId &&
        u.property_id === propertyId &&
        new Date(u.expires_at).getTime() > now
    );

    if (activeUnlock) {
      const msRemaining = new Date(activeUnlock.expires_at).getTime() - now;
      const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
      return {
        unlocked: true,
        expires_at: activeUnlock.expires_at,
        daysRemaining,
      };
    }

    return { unlocked: false };
  },

  // Get active subscription for an owner
  async getUserSubscription(userId: string): Promise<Subscription> {
    const subs = getLocalSubscriptions();
    const found = subs.find((s) => s.user_id === userId && s.status === 'active');
    if (found) return found;

    // Default starter plan
    return {
      id: 'sub-starter-' + userId,
      user_id: userId,
      plan_name: 'Starter Plan',
      price: 0,
      status: 'active',
      starts_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
  },

  // Get count of contacts unlocked for owner's properties
  async getOwnerContactsUnlockedCount(ownerId: string): Promise<number> {
    const props = getLocalProperties().filter((p) => p.owner_id === ownerId);
    const propIds = new Set(props.map((p) => p.id));
    const unlocks = getLocalUnlocks();
    return unlocks.filter((u) => propIds.has(u.property_id)).length;
  },

  // Get success fee tracking list
  async getSuccessFeeReport(): Promise<
    Array<{ property: Property; feeAmount: number; status: 'paid' | 'pending'; payment?: Payment }>
  > {
    const props = getLocalProperties().filter(
      (p) => p.status === 'rented' || p.status === 'sold'
    );
    const payments = getLocalPayments().filter((p) => p.purpose === 'success_fee');

    return props.map((prop) => {
      const feeAmount = prop.property_type === 'room' ? 500 : 1000;
      const verifiedPay = payments.find(
        (p) => p.property_id === prop.id && p.status === 'verified'
      );
      const pendingPay = payments.find(
        (p) => p.property_id === prop.id && p.status === 'pending'
      );

      return {
        property: prop,
        feeAmount,
        status: verifiedPay ? 'paid' : 'pending',
        payment: verifiedPay || pendingPay,
      };
    });
  },

  // 1. VERIFICATION SYSTEM
  // Owner submits self-verification photo
  async submitSelfVerification(propertyId: string, photoDataUrl: string): Promise<boolean> {
    const now = new Date().toISOString();
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client
          .from('properties')
          .update({
            is_self_verified: true,
            self_verified_at: now,
            self_verification_photo: photoDataUrl,
          })
          .eq('id', propertyId);
      } catch (e) {
        console.warn('Supabase self-verification error:', e);
      }
    }

    const list = getLocalProperties();
    const prop = list.find((p) => p.id === propertyId);
    if (prop) {
      prop.is_self_verified = true;
      prop.self_verified_at = now;
      prop.self_verification_photo = photoDataUrl;
      saveLocalProperties([...list]);
      return true;
    }
    return false;
  },

  // Admin toggles platform verification (gold badge)
  async togglePlatformVerification(propertyId: string, isVerified: boolean): Promise<boolean> {
    const now = new Date().toISOString();
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client
          .from('properties')
          .update({
            is_platform_verified: isVerified,
            platform_verified_at: isVerified ? now : null,
          })
          .eq('id', propertyId);
      } catch (e) {
        console.warn('Supabase platform verification error:', e);
      }
    }

    const list = getLocalProperties();
    const prop = list.find((p) => p.id === propertyId);
    if (prop) {
      prop.is_platform_verified = isVerified;
      prop.platform_verified_at = isVerified ? now : undefined;
      saveLocalProperties([...list]);
      return true;
    }
    return false;
  },

  // 2. LISTING RENEWAL
  async renewPropertyListing(propertyId: string, days = 60): Promise<boolean> {
    const newExpiresAt = new Date(Date.now() + days * 86400000).toISOString();
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client
          .from('properties')
          .update({ expires_at: newExpiresAt, status: 'available' })
          .eq('id', propertyId);
      } catch (e) {
        console.warn('Supabase renew error:', e);
      }
    }

    const list = getLocalProperties();
    const prop = list.find((p) => p.id === propertyId);
    if (prop) {
      prop.expires_at = newExpiresAt;
      if (prop.status === 'sold' || prop.status === 'rented') {
        prop.status = 'available';
      }
      saveLocalProperties([...list]);
      return true;
    }
    return false;
  },

  // 3. HUNTER SUBSCRIPTION PLANS & QUOTA
  async getHunterSubscription(userId: string): Promise<HunterSubscription> {
    const list = getLocalHunterSubscriptions();
    let sub = list.find((s) => s.user_id === userId && s.status === 'active');
    if (!sub) {
      // Create default Free tier (2 contacts limit, 0 used)
      sub = {
        id: 'hsub-' + userId,
        user_id: userId,
        plan_tier: 'free',
        plan_name: 'Free Plan',
        contacts_limit: 2,
        contacts_used: 0,
        price: 0,
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      };
      saveLocalHunterSubscriptions([sub, ...list]);
    }
    return sub;
  },

  async getAllHunterSubscriptions(): Promise<HunterSubscription[]> {
    const subs = getLocalHunterSubscriptions();
    const profiles = getLocalProfiles();
    return subs.map((s) => ({
      ...s,
      user: profiles.find((p) => p.id === s.user_id),
    }));
  },

  // Unlock contact using hunter quota (Free 2 contacts or paid plan)
  async unlockContactWithQuota(
    userId: string,
    propertyId: string
  ): Promise<{ success: boolean; remaining: number; error?: string }> {
    const sub = await this.getHunterSubscription(userId);
    const remaining = sub.contacts_limit - sub.contacts_used;

    if (remaining <= 0) {
      return { success: false, remaining: 0, error: 'Quota exhausted. Please upgrade your plan.' };
    }

    // Check if already unlocked
    const currentUnlocks = getLocalUnlocks();
    const exists = currentUnlocks.some((u) => u.user_id === userId && u.property_id === propertyId);

    if (!exists) {
      sub.contacts_used += 1;
      const allSubs = getLocalHunterSubscriptions();
      const updatedSubs = allSubs.map((s) => (s.id === sub.id ? sub : s));
      saveLocalHunterSubscriptions(updatedSubs);

      // Register contact unlock for 7 days
      const newUnlock: ContactUnlock = {
        id: 'unlock-' + Date.now(),
        user_id: userId,
        property_id: propertyId,
        is_free_quota: true,
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      };
      saveLocalUnlocks([newUnlock, ...currentUnlocks]);

      // Record lead for owner
      const prop = getLocalProperties().find((p) => p.id === propertyId);
      if (prop) {
        this.recordLead(propertyId, prop.owner_id, userId, 'unlocked');
      }
    }

    return { success: true, remaining: Math.max(0, sub.contacts_limit - sub.contacts_used) };
  },

  // Upgrade hunter plan
  async upgradeHunterPlan(
    userId: string,
    planTier: HunterPlanTier,
    paymentId?: string
  ): Promise<HunterSubscription> {
    const allSubs = getLocalHunterSubscriptions();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 60 * 86400000).toISOString();

    let name = 'Basic Plan';
    let limit = 10;
    let price = 199;
    let prioritySupport = false;
    let whatsappAssisted = false;

    if (planTier === 'premium') {
      name = 'Premium Plan';
      limit = 25;
      price = 499;
      prioritySupport = true;
    } else if (planTier === 'assisted') {
      name = 'Assisted Plan';
      limit = 999999;
      price = 999;
      prioritySupport = true;
      whatsappAssisted = true;
    }

    const updatedSub: HunterSubscription = {
      id: 'hsub-' + Date.now(),
      user_id: userId,
      plan_tier: planTier,
      plan_name: name,
      contacts_limit: limit,
      contacts_used: 0,
      price,
      payment_id: paymentId,
      status: 'active',
      starts_at: now,
      expires_at: expiresAt,
      created_at: now,
      priority_support: prioritySupport,
      whatsapp_assisted: whatsappAssisted,
    };

    // Replace previous sub for user
    const filtered = allSubs.filter((s) => s.user_id !== userId);
    saveLocalHunterSubscriptions([updatedSub, ...filtered]);
    return updatedSub;
  },

  // 4. IN-APP CHAT & SUPABASE REALTIME SYSTEM
  async getConversations(userId: string): Promise<Conversation[]> {
    const convs = getLocalConversations();
    const properties = getLocalProperties();
    const profiles = getLocalProfiles();

    return convs
      .filter((c) => c.hunter_id === userId || c.owner_id === userId)
      .map((c) => ({
        ...c,
        property: properties.find((p) => p.id === c.property_id),
        hunter: profiles.find((p) => p.id === c.hunter_id),
        owner: profiles.find((p) => p.id === c.owner_id),
      }))
      .sort((a, b) => {
        const timeA = new Date(a.last_message_at || a.created_at).getTime();
        const timeB = new Date(b.last_message_at || b.created_at).getTime();
        return timeB - timeA;
      });
  },

  async getAllConversationsAdmin(): Promise<Conversation[]> {
    const convs = getLocalConversations();
    const properties = getLocalProperties();
    const profiles = getLocalProfiles();

    return convs.map((c) => ({
      ...c,
      property: properties.find((p) => p.id === c.property_id),
      hunter: profiles.find((p) => p.id === c.hunter_id),
      owner: profiles.find((p) => p.id === c.owner_id),
    }));
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const all = getLocalMessages();
    return all
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async getOrCreateConversation(
    propertyId: string,
    hunterId: string,
    ownerId: string
  ): Promise<Conversation> {
    const convs = getLocalConversations();
    let existing = convs.find(
      (c) => c.property_id === propertyId && c.hunter_id === hunterId && c.owner_id === ownerId
    );

    if (existing) {
      return existing;
    }

    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      property_id: propertyId,
      hunter_id: hunterId,
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      last_message: 'Conversation started',
      last_message_at: new Date().toISOString(),
      unread_count: 0,
    };

    saveLocalConversations([newConv, ...convs]);
    this.recordLead(propertyId, ownerId, hunterId, 'chatted');
    return newConv;
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    senderRole: UserRole,
    messageText: string
  ): Promise<ChatMessage> {
    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      conversation_id: conversationId,
      sender_id: senderId,
      sender_role: senderRole,
      message: messageText.trim(),
      created_at: now,
      read: false,
    };

    // Save message
    const allMsgs = getLocalMessages();
    saveLocalMessages([...allMsgs, newMsg]);

    // Update conversation last message
    const allConvs = getLocalConversations();
    const conv = allConvs.find((c) => c.id === conversationId);
    if (conv) {
      conv.last_message = messageText.trim();
      conv.last_message_at = now;
      saveLocalConversations([...allConvs]);
    }

    // Broadcast in-app event for immediate real-time sync across components/tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('movein_chat_broadcast', {
          detail: { conversationId, message: newMsg },
        })
      );
    }

    // Attempt Supabase Realtime broadcast if client is configured
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        const channel = client.channel(`chat:${conversationId}`);
        channel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMsg,
        });
      } catch (err) {
        console.warn('Realtime broadcast error, local broadcast used:', err);
      }
    }

    return newMsg;
  },

  // Subscribe to real-time chat messages
  subscribeToMessages(
    conversationId: string,
    onMessage: (msg: ChatMessage) => void
  ): () => void {
    // 1. Supabase Realtime Channel
    const client = getSupabaseClient();
    let supabaseChannel: any = null;

    if (client && isSupabaseConfigured()) {
      try {
        supabaseChannel = client
          .channel(`chat:${conversationId}`)
          .on('broadcast', { event: 'new_message' }, (payload: any) => {
            if (payload.payload && payload.payload.conversation_id === conversationId) {
              onMessage(payload.payload);
            }
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }

    // 2. In-App Window CustomEvent Listener (100% reliable local & preview fallback)
    const handleLocalBroadcast = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        customEvent.detail &&
        customEvent.detail.conversationId === conversationId &&
        customEvent.detail.message
      ) {
        onMessage(customEvent.detail.message);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('movein_chat_broadcast', handleLocalBroadcast);
    }

    // Return cleanup unsubscribe function
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('movein_chat_broadcast', handleLocalBroadcast);
      }
      if (supabaseChannel && client) {
        client.removeChannel(supabaseChannel);
      }
    };
  },

  // 5. LEADS TRACKING
  async getOwnerLeads(ownerId: string): Promise<OwnerLead[]> {
    const leads = getLocalLeads();
    const props = getLocalProperties();
    const profiles = getLocalProfiles();

    return leads
      .filter((l) => l.owner_id === ownerId)
      .map((l) => ({
        ...l,
        property: props.find((p) => p.id === l.property_id),
        hunter: profiles.find((p) => p.id === l.hunter_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  recordLead(
    propertyId: string,
    ownerId: string,
    hunterId: string,
    action: 'viewed' | 'unlocked' | 'chatted'
  ) {
    if (!ownerId || !hunterId || ownerId === hunterId) return;
    const leads = getLocalLeads();
    // Avoid spamming duplicate identical action within 1 hour
    const recent = leads.find(
      (l) =>
        l.property_id === propertyId &&
        l.hunter_id === hunterId &&
        l.action === action &&
        Date.now() - new Date(l.created_at).getTime() < 3600000
    );
    if (!recent) {
      const newLead: OwnerLead = {
        id: 'lead-' + Date.now(),
        property_id: propertyId,
        owner_id: ownerId,
        hunter_id: hunterId,
        action,
        created_at: new Date().toISOString(),
      };
      saveLocalLeads([newLead, ...leads]);
    }
  },

  // 6. REVENUE BREAKDOWN FOR ADMIN
  async getRevenueBreakdown(): Promise<{
    hunter_subscription: number;
    contact_unlock: number;
    boost_listing: number;
    success_fee: number;
    owner_subscription: number;
    total: number;
  }> {
    const payments = await this.getPayments();
    const verified = payments.filter((p) => p.status === 'verified');

    const result = {
      hunter_subscription: 0,
      contact_unlock: 0,
      boost_listing: 0,
      success_fee: 0,
      owner_subscription: 0,
      total: 0,
    };

    verified.forEach((p) => {
      const amt = Number(p.amount) || 0;
      if (p.purpose in result) {
        result[p.purpose as keyof typeof result] += amt;
      }
      result.total += amt;
    });

    return result;
  },

  // Reset to default sample data if user wants to reload demo
  resetDemoData() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PROPS_KEY, JSON.stringify(INITIAL_PROPERTIES));
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(INITIAL_PROFILES));
      localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(INITIAL_PAYMENTS));
      localStorage.setItem(STORAGE_UNLOCKS_KEY, JSON.stringify(INITIAL_CONTACT_UNLOCKS));
      localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      localStorage.setItem(STORAGE_HUNTER_SUBS_KEY, JSON.stringify(INITIAL_HUNTER_SUBSCRIPTIONS));
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(INITIAL_CHAT_MESSAGES));
      localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(INITIAL_LEADS));
    }
  },
};

