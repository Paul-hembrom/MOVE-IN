import React, { useState } from 'react';
import { PropertyImage } from '../types';
import { ChevronLeft, ChevronRight, Maximize, X } from 'lucide-react';

interface ImageGalleryProps {
  images?: PropertyImage[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [], title }) => {
  const fallbackImage =
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';

  const imageList = images && images.length > 0
    ? images
    : [{ id: 'fallback', property_id: '', image_url: fallbackImage, is_primary: true }];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Main Image Showcase */}
      <div
        className="relative w-full aspect-16/10 sm:aspect-16/9 rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer shadow-md"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={imageList[activeIndex]?.image_url || fallbackImage}
          alt={`${title} - Photo ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Gallery Overlay Controls */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/80 text-white backdrop-blur-xs transition-colors opacity-90 hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/80 text-white backdrop-blur-xs transition-colors opacity-90 hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Bar inside image */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="bg-slate-950/70 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-xs">
            {activeIndex + 1} / {imageList.length}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-white backdrop-blur-xs transition-colors"
            title="Expand Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {imageList.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden transition-all ${
                activeIndex === idx
                  ? 'ring-2 ring-emerald-500 scale-102 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.image_url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {imageList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageList[activeIndex]?.image_url}
              alt={title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white/80 text-sm mt-3 font-medium">
              {title} ({activeIndex + 1} of {imageList.length})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
