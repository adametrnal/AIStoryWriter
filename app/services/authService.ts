import { supabase } from './supabase';
import { router } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

// Create a store for auth state
interface AuthStore {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

// Create context for auth state
export const AuthContext = createContext<{
  session: Session | null;
  setSession: (session: Session | null) => void;
}>({
  session: null,
  setSession: () => {},
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const authService = {
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    router.push('/');
  },

  // You can add other auth-related functions here
  // async signIn() {...}
  // async signUp() {...}
  // async resetPassword() {...}
};