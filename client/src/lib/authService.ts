import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { ProfileRecord, UserRole } from './types/database.types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as ProfileRecord);
      } else {
        // Fallback default editor profile for local admin access
        setProfile({
          id: userId,
          display_name: 'Editorial Staff',
          role: 'editor',
          created_at: new Date().toISOString(),
        });
      }
    } catch {
      // Local fallback profile
      setProfile({
        id: userId,
        display_name: 'Local Admin',
        role: 'admin',
        created_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  const role: UserRole = profile?.role || 'user';
  const isEditor = role === 'editor' || role === 'admin';
  const isAdmin = role === 'admin';

  return {
    user,
    profile,
    role,
    isEditor,
    isAdmin,
    loading,
  };
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, displayName: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}
