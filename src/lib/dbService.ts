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
  INITIAL_PROPERTY_LOCATIONS,
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
  PropertyLocation,
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
const STORAGE_LOCATIONS_KEY = 'movein_local_property_locations';

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Initialize local store if not already set
const getLocalProperties = (): Property[] => {
  if (typeof window === 'undefined') {
    return isSupabaseConfigured() ? [] : INITIAL_PROPERTIES;
  }
  // When Supabase is configured, NEVER seed or return mock properties
  if (isSupabaseConfigured()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_PROPS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PROPS_KEY, JSON.stringify(INITIAL_PROPERTIES));
      return INITIAL_PROPERTIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROPERTIES;
  }
};

const getLocalLocations = (): PropertyLocation[] => {
  if (typeof window === 'undefined') {
    return isSupabaseConfigured() ? [] : INITIAL_PROPERTY_LOCATIONS;
  }
  // When Supabase is configured, NEVER seed or return mock locations
  if (isSupabaseConfigured()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_LOCATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(INITIAL_PROPERTY_LOCATIONS));
      return INITIAL_PROPERTY_LOCATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveLocalLocations = (locations: PropertyLocation[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(locations));
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

      let data: any[] | null = null;
      let error: any = null;

      // Attempt 1: Full select with property_images and owner:profiles join
      const res1 = await query;
      data = res1.data;
      error = res1.error;

      // If joined query failed (e.g. profiles RLS policy blocks or FK embed issue), retry without owner embed
      if (error) {
        console.warn('Supabase getProperties with owner:profiles failed, retrying without owner embed:', error);
        let fallbackQuery = client
          .from('properties')
          .select(`
            *,
            property_images (*)
          `)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (options?.status && options.status !== 'all') {
          fallbackQuery = fallbackQuery.eq('status', options.status);
        } else if (!options?.status) {
          fallbackQuery = fallbackQuery.eq('status', 'available');
        }

        if (options?.ownerId) {
          fallbackQuery = fallbackQuery.eq('owner_id', options.ownerId);
        }

        if (options?.limit) {
          fallbackQuery = fallbackQuery.limit(options.limit);
        }

        const res2 = await fallbackQuery;
        if (res2.error) {
          console.error('Supabase getProperties fallback error:', res2.error);
          throw new Error(`Failed to load properties from database: ${res2.error.message}`);
        }
        data = res2.data;
      }

      // If Supabase is configured and query succeeded, ALWAYS return data (even if empty array)
      return (data || []).map((item: any) => ({
        ...item,
        images: item.property_images || [],
        owner: item.owner || undefined,
      })) as Property[];
    }

    // Fallback / Local mode ONLY when Supabase is NOT configured
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
      let { data, error } = await client
        .from('properties')
        .select(`
          *,
          property_images (*),
          owner:profiles (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.warn('Supabase getPropertyById join failed, retrying without owner embed:', error);
        const fallbackRes = await client
          .from('properties')
          .select(`
            *,
            property_images (*)
          `)
          .eq('id', id)
          .maybeSingle();

        if (fallbackRes.error) {
          console.error('Supabase getPropertyById error:', fallbackRes.error);
          throw new Error(`Failed to fetch property details: ${fallbackRes.error.message}`);
        }
        data = fallbackRes.data;
      }

      if (!data) return null;

      return {
        ...data,
        images: data.property_images || [],
        owner: data.owner || undefined,
      } as Property;
    }

    // Local mode ONLY when Supabase is NOT configured
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
    const generatedId = generateUUID();
    const createdAt = new Date().toISOString();

    if (client && isSupabaseConfigured()) {
      // Ensure owner_id matches authenticated Supabase user if session exists
      let ownerId = propertyData.owner_id;
      try {
        const { data: authData } = await client.auth.getUser();
        if (authData?.user?.id) {
          ownerId = authData.user.id;
        }
      } catch {
        // Keep provided owner_id
      }

      // 1. Check and upload images to Supabase Storage 'property-images' bucket
      const uploadedImages: PropertyImage[] = [];

      for (let i = 0; i < imageFilesOrUrls.length; i++) {
        const item = imageFilesOrUrls[i];
        let imageUrl = '';

        if (typeof item === 'string') {
          imageUrl = item;
        } else {
          const fileExt = item.name.split('.').pop()?.toLowerCase() || 'jpg';
          const sanitizedFileName = `${generatedId}_${Date.now()}_${i}.${fileExt}`;

          const { error: uploadError } = await client.storage
            .from('property-images')
            .upload(sanitizedFileName, item, {
              cacheControl: '3600',
              upsert: true,
            });

          if (uploadError) {
            console.error('Supabase storage upload error details:', {
              message: uploadError.message,
              name: uploadError.name,
              statusCode: (uploadError as any).statusCode || (uploadError as any).status,
              error: uploadError,
            });
            throw new Error(`Failed to upload photo "${item.name}": ${uploadError.message}. Storage RLS policy violation: Please ensure INSERT policy is configured for the 'property-images' bucket in Supabase.`);
          }

          const { data: publicUrlData } = client.storage
            .from('property-images')
            .getPublicUrl(sanitizedFileName);

          if (!publicUrlData?.publicUrl) {
            throw new Error(`Failed to generate public URL for photo "${item.name}".`);
          }

          imageUrl = publicUrlData.publicUrl;
        }

        uploadedImages.push({
          id: generateUUID(),
          property_id: generatedId,
          image_url: imageUrl,
          is_primary: i === 0,
          created_at: new Date().toISOString(),
        });
      }

      // 2. Insert property row into Supabase 'properties' table
      const { data: propData, error: propError } = await client
        .from('properties')
        .insert([
          {
            id: generatedId,
            owner_id: ownerId,
            title: propertyData.title,
            description: propertyData.description,
            property_type: propertyData.property_type,
            listing_type: propertyData.listing_type,
            price: propertyData.price,
            negotiable: propertyData.negotiable ?? false,
            address: propertyData.address,
            city: propertyData.city,
            district: propertyData.district,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            area_sqft: propertyData.area_sqft,
            status: propertyData.status || 'available',
            created_at: createdAt,
          },
        ])
        .select()
        .single();

      if (propError) {
        console.error('Supabase properties insert error:', propError);
        throw new Error(`Failed to insert property into database: ${propError.message}`);
      }

      if (!propData) {
        throw new Error('Supabase did not return the created property record.');
      }

      // 3. Insert images into Supabase 'property_images' table
      if (uploadedImages.length > 0) {
        const { error: imgError } = await client
          .from('property_images')
          .insert(
            uploadedImages.map((img) => ({
              id: img.id,
              property_id: generatedId,
              image_url: img.image_url,
              is_primary: img.is_primary,
              created_at: img.created_at || createdAt,
            }))
          );

        if (imgError) {
          console.error('Supabase property_images insert error:', imgError);
          throw new Error(`Failed to register property images in database: ${imgError.message}`);
        }
      }

      // Return only when property exists in Supabase
      return {
        ...propData,
        images: uploadedImages,
      } as Property;
    }

    // Local save ONLY when Supabase is NOT configured
    const uploadedImages: PropertyImage[] = [];
    for (let i = 0; i < imageFilesOrUrls.length; i++) {
      const item = imageFilesOrUrls[i];
      let imageUrl = '';
      if (typeof item === 'string') {
        imageUrl = item;
      } else {
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(item);
        });
      }
      uploadedImages.push({
        id: `img-${Date.now()}-${i}`,
        property_id: generatedId,
        image_url: imageUrl,
        is_primary: i === 0,
        created_at: new Date().toISOString(),
      });
    }

    const newProperty: Property = {
      ...propertyData,
      id: generatedId,
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

      if (error) {
        console.error('Supabase updateProperty error:', error);
        throw new Error(`Failed to update property: ${error.message}`);
      }

      let currentImages: PropertyImage[] = data.property_images || [];
      if (newImages && newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          const item = newImages[i];
          let url = '';
          if (typeof item === 'string') {
            url = item;
          } else {
            const fileExt = item.name.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${id}_${Date.now()}_${i}.${fileExt}`;
            const { error: uploadErr } = await client.storage
              .from('property-images')
              .upload(fileName, item, { cacheControl: '3600', upsert: true });

            if (uploadErr) {
              console.error('Supabase storage upload error details:', {
                message: uploadErr.message,
                name: uploadErr.name,
                statusCode: (uploadErr as any).statusCode || (uploadErr as any).status,
                error: uploadErr,
              });
              throw new Error(`Failed to upload photo "${item.name}": ${uploadErr.message}. Storage RLS policy violation: Please ensure INSERT policy is configured for the 'property-images' bucket in Supabase.`);
            }

            const { data: pubData } = client.storage
              .from('property-images')
              .getPublicUrl(fileName);
            url = pubData.publicUrl;
          }

          const imgId = generateUUID();
          const { error: imgErr } = await client.from('property_images').insert({
            id: imgId,
            property_id: id,
            image_url: url,
            is_primary: currentImages.length === 0 && i === 0,
            created_at: new Date().toISOString(),
          });
          if (imgErr) {
            console.error('Supabase property_images insert error:', imgErr);
            throw new Error(`Failed to save image in database: ${imgErr.message}`);
          }
          currentImages.push({
            id: imgId,
            property_id: id,
            image_url: url,
            is_primary: currentImages.length === 0 && i === 0,
          });
        }
      }

      return {
        ...data,
        images: currentImages,
        owner: data.owner,
      };
    }

    // Local mode ONLY when Supabase is NOT configured
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
      // Delete location and images first
      await client.from('property_locations').delete().eq('property_id', id);
      await client.from('property_images').delete().eq('property_id', id);
      const { error } = await client.from('properties').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Failed to delete property from database: ${error.message}`);
      }
      return true;
    }

    // Local mode ONLY when Supabase is NOT configured
    const list = getLocalProperties();
    const filtered = list.filter((p) => p.id !== id);
    saveLocalProperties(filtered);
    return true;
  },

  // Update property status (admin/owner)
  async updatePropertyStatus(id: string, status: PropertyStatus): Promise<boolean> {
    const client = getSupabaseClient();

    if (client && isSupabaseConfigured()) {
      const { error } = await client
        .from('properties')
        .update({ status })
        .eq('id', id);
      if (error) {
        console.error('Supabase update status error:', error);
        throw new Error(`Failed to update property status: ${error.message}`);
      }
      return true;
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

  // Create payment record (status='pending') with screenshot upload
  async createPayment(
    paymentData: Omit<Payment, 'id' | 'created_at' | 'status'>,
    screenshotFileOrUrl?: File | string
  ): Promise<Payment> {
    const paymentId = 'pay-' + Date.now();
    let screenshotUrl = paymentData.screenshot_url || '';

    const client = getSupabaseClient();

    // If a screenshot File or Data URL is supplied
    if (screenshotFileOrUrl) {
      if (typeof screenshotFileOrUrl === 'string') {
        screenshotUrl = screenshotFileOrUrl;
      } else if (client && isSupabaseConfigured()) {
        try {
          const fileExt = screenshotFileOrUrl.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `payment_${paymentId}_${Date.now()}.${fileExt}`;
          const { error: uploadErr } = await client.storage
            .from('payment-proofs')
            .upload(fileName, screenshotFileOrUrl, { upsert: true });

          if (!uploadErr) {
            const { data: pubData } = client.storage
              .from('payment-proofs')
              .getPublicUrl(fileName);
            screenshotUrl = pubData.publicUrl;
          } else {
            console.warn('Storage upload error for payment proof, falling back to data URL:', uploadErr);
          }
        } catch (e) {
          console.warn('Supabase storage exception for payment proof:', e);
        }
      }

      // If storage URL was not generated, read as Data URL fallback
      if (!screenshotUrl && typeof screenshotFileOrUrl !== 'string') {
        screenshotUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.readAsDataURL(screenshotFileOrUrl);
        });
      }
    }

    const newPayment: Payment = {
      ...paymentData,
      id: paymentId,
      screenshot_url: screenshotUrl,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

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
      // Mark property as featured (boosted for 7-10 days)
      await this.togglePropertyFeatured(payment.property_id, true);
    } else if (payment.purpose === 'owner_subscription') {
      // Activate or renew owner subscription (Owner Pro)
      const subs = getLocalSubscriptions();
      const planName = payment.metadata?.plan_title || payment.metadata?.plan_name || 'Owner Pro';
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
      // Activate Hunter Subscription Plan (Free / Basic Rs 499 [10 contacts] / Premium Rs 999 [unlimited 999999])
      const planTier: HunterPlanTier =
        (payment.metadata?.plan_tier as HunterPlanTier) ||
        (payment.amount >= 999 ? 'premium' : 'basic');
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

  // Get all owner subscriptions
  async getAllSubscriptions(): Promise<Subscription[]> {
    return getLocalSubscriptions();
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

    let name = 'Basic';
    let limit = 10;
    let price = 499;
    let prioritySupport = false;
    let whatsappAssisted = false;

    if (planTier === 'premium') {
      name = 'Premium';
      limit = 999999;
      price = 999;
      prioritySupport = true;
    } else if (planTier === 'free') {
      name = 'Free';
      limit = 2;
      price = 0;
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

  // 7. PROPERTY LOCATIONS (Private coordinates, accessible only to owner, admin, or unlocked hunters)
  async getPropertyLocation(
    propertyId: string,
    userId?: string,
    userRole?: string
  ): Promise<PropertyLocation | null> {
    const props = getLocalProperties();
    let prop = props.find((p) => p.id === propertyId);
    if (!prop) {
      const fetched = await this.getPropertyById(propertyId);
      if (fetched) prop = fetched;
    }

    // Permission Check:
    // Admin sees all
    // Owner sees own property
    // Hunter sees ONLY if contact_unlocks row exists and hasn't expired
    let isAllowed = false;
    if (userRole === 'admin') {
      isAllowed = true;
    } else if (userId && prop && prop.owner_id === userId) {
      isAllowed = true;
    } else if (userId) {
      const unlockStatus = await this.checkContactUnlocked(userId, propertyId);
      if (unlockStatus.unlocked) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return null;
    }

    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      const { data, error } = await client
        .from('property_locations')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) {
        console.warn('Supabase getPropertyLocation error:', error);
        return null;
      }
      return (data as PropertyLocation) || null;
    }

    // Local mode ONLY when Supabase is NOT configured
    const localLocs = getLocalLocations();
    return localLocs.find((loc) => loc.property_id === propertyId) || null;
  },

  // Admin access to load all property locations
  async getAllPropertyLocations(): Promise<Record<string, PropertyLocation>> {
    const client = getSupabaseClient();
    const result: Record<string, PropertyLocation> = {};

    if (client && isSupabaseConfigured()) {
      const { data, error } = await client
        .from('property_locations')
        .select('*');

      if (error) {
        console.error('Supabase getAllPropertyLocations error:', error);
        throw new Error(`Failed to load property locations: ${error.message}`);
      }

      (data || []).forEach((item: any) => {
        result[item.property_id] = item as PropertyLocation;
      });
      return result;
    }

    // Local mode ONLY when Supabase is NOT configured
    const localLocs = getLocalLocations();
    localLocs.forEach((loc) => {
      result[loc.property_id] = loc;
    });
    return result;
  },

  async savePropertyLocation(data: {
    property_id: string;
    latitude: number;
    longitude: number;
    accuracy_meters?: number;
    landmark?: string;
    maps_url?: string;
  }): Promise<PropertyLocation> {
    const captured_at = new Date().toISOString();
    const updated_at = new Date().toISOString();
    const maps_url =
      data.maps_url ||
      `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`;

    const newLocation: PropertyLocation = {
      property_id: data.property_id,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy_meters: data.accuracy_meters,
      landmark: data.landmark,
      maps_url,
      captured_at,
      updated_at,
    };

    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      const { data: savedData, error } = await client
        .from('property_locations')
        .upsert(
          {
            property_id: newLocation.property_id,
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            accuracy_meters: newLocation.accuracy_meters,
            landmark: newLocation.landmark,
            maps_url: newLocation.maps_url,
            captured_at: newLocation.captured_at,
            updated_at: newLocation.updated_at,
          },
          { onConflict: 'property_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Supabase savePropertyLocation error:', error);
        throw new Error(`Failed to save property location to database: ${error.message}`);
      }

      return (savedData as PropertyLocation) || newLocation;
    }

    // Local mode ONLY when Supabase is NOT configured
    const current = getLocalLocations().filter(
      (l) => l.property_id !== data.property_id
    );
    saveLocalLocations([newLocation, ...current]);
    return newLocation;
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
      localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(INITIAL_PROPERTY_LOCATIONS));
    }
  },
};

