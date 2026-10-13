import React, { createContext, useContext, useState, useEffect } from 'react';
import { NEPAL_CITIES, CITY_DISPLAY_LABELS, isCityMatch } from '../constants/cities';

interface CityContextType {
  selectedCity: string; // 'All' or city name e.g. 'Kathmandu'
  selectedCityLabel: string; // 'All Nepal' or formatted city name
  setSelectedCity: (city: string) => void;
  clearCity: () => void;
  matchesSelectedCity: (propertyCity?: string) => boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

const STORAGE_CITY_KEY = 'movein_selected_city';

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    // 1. Check URL query params first if available
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCity = urlParams.get('city');
        if (urlCity) {
          const matched = NEPAL_CITIES.find(
            (c) => c.toLowerCase() === urlCity.toLowerCase()
          );
          if (matched) return matched;
          if (urlCity.toLowerCase() === 'all' || urlCity.toLowerCase() === 'all nepal') {
            return 'All';
          }
        }
      } catch {
        // ignore
      }

      // 2. Check localStorage
      try {
        const saved = localStorage.getItem(STORAGE_CITY_KEY);
        if (saved && (saved === 'All' || NEPAL_CITIES.includes(saved as any))) {
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return 'All';
  });

  const setSelectedCity = (city: string) => {
    const normalized =
      !city || city === 'All' || city === 'All Nepal'
        ? 'All'
        : NEPAL_CITIES.find((c) => c.toLowerCase() === city.toLowerCase()) || city;

    setSelectedCityState(normalized);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_CITY_KEY, normalized);
      } catch {
        // ignore
      }

      // If user is currently on /propertyview, sync the URL without reloading
      try {
        const url = new URL(window.location.href);
        if (url.pathname.startsWith('/propertyview')) {
          if (normalized === 'All') {
            url.searchParams.delete('city');
          } else {
            url.searchParams.set('city', normalized);
          }
          window.history.replaceState({}, '', url.toString());
        }
      } catch {
        // ignore
      }
    }
  };

  const clearCity = () => {
    setSelectedCity('All');
  };

  // Sync if back/forward button or URL changes
  useEffect(() => {
    const handlePopState = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCity = urlParams.get('city');
        if (urlCity) {
          setSelectedCity(urlCity);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectedCityLabel =
    selectedCity === 'All' || !selectedCity
      ? 'All Nepal'
      : CITY_DISPLAY_LABELS[selectedCity] || selectedCity;

  const matchesSelectedCity = (propertyCity?: string) => {
    return isCityMatch(propertyCity, selectedCity);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        selectedCityLabel,
        setSelectedCity,
        clearCity,
        matchesSelectedCity,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
