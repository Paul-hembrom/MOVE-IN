import React from 'react';
import { Property } from '../types';
import { StatusBadge } from './StatusBadge';
import { VerificationBadge } from './VerificationBadge';
import { MapPin, Bed, Bath, Maximize2, Tag, Sparkles, Eye } from 'lucide-react';
import { Link } from '../context/RouterContext';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const primaryImage =
    property.images?.find((img) => img.is_primary)?.image_url ||
    property.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  const viewCount = property.views ?? property.views_count ?? 120;

  const formatPrice = (val: number, listingType: string) => {
    if (val >= 10000000) {
      return `रू ${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `रू ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `रू ${val.toLocaleString('en-IN')}${listingType === 'rent' ? '/mo' : ''}`;
  };

  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden relative ${
        property.is_featured
          ? 'border-amber-400/90 shadow-md hover:shadow-xl hover:border-amber-500 ring-1 ring-amber-400/30'
          : 'border-slate-200/80 hover:border-emerald-500/40 shadow-sm hover:shadow-xl'
      }`}
    >
      {/* Image Thumbnail & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {property.is_featured && (
            <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md flex items-center gap-1 backdrop-blur-xs tracking-wide">
              <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950" />
              Featured
            </span>
          )}
          <VerificationBadge
            isPlatformVerified={property.is_platform_verified}
            isSelfVerified={property.is_self_verified}
            size="sm"
          />
          <StatusBadge status={property.status} size="sm" />
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-900/80 text-white backdrop-blur-xs uppercase tracking-wider">
            {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* View Count Badge on Top Right */}
        <div className="absolute top-3 right-3 bg-slate-950/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
          <Eye className="w-3 h-3 text-cyan-300" />
          <span>{viewCount}</span>
        </div>

        {property.negotiable && (
          <div className="absolute bottom-3 left-3 bg-emerald-600/95 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 backdrop-blur-xs">
            <Tag className="w-3 h-3" />
            <span>Negotiable</span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-slate-950/75 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-xs capitalize">
          {property.property_type}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Price */}
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {formatPrice(property.price, property.listing_type)}
          </span>
          <span className="text-xs text-slate-700 font-medium capitalize">
            {property.city}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/property/${property.id}`}
          className="block group-hover:text-emerald-700 transition-colors"
        >
          <h3 className="text-base font-semibold text-slate-900 line-clamp-1 mb-2">
            {property.title}
          </h3>
        </Link>

        {/* Address */}
        <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-4 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{property.address}, {property.city}</span>
        </div>

        {/* Specs footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-cyan-600" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-cyan-600" />
            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-600" />
            <span>{property.area_sqft} sqft</span>
          </div>
        </div>

        {/* CTA Link */}
        <div className="mt-4 pt-2">
          <Link
            href={`/property/${property.id}`}
            className="w-full text-center py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
