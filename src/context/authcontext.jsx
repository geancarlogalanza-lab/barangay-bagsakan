import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchUserRole(session.user);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setUser(session.user);
          await fetchUserRole(session.user);
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  async function fetchUserRole(user) {
    try {
      // Check if user exists in users table
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setRole(data.role);
        console.log('User role:', data.role);
        return;
      }

      // If user not in users table, check if email is in admin list
      const adminEmails = [
        'geancarlo.galanza@benilde.edu.ph',
        'alexmtuazon2006@gmail.com',
        'maynardvincent.arrardaza@benilde.edu.ph'
      ];

      let defaultRole = 'donor';
      if (adminEmails.includes(user.email)) {
        defaultRole = 'admin';
      }

      // Insert user into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ 
          id: user.id, 
          email: user.email, 
          role: defaultRole 
        }]);

      if (insertError) {
        console.error('Error creating user:', insertError);
        setRole(defaultRole);
      } else {
        setRole(defaultRole);
      }
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      setRole('donor');
    }
  }

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