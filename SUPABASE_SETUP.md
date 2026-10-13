# Move-In: Supabase Setup & Architecture Guide

This document describes the database schema, storage bucket configuration, and Row-Level Security (RLS) policies implemented for **Move-In**.

The full SQL script is available in `supabase/schema.sql`.

---

## 1. Tables & Schema

### `properties` Table
Stores all real estate listings (rooms, flats, apartments, houses, commercial).
- `id` (UUID, Primary Key, default `gen_random_uuid()`): Unique listing identifier.
- `owner_id` (UUID, Foreign Key -> `profiles.id`): References the owner who listed the property.
- `title` (TEXT): Title of the property listing.
- `description` (TEXT): Detailed description.
- `property_type` (TEXT): `'room' | 'flat' | 'apartment' | 'house' | 'commercial'`.
- `listing_type` (TEXT): `'rent' | 'sale'`.
- `price` (NUMERIC): Price in NPR.
- `negotiable` (BOOLEAN): Price negotiable toggle.
- `address`, `city`, `district` (TEXT): Address strings in Nepal.
- `bedrooms`, `bathrooms`, `area_sqft` (NUMERIC): Space details.
- `status` (TEXT): `'available' | 'pending' | 'pending_approval' | 'rented' | 'sold' | 'rejected'`.
- `is_featured` (BOOLEAN): Featured listing flag.
- `views`, `views_count` (INTEGER): View count.
- `created_at`, `updated_at`, `expires_at` (TIMESTAMPTZ).

### `property_images` Table
Stores image URLs associated with properties.
- `id` (UUID, Primary Key, default `gen_random_uuid()`).
- `property_id` (UUID, Foreign Key -> `properties.id` ON DELETE CASCADE).
- `image_url` (TEXT): Public URL from Supabase Storage or CDN.
- `is_primary` (BOOLEAN): Primary cover image indicator.
- `created_at` (TIMESTAMPTZ).

### `property_locations` Table
Stores precise GPS coordinates, accuracy, and navigation landmarks.
- `property_id` (UUID, Primary Key, Foreign Key -> `properties.id` ON DELETE CASCADE).
- `latitude` (NUMERIC): Captured latitude coordinate.
- `longitude` (NUMERIC): Captured longitude coordinate.
- `accuracy_meters` (NUMERIC): Device GPS accuracy in meters.
- `landmark` (TEXT): Landlord's navigation instructions/landmarks.
- `maps_url` (TEXT): Google Maps directions URL.
- `captured_at`, `updated_at` (TIMESTAMPTZ).

---

## 2. Row Level Security (RLS) Policies

### `properties`
- **SELECT**: Public/authenticated visitors can SELECT listings where `status = 'available'`. Owners can always SELECT their own listings (`owner_id = auth.uid()`). Admins have full SELECT access.
- **INSERT**: Owners can INSERT listings where `owner_id = auth.uid()`.
- **UPDATE**: Owners can UPDATE listings where `owner_id = auth.uid()`.
- **DELETE**: Owners can DELETE listings where `owner_id = auth.uid()`.

### `property_images`
- **SELECT**: Anyone can view images of visible properties.
- **INSERT**: Owners can upload images for properties where `owner_id = auth.uid()`.
- **UPDATE / DELETE**: Owners can modify/delete images for properties they own.

### `property_locations`
- **SELECT**:
  - Admins can view all locations.
  - Owners can view their own property's location.
  - Room/property hunters can view location **only** if an active contact unlock exists in `contact_unlocks`.
- **INSERT / UPDATE**: Owners can save/update location for their own properties.

---

## 3. Storage Bucket: `property-images`

1. Bucket Name: `property-images` (Public: `true`).
2. Storage Policies (`storage.objects`):
   - **SELECT**: Public read access to all objects in `property-images`.
   - **INSERT**: Authenticated users (`auth.role() = 'authenticated'`) can upload image files.
   - **UPDATE / DELETE**: Authenticated users can update and delete their uploaded photos.

---

## 4. Environment Variables

The frontend connects directly using:
- `SUPABASE_URL` / `VITE_SUPABASE_URL`
- `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
