import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or custom local storage settings
export const getSupabaseConfig = () => {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};

  // Standard safe environment variable configuration
  const url =
    env.SUPABASE_URL ||
    (typeof process !== 'undefined' ? (process.env?.SUPABASE_URL as string | undefined) : '') ||
    (typeof window !== 'undefined' ? localStorage.getItem('movein_supabase_url') : '') ||
    '';

  const anonKey =
    env.SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' ? (process.env?.SUPABASE_ANON_KEY as string | undefined) : '') ||
    (typeof window !== 'undefined' ? localStorage.getItem('movein_supabase_anon_key') : '') ||
    '';

  return {
    url: url.trim(),
    anonKey: anonKey.trim(),
  };
};

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  // Basic validation that url looks like an http URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedUrl = url;
    cachedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && (url.startsWith('http://') || url.startsWith('https://')));
};

export const saveCustomSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('movein_supabase_url', url.trim());
    else localStorage.removeItem('movein_supabase_url');

    if (anonKey) localStorage.setItem('movein_supabase_anon_key', anonKey.trim());
    else localStorage.removeItem('movein_supabase_anon_key');

    cachedClient = null;
    cachedUrl = '';
    cachedKey = '';
  }
};
