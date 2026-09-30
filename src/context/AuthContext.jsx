import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

const ADMIN_EMAILS = [
  'geancarlo.galanza@benilde.edu.ph',
  'alexmtuazon2006@gmail.com',
  'maynardvincent.arrardaza@benilde.edu.ph'
];

async function fetchUserRole(userId, email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (data?.role) {
      return data.role;
    }

    // No profile row yet: admins listed above get admin access; everyone else
    // is a donor. RLS only lets users create their own row as a donor, so admin
    // and volunteer rows are assigned in the database.
    if (ADMIN_EMAILS.includes(email)) {
      return 'admin';
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id: userId, email, role: 'donor' }]);

    if (insertError) {
      console.error('Error creating user:', insertError);
    }

    return 'donor';
  } catch (err) {
    console.error('Error in fetchUserRole:', err);
    return 'donor';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roleState, setRoleState] = useState({ userId: null, role: null });
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSessionChecked(true);
    });

    // Keep this callback synchronous: awaiting other Supabase calls inside
    // onAuthStateChange can deadlock the auth client. The role is loaded below.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionChecked(true);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const userId = user?.id;
  const userEmail = user?.email;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    fetchUserRole(userId, userEmail).then((fetchedRole) => {
      if (!cancelled) setRoleState({ userId, role: fetchedRole });
    });

    return () => {
      cancelled = true;
    };
  }, [userId, userEmail]);

  // Only trust a role fetched for the current user.
  const role = userId && roleState.userId === userId ? roleState.role : null;

  // Stay in the loading state until the role is known, so role-protected pages
  // are not redirected away while the role is still being fetched.
  const loading = !sessionChecked || (!!user && role === null);

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  const value = {
    user,
    role,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: role === 'admin',
    isDonor: role === 'donor',
    isVolunteer: role === 'volunteer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
