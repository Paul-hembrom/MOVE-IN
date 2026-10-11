import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  searchParams: URLSearchParams;
  propertyId: string | null;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUrl, setCurrentUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', to);
      setCurrentUrl(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Parse path and params
  const [pathname, search] = currentUrl.split('?');
  const searchParams = new URLSearchParams(search || '');

  // Extract /property/[id]
  let propertyId: string | null = null;
  const propertyMatch = pathname.match(/^\/property\/([^/]+)/);
  if (propertyMatch) {
    propertyId = propertyMatch[1];
  }

  return (
    <RouterContext.Provider
      value={{
        path: pathname || '/',
        navigate,
        searchParams,
        propertyId,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

// Reusable Link component
export const Link: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}> = ({ href, children, className, title, target, rel, onClick }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (target === '_blank') return;
    e.preventDefault();
    if (onClick) onClick();
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className} title={title} target={target} rel={rel}>
      {children}
    </a>
  );
};
