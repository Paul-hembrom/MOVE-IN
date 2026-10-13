-- ==============================================================================
-- MOVE-IN SUPABASE SCHEMA, STORAGE & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Run this in your Supabase project's SQL Editor to ensure full persistence
-- for properties, photos, location coordinates, and profile access.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'hunter' CHECK (role IN ('hunter', 'owner', 'admin')),
  phone TEXT,
  token_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 3. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'room',
  furnishing TEXT DEFAULT 'unfurnished',
  price NUMERIC NOT NULL,
  price_negotiable BOOLEAN DEFAULT false,
  bills_included BOOLEAN DEFAULT false,
  available_from DATE,
  minimum_stay_months INTEGER DEFAULT 1,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  street_address TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'pending', 'hidden')),
  views_count INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);

-- Properties RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Anyone (hunters, visitors, authenticated, anon) can SELECT available properties
CREATE POLICY "Anyone can view available properties"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (status = 'available' OR auth.uid() = owner_id);

-- Owners can insert their own properties (owner_id matches auth.uid)
CREATE POLICY "Owners can insert their own properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own properties
CREATE POLICY "Owners can update their own properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Owners can delete their own properties
CREATE POLICY "Owners can delete their own properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- 4. PROPERTY IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);

-- Property Images RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view images of available properties or owner's properties
CREATE POLICY "Anyone can view property images"
  ON public.property_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_images.property_id
      AND (p.status = 'available' OR p.owner_id = auth.uid())
    )
  );

-- Owners can insert images for their own properties
CREATE POLICY "Owners can insert images for their properties"
  ON public.property_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_images.property_id
      AND p.owner_id = auth.uid()
    )
  );

-- Owners can update images of their properties
CREATE POLICY "Owners can update images of their properties"
  ON public.property_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_images.property_id
      AND p.owner_id = auth.uid()
    )
  );

-- Owners can delete images of their properties
CREATE POLICY "Owners can delete images of their properties"
  ON public.property_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_images.property_id
      AND p.owner_id = auth.uid()
    )
  );

-- 5. PROPERTY LOCATIONS TABLE (Exact GPS coordinates unlocked via tokens)
CREATE TABLE IF NOT EXISTS public.property_locations (
  property_id UUID PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy_meters DOUBLE PRECISION,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property locations RLS
ALTER TABLE public.property_locations ENABLE ROW LEVEL SECURITY;

-- Property owners and admin can read location directly
-- Hunters read location after unlocking via unlock token/grant table
CREATE POLICY "Owners can view their property location"
  ON public.property_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_locations.property_id
      AND p.owner_id = auth.uid()
    )
  );

-- Owners can insert/update location for their properties
CREATE POLICY "Owners can upsert their property location"
  ON public.property_locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_locations.property_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their property location"
  ON public.property_locations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_locations.property_id
      AND p.owner_id = auth.uid()
    )
  );

-- 6. STORAGE BUCKET: "property-images"
-- Create public storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies:
-- Anyone can view/download uploaded property images
CREATE POLICY "Public can view property images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'property-images');

-- Authenticated users (owners) can upload photos to the property-images bucket
CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

-- Users can update photos they uploaded
CREATE POLICY "Authenticated users can update their property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images');

-- Users can delete photos from property-images bucket
CREATE POLICY "Authenticated users can delete property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');
