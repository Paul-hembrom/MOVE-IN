import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types';
import { INITIAL_PROFILES } from '../lib/mockData';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  isLiveSupabase: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_STORAGE = 'movein_auth_user';

export const SUPERADMIN_EMAIL = 'alphanexora38@gmail.com';

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    checkCurrentSession();
  }, []);

  const enforceSuperAdminRole = (profile: Profile): Profile => {
    if (isSuperAdminEmail(profile.email)) {
      return {
        ...profile,
        role: 'admin',
      };
    }
    return profile;
  };

  const checkCurrentSession = async () => {
    setLoading(true);
    const live = isSupabaseConfigured();
    setIsLive(live);
    const client = getSupabaseClient();

    if (live && client) {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          // Fetch profile
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const adjusted = enforceSuperAdminRole(profile as Profile);
            setUser(adjusted);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase auth check error:', err);
      }
    }

    // Local storage session check
    try {
      const stored = localStorage.getItem(CURRENT_USER_STORAGE);
      if (stored) {
        const parsed = JSON.parse(stored);
        const adjusted = enforceSuperAdminRole(parsed);
        setUser(adjusted);
      } else {
        // Default to null or guest
        setUser(null);
      }
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email: string, password?: string) => {
    const client = getSupabaseClient();

    if (isSupabaseConfigured() && client && password) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile, error: profileErr } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile && !profileErr) {
            const adjusted = enforceSuperAdminRole(profile as Profile);
            setUser(adjusted);
            localStorage.setItem(CURRENT_USER_STORAGE, JSON.stringify(adjusted));
            showToast(`Welcome back, ${adjusted.full_name}!`, 'success');
            return { success: true };
          }
        }
      } catch (err: any) {
        console.warn('Supabase login exception, checking local accounts:', err);
      }
    }

    // Local fallback check
    const localProfilesRaw = localStorage.getItem('movein_local_profiles');
    const localProfiles: Profile[] = localProfilesRaw
      ? JSON.parse(localProfilesRaw)
      : INITIAL_PROFILES;

    const matched = localProfiles.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matched) {
      const adjusted = enforceSuperAdminRole(matched);
      setUser(adjusted);
      localStorage.setItem(CURRENT_USER_STORAGE, JSON.stringify(adjusted));
      showToast(`Logged in as ${adjusted.full_name} (${adjusted.role})`, 'success');
      return { success: true };
    }

    // Create an ad-hoc session if unknown (admin if superadmin email)
    const assignedRole: UserRole = isSuperAdminEmail(email) ? 'admin' : 'hunter';
    const newDemoUser: Profile = {
      id: 'usr-' + Date.now(),
      email: email.trim(),
      full_name: email.split('@')[0] || 'User',
      role: assignedRole,
      created_at: new Date().toISOString(),
    };
    setUser(newDemoUser);
    localStorage.setItem(CURRENT_USER_STORAGE, JSON.stringify(newDemoUser));
    showToast(`Welcome, ${newDemoUser.full_name}!`, 'success');
    return { success: true };
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    phone?: string
  ) => {
    const effectiveRole: UserRole = isSuperAdminEmail(email) ? 'admin' : role;
    const client = getSupabaseClient();

    if (isSupabaseConfigured() && client) {
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: effectiveRole, phone },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            email,
            full_name: fullName,
            role: effectiveRole,
            phone,
            created_at: new Date().toISOString(),
          };

          // Try inserting into profiles table
          await client.from('profiles').upsert([newProfile]);
          setUser(newProfile);
          localStorage.setItem(CURRENT_USER_STORAGE, JSON.stringify(newProfile));
          showToast(`Account created successfully for ${fullName}!`, 'success');
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase sign up error, registering locally:', err);
      }
    }

    // Local registration
    const newLocalUser: Profile = {
      id: 'usr-' + Date.now(),
      email: email.trim(),
      full_name: fullName.trim(),
      role: effectiveRole,
      phone: phone?.trim(),
      created_at: new Date().toISOString(),
    };

    const localProfilesRaw = localStorage.getItem('movein_local_profiles');
    const localProfiles: Profile[] = localProfilesRaw
      ? JSON.parse(localProfilesRaw)
      : INITIAL_PROFILES;

    const updated = [newLocalUser, ...localProfiles];
    localStorage.setItem('movein_local_profiles', JSON.stringify(updated));
    setUser(newLocalUser);
    localStorage.setItem(CURRENT_USER_STORAGE, JSON.stringify(newLocalUser));
    showToast(`Welcome to Move-In, ${fullName}! Account created.`, 'success');
    return { success: true };
  };

  const logout = async () => {
    const client = getSupabaseClient();
    if (isSupabaseConfigured() && client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }

    setUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE);
    showToast('You have been logged out.', 'info');
  };

  const quickLogin = async (role: UserRole) => {
    const target = INITIAL_PROFILES.find((p) => p.role === role) || INITIAL_PROFILES[0];
    setUser(target);
    localStorage.setItem(CURRENT_USER_STORAGE, JSON.stringify(target));
    showToast(`Logged in as ${target.full_name} (${target.role.toUpperCase()})`, 'success');
  };

  const refreshProfile = async () => {
    await checkCurrentSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLiveSupabase: isLive,
        login,
        register,
        logout,
        quickLogin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
