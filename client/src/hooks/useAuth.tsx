import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.error('Supabase is not properly configured. Authentication will not work.');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Authentication service is not properly configured. Please contact support.",
        variant: "destructive",
      });
      throw new Error('Supabase not configured');
    }

    try {
      console.log('Attempting to sign up with:', { email, fullName });
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        console.error('Sign up error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        }
        
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        throw error;
      }

      if (data?.user) {
        console.log('Sign up successful, confirmation email sent to:', data.user.email);
      }

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      if (!error.message.includes('User already registered')) {
        toast({
          title: "Error",
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: "destructive",
        });
      }
      
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Authentication service is not properly configured. Please contact support.",
        variant: "destructive",
      });
      throw new Error('Supabase not configured');
    }

    try {
      console.log('Attempting to sign in with:', { email, supabaseUrl: import.meta.env.VITE_SUPABASE_URL });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('Sign in response:', { data, error });

      if (error) {
        console.error('Authentication error:', error);
        
        // Handle specific error cases
        let errorMessage = error.message;
        
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email. Please sign up first.';
        }
        
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        throw error;
      }
      
      if (data?.user) {
        console.log('Sign in successful:', data.user.email);
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
      }
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Don't show toast again if we already showed it above
      if (!error.message.includes('Email not confirmed') && 
          !error.message.includes('Invalid login credentials') &&
          !error.message.includes('Email rate limit exceeded') &&
          !error.message.includes('User not found')) {
        toast({
          title: "Error",
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: "destructive",
        });
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      // If Supabase isn't configured, just clear the user state locally
      setUser(null);
      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      setUser(null);
      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Force local logout if remote logout fails
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out locally.",
      });
    }
  };

  const resendConfirmation = async (email: string) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Authentication service is not properly configured.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Resending confirmation email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Confirmation email resent! Please check your email.",
      });
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to resend confirmation email.',
        variant: "destructive",
      });
    }
  };

  const checkUserExists = async (email: string) => {
    try {
      // This is a workaround to check if user exists
      // We'll try to reset password - if user doesn't exist, it will fail
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin,
      });
      
      // If no error, user exists
      return !error;
    } catch (error) {
      return false;
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    checkUserExists,
  };
}
