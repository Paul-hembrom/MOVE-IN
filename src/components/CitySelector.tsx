import React, { useState, useRef, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import { NEPAL_CITIES, POPULAR_CITIES, CITY_DISPLAY_LABELS } from '../constants/cities';
import { MapPin, ChevronDown, Check, Search, X, Globe } from 'lucide-react';

export const CitySelector: React.FC = () => {
  const { selectedCity, selectedCityLabel, setSelectedCity } = useCity();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredCities = NEPAL_CITIES.filter((city) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const label = (CITY_DISPLAY_LABELS[city] || city).toLowerCase();
    return city.toLowerCase().includes(query) || label.includes(query);
  });

  const handleSelect = (city: string) => {
    setSelectedCity(city);
    setIsOpen(false);
    setSearchQuery('');
  };

  const isAllSelected = selectedCity === 'All' || !selectedCity;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Compact Location Button in Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
            : isAllSelected
            ? 'bg-slate-50/90 hover:bg-slate-100/90 border-slate-200/90 text-slate-800'
            : 'bg-emerald-50/90 hover:bg-emerald-100/90 border-emerald-300 text-emerald-900 shadow-2xs'
        }`}
        title="Select city to filter properties"
        aria-label={`Current location: ${selectedCityLabel}. Click to change city.`}
      >
        <div className="flex items-center justify-center shrink-0">
          <MapPin
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isAllSelected ? 'text-slate-500' : 'text-emerald-600'
            }`}
          />
        </div>

        <div className="flex flex-col text-left leading-tight">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 hidden sm:block">
            Location
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[85px] xs:max-w-[110px] sm:max-w-[140px] md:max-w-[160px]">
            {selectedCityLabel}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Dropdown / Popover Sheet */}
      {isOpen && (
        <>
          {/* Backdrop on mobile for sheet feel */}
          <div
            className="fixed inset-0 bg-slate-900/40 z-40 sm:hidden backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="fixed inset-x-3 bottom-3 sm:bottom-auto sm:inset-x-auto sm:absolute sm:top-full sm:left-0 sm:mt-2 w-auto sm:w-[380px] bg-white rounded-3xl sm:rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[460px] animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Popover Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                    Select City in Nepal
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                  aria-label="Close city picker"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search input inside picker */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search city (e.g. Kathmandu, Pokhara, Butwal)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List Body */}
            <div className="overflow-y-auto p-2 sm:p-3 divide-y divide-slate-100 scrollbar-thin">
              {/* Option 1: "All Nepal" */}
              <div className="pb-2">
                <button
                  type="button"
                  onClick={() => handleSelect('All')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isAllSelected
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isAllSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                        <span>All Nepal</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100/70 text-emerald-800">
                          Nationwide
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Show properties across every city
                      </span>
                    </div>
                  </div>
                  {isAllSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              </div>

              {/* Popular Quick Pills (when not filtering) */}
              {!searchQuery && (
                <div className="py-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Popular Hubs
                  </span>
                  <div className="flex flex-wrap gap-1.5 px-0.5">
                    {POPULAR_CITIES.map((c) => {
                      const isActive = selectedCity === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleSelect(c)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Cities List */}
              <div className="pt-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                  {searchQuery ? 'Search Results' : 'All Major Cities'}
                </span>

                {filteredCities.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No cities matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {filteredCities.map((city) => {
                      const isSelected = selectedCity === city;
                      const displayLabel = CITY_DISPLAY_LABELS[city] || city;
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleSelect(city)}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs sm:text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MapPin
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{displayLabel}</span>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
