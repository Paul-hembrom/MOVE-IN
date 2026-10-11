import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../types';
import { useRouter } from '../context/RouterContext';
import { Maximize2, Minimize2, Navigation, Layers } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (property: Property | null) => void;
  className?: string;
  height?: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  className = '',
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const { navigate } = useRouter();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tileLayerType, setTileLayerType] = useState<'streets' | 'voyager'>('voyager');

  // Format price for map badge
  const formatShortPrice = (val: number) => {
    if (val >= 10000000) {
      return `रू ${(val / 10000000).toFixed(1)}Cr`;
    }
    if (val >= 100000) {
      return `रू ${(val / 100000).toFixed(1)}L`;
    }
    if (val >= 1000) {
      return `रू ${(val / 1000).toFixed(0)}K`;
    }
    return `रू ${val}`;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [27.7172, 85.324], // Kathmandu Center
        zoom: 12,
        zoomControl: false,
      });

      // Add modern CartoDB Voyager tiles (clean, beautiful, no API key needed)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle tile layer change
  const handleToggleTile = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const nextType = tileLayerType === 'voyager' ? 'streets' : 'voyager';
    const tileUrl =
      nextType === 'voyager'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    setTileLayerType(nextType);
  };

  // Render Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const validProps = properties.filter((p) => p.latitude && p.longitude);
    if (validProps.length === 0) return;

    const latLngBounds = L.latLngBounds([]);

    validProps.forEach((prop) => {
      const lat = prop.latitude!;
      const lng = prop.longitude!;
      const isSelected = selectedPropertyId === prop.id;
      const primaryImg =
        prop.images?.find((img) => img.is_primary)?.image_url ||
        prop.images?.[0]?.image_url ||
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=80';

      latLngBounds.extend([lat, lng]);

      // Custom HTML Marker Element
      const customIcon = L.divIcon({
        className: 'movein-map-marker',
        html: `
          <div class="px-2.5 py-1 rounded-full font-bold text-xs shadow-md border transition-all duration-200 cursor-pointer flex items-center gap-1 ${
            isSelected
              ? 'bg-emerald-700 text-white border-white ring-4 ring-emerald-500/40 scale-110 z-50 shadow-xl'
              : 'bg-slate-900 text-white border-emerald-500/50 hover:bg-emerald-600 hover:scale-105'
          }" style="white-space: nowrap; font-family: inherit;">
            <span>${formatShortPrice(prop.price)}</span>
          </div>
        `,
        iconSize: [60, 28],
        iconAnchor: [30, 14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup HTML
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-left max-w-[240px]';
      popupContent.innerHTML = `
        <div style="border-radius: 12px; overflow: hidden; margin-bottom: 8px; width: 100%; aspect-ratio: 16/10; background: #f1f5f9;">
          <img src="${primaryImg}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="font-weight: 800; font-size: 15px; color: #047857; margin-bottom: 2px;">
          रू ${prop.price.toLocaleString('en-IN')}${prop.listing_type === 'rent' ? '/mo' : ''}
        </div>
        <div style="font-weight: 700; font-size: 13px; color: #0f172a; line-height: 1.25; margin-bottom: 4px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
          ${prop.title}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
          📍 ${prop.address}, ${prop.city}
        </div>
        <div style="font-size: 11px; color: #334155; font-weight: 600; display: flex; gap: 8px; margin-bottom: 8px;">
          <span>🛏️ ${prop.bedrooms} Bed</span>
          <span>🚿 ${prop.bathrooms} Bath</span>
          <span>📐 ${prop.area_sqft} sqft</span>
        </div>
        <button id="view-prop-btn-${prop.id}" style="width: 100%; padding: 6px 12px; background: #059669; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; text-align: center;">
          View Details →
        </button>
      `;

      // Attach button listener on popup open
      marker.bindPopup(popupContent, {
        offset: [0, -10],
        maxWidth: 260,
        className: 'movein-leaflet-popup',
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-prop-btn-${prop.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            navigate(`/property/${prop.id}`);
          };
        }
      });

      marker.on('click', () => {
        onSelectProperty?.(prop);
      });

      markersRef.current[prop.id] = marker;
    });

    // Fit map bounds to show all markers
    if (validProps.length > 0) {
      if (validProps.length === 1) {
        map.setView([validProps[0].latitude!, validProps[0].longitude!], 14, {
          animate: true,
        });
      } else {
        map.fitBounds(latLngBounds, { padding: [50, 50], maxZoom: 15, animate: true });
      }
    }
  }, [properties, selectedPropertyId]);

  // Recenter helper
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const validProps = properties.filter((p) => p.latitude && p.longitude);
    if (validProps.length > 0) {
      const bounds = L.latLngBounds(validProps.map((p) => [p.latitude!, p.longitude!]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView([27.7172, 85.324], 12);
    }
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 transition-all ${className} ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      }`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
    >
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls Top-Right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="p-2.5 rounded-2xl bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 transition-all backdrop-blur-xs hover:text-emerald-700"
          title="Recenter Map"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleTile}
          className="p-2.5 rounded-2xl bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 transition-all backdrop-blur-xs hover:text-emerald-700"
          title={`Switch to ${tileLayerType === 'voyager' ? 'OpenStreetMap' : 'Voyager'} tile`}
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-2xl bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 transition-all backdrop-blur-xs hover:text-emerald-700"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Property Counter Badge Top-Left */}
      <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-white/10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{properties.length} Properties Located</span>
      </div>
    </div>
  );
};
