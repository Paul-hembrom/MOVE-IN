-- ==============================================================================
-- Move-In Nepal: Complete Supabase Database Schema, Storage, and RLS Policies
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. PROFILES TABLE (Linked with Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'hunter' CHECK (role IN ('hunter', 'owner', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ==============================================================================
-- 3. PROPERTIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('room', 'flat', 'apartment', 'house', 'commercial')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('rent', 'sale')),
  price NUMERIC NOT NULL CHECK (price >= 0),
  negotiable BOOLEAN DEFAULT false,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  area_sqft NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'pending_approval', 'rented', 'sold', 'rejected')),
  is_featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_self_verified BOOLEAN DEFAULT false,
  self_verified_at TIMESTAMPTZ,
  self_verification_photo TEXT,
  is_platform_verified BOOLEAN DEFAULT false,
  platform_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON public.properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- Enable Row Level Security (RLS) on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated/Public can SELECT available properties (or owners viewing their own)
CREATE POLICY "Public can view available properties"
  ON public.properties FOR SELECT
  USING (
    status = 'available'
    OR auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Owners can INSERT their own properties (owner_id = auth.uid())
CREATE POLICY "Owners can insert own properties"
  ON public.properties FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Owners can UPDATE their own properties
CREATE POLICY "Owners can update own properties"
  ON public.properties FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Owners can DELETE their own properties
CREATE POLICY "Owners can delete own properties"
  ON public.properties FOR DELETE
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ==============================================================================
-- 4. PROPERTY IMAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);

ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can SELECT images of visible properties
CREATE POLICY "Anyone can view property images"
  ON public.property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_images.property_id
      AND (
        properties.status = 'available'
        OR properties.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

-- Policy: Owners can INSERT images for their own properties
CREATE POLICY "Owners can insert property images"
  ON public.property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_images.property_id
      AND (
        properties.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

-- Policy: Owners can UPDATE/DELETE images for their own properties
CREATE POLICY "Owners can update property images"
  ON public.property_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_images.property_id
      AND (
        properties.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Owners can delete property images"
  ON public.property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_images.property_id
      AND (
        properties.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

-- ==============================================================================
-- 5. PROPERTY LOCATIONS TABLE (Precise Geolocation & Navigation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.property_locations (
  property_id UUID PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy_meters NUMERIC,
  landmark TEXT,
  maps_url TEXT,
  captured_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.property_locations ENABLE ROW LEVEL SECURITY;

-- Admins full access to all property locations
CREATE POLICY "Admins full access to property locations"
  ON public.property_locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Owners can view and manage their own property location
CREATE POLICY "Owners manage their property location"
  ON public.property_locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_locations.property_id
      AND properties.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_locations.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Hunters can view location ONLY if active contact unlock exists
CREATE POLICY "Hunters view unlocked property location"
  ON public.property_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contact_unlocks
      WHERE contact_unlocks.hunter_id = auth.uid()
      AND contact_unlocks.property_id = property_locations.property_id
      AND (contact_unlocks.expires_at IS NULL OR contact_unlocks.expires_at > now())
    )
  );

-- ==============================================================================
-- 6. CONTACT UNLOCKS TABLE (Hunter Unlock Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ,
  UNIQUE(hunter_id, property_id)
);

ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hunters can view their own contact unlocks"
  ON public.contact_unlocks FOR SELECT
  USING (auth.uid() = hunter_id);

CREATE POLICY "Hunters can insert contact unlocks"
  ON public.contact_unlocks FOR INSERT
  WITH CHECK (auth.uid() = hunter_id);

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKET: "property-images" & POLICIES
-- ==============================================================================

-- Create public storage bucket for property photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Anyone can view/download property photos
CREATE POLICY "Public Access property-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Storage Policy: Authenticated owners can upload photos
CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

-- Storage Policy: Authenticated owners can update/overwrite their photos
CREATE POLICY "Authenticated users can update property images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

-- Storage Policy: Authenticated owners can delete their photos
CREATE POLICY "Authenticated users can delete property images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

-- ==============================================================================
-- 8. TRIGGER FOR AUTO-UPDATING updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_locations_updated_at ON public.property_locations;
CREATE TRIGGER update_property_locations_updated_at
  BEFORE UPDATE ON public.property_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
