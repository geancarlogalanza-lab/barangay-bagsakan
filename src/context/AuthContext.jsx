import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, full_name, contact_number, organization')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error loading profile:', error);
  }

  // Profiles are created by a database trigger at sign-up; fall back to a
  // donor view if the row is missing so the app still opens.
  return data || { id: userId, role: 'donor', full_name: null };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileState, setProfileState] = useState({ userId: null, profile: null });
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSessionChecked(true);
    });

    // Keep this callback synchronous: awaiting other Supabase calls inside
    // onAuthStateChange can deadlock the auth client. The profile loads below.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionChecked(true);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    fetchProfile(userId).then((profile) => {
      if (!cancelled) setProfileState({ userId, profile });
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Only trust a profile fetched for the current user
  const profile = userId && profileState.userId === userId ? profileState.profile : null;
  const role = profile?.role ?? null;

  // Stay in the loading state until the role is known, so role-protected pages
  // are not redirected away while the profile is still being fetched.
  const loading = !sessionChecked || (!!user && !profile);

  async function signUp({ email, password, fullName, role: chosenRole, contactNumber, organization }) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        // Read by the handle_new_user trigger to create the profile rows
        data: {
          full_name: fullName,
          role: chosenRole,
          contact_number: contactNumber,
          organization: organization || null,
        },
      },
    });
  }

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  const value = {
    user,
    profile,
    role,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: role === 'admin',
    isDonor: role === 'donor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
