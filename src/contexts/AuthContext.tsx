'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthError {
  message: string;
  code?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
        }
        
        console.log('AuthProvider: Session:', currentSession ? 'found' : 'not found');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (err) {
        console.error('AuthProvider: Failed to initialize:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, currentSession: Session | null) => {
      console.log('AuthProvider: Auth state changed:', event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('AuthContext: Signing in...', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('AuthContext: Sign in error:', error);
        return { error: { message: error.message, code: error.code || 'unknown' } };
      }

      console.log('AuthContext: Sign in success:', data.user?.email);
      setSession(data.session);
      setUser(data.user);
      return { error: null };
    } catch (err: any) {
      console.error('AuthContext: Sign in exception:', err);
      return { error: { message: err?.message || 'Failed to sign in', code: 'exception' } };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    console.log('AuthContext: Signing up...', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || undefined,
          },
        },
      });

      if (error) {
        console.error('AuthContext: Sign up error:', error);
        console.error('Error type:', error.constructor?.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error status:', error.status);
        
        // Return error with all details
        return { 
          error: { 
            message: error.message, 
            code: error.code || 'unknown',
            status: error.status,
            __isAuthError: true,
            raw: error
          } 
        };
      }

      console.log('AuthContext: Sign up success:', data.user?.email);
      
      // If auto-confirm is enabled, user might be signed in already
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
      
      return { error: null };
    } catch (err: any) {
      console.error('AuthContext: Sign up exception:', err);
      console.error('Exception type:', typeof err);
      console.error('Exception:', err?.toString?.() || String(err));
      return { error: { message: err?.message || String(err) || 'Failed to sign up', code: 'exception' } };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    console.log('AuthContext: Signing in with Google...');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback`
            : '/auth/callback',
        },
      });

      if (error) {
        console.error('AuthContext: Google sign in error:', error);
        return { error: { message: error.message, code: error.code || 'unknown' } };
      }

      return { error: null };
    } catch (err: any) {
      console.error('AuthContext: Google sign in exception:', err);
      return { error: { message: err?.message || 'Failed to sign in with Google', code: 'exception' } };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('AuthContext: Signing out...');
    
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('AuthContext: Sign out error:', error);
        return { error: { message: error.message } };
      }

      setSession(null);
      setUser(null);
      return { error: null };
    } catch (err: any) {
      console.error('AuthContext: Sign out exception:', err);
      return { error: { message: err?.message || 'Failed to sign out' } };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    console.log('AuthContext: Resetting password...', email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/auth/reset-password`
          : '/auth/reset-password',
      });

      if (error) {
        console.error('AuthContext: Reset password error:', error);
        return { error: { message: error.message, code: error.code || 'unknown' } };
      }

      return { error: null };
    } catch (err: any) {
      console.error('AuthContext: Reset password exception:', err);
      return { error: { message: err?.message || 'Failed to send reset email', code: 'exception' } };
    }
  }, []);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}
