import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type {
  AuthContextType,
  SignUpData,
  SignInData,
  PhoneSignUpData,
  PhoneSignInData,
  PhoneVerifyData,
  EmailVerifyData,
  Profile,
  ProfileUpdate,
} from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the application and provides authentication context
 * 
 * Features:
 * - Automatic session management and token refresh
 * - Profile synchronization with auth state
 * - Multi-tab logout synchronization
 * - Comprehensive error handling
 * - Optimistic UI updates for profile changes
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);

  /**
   * Fetches user profile from database including roles and role-specific details
   * Uses direct fetch to avoid Supabase client timeout issues
   */
  const fetchProfile = useCallback(async (userId: string): Promise<void> => {
    const isDev = import.meta.env.DEV;
    try {
      if (isDev) console.log('👤 Fetching profile for user:', userId);

      // First fetch the core profile - this must succeed
      if (isDev) console.log('📍 Step 1: Fetching profiles table...');

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      // Race against the timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (isDev) console.log('📍 Step 1 done:', profileError ? 'ERROR' : 'OK');

      if (profileError || !profileData) {
        console.warn('⚠️ Profile not found, creating minimal profile...', profileError);
        await createMinimalProfile(userId);
        return;
      }

      // Fetch additional data - these are optional and may not exist
      let rolesData: any[] = [];
      let sellerData = null;
      let buyerData = null;
      let franchisorData = null;
      let franchiseeData = null;
      let advisorData = null;

      if (isDev) console.log('📍 Step 2: Fetching profile_roles...');
      try {
        const { data, error } = await supabase.from('profile_roles').select('*').eq('profile_id', userId);
        rolesData = data || [];
        if (isDev) console.log('📍 Step 2 done:', error ? 'ERROR' : `OK (${rolesData.length} roles)`);
      } catch (e) {
        if (isDev) console.warn('profile_roles fetch failed:', e);
      }

      if (isDev) console.log('📍 Step 3: Fetching seller_details...');
      try {
        const { data } = await supabase.from('seller_details').select('*').eq('profile_id', userId).maybeSingle();
        sellerData = data;
        if (isDev) console.log('📍 Step 3 done');
      } catch (e) { if (isDev) console.log('📍 Step 3 skipped'); }

      if (isDev) console.log('📍 Step 4: Fetching buyer_details...');
      try {
        const { data } = await supabase.from('buyer_details').select('*').eq('profile_id', userId).maybeSingle();
        buyerData = data;
        if (isDev) console.log('📍 Step 4 done');
      } catch (e) { if (isDev) console.log('📍 Step 4 skipped'); }

      if (isDev) console.log('📍 Step 5: Fetching franchisor_details...');
      try {
        const { data } = await supabase.from('franchisor_details').select('*').eq('profile_id', userId).maybeSingle();
        franchisorData = data;
        if (isDev) console.log('📍 Step 5 done');
      } catch (e) { if (isDev) console.log('📍 Step 5 skipped'); }

      if (isDev) console.log('📍 Step 6: Fetching franchisee_details...');
      try {
        const { data } = await supabase.from('franchisee_details').select('*').eq('profile_id', userId).maybeSingle();
        franchiseeData = data;
        if (isDev) console.log('📍 Step 6 done');
      } catch (e) { if (isDev) console.log('📍 Step 6 skipped'); }

      if (isDev) console.log('📍 Step 7: Fetching advisor_details...');
      try {
        const { data } = await supabase.from('advisor_details').select('*').eq('profile_id', userId).maybeSingle();
        advisorData = data;
        if (isDev) console.log('📍 Step 7 done');
      } catch (e) { if (isDev) console.log('📍 Step 7 skipped'); }

      if (isDev) console.log('📍 Step 8: Building extended profile...');
      // Build extended profile with roles and details
      const extendedProfile = {
        ...profileData,
        roles: rolesData,
        seller_details: sellerData,
        buyer_details: buyerData,
        franchisor_details: franchisorData,
        franchisee_details: franchiseeData,
        advisor_details: advisorData,
      };

      if (isDev) console.log('✅ Profile fetched with roles:', extendedProfile.display_name, 'Roles:', rolesData?.map((r: any) => r.role));
      setProfile(extendedProfile);
      setProfileMissing(false);
      setLoading(false); // Important: stop loading spinner
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error);
      console.warn('⚠️ Creating minimal profile after fetch error...');
      await createMinimalProfile(userId);
    }
  }, []);

  /**
   * Creates a minimal profile for users who don't have one
   * Sets profileMissing flag to redirect them to profile setup
   */
  const createMinimalProfile = async (userId: string): Promise<void> => {
    try {
      console.log('📝 Creating minimal profile for user:', userId);

      // Get user data from auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        console.error('❌ No auth user found');
        setLoading(false);
        return;
      }

      const minimalProfile = {
        id: userId,
        email: authUser.email || null,
        display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User',
        role: authUser.user_metadata?.role || 'buyer',
        phone: authUser.phone || authUser.user_metadata?.phone || null,
      };

      // Try to insert the profile
      const { data, error } = await supabase
        .from('profiles')
        .upsert(minimalProfile, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating minimal profile:', error);
        setProfileMissing(true);
        setLoading(false);
        return;
      }

      console.log('✅ Minimal profile created:', data);
      setProfile(data as Profile);
      setProfileMissing(true); // Flag that user needs to complete profile
      setLoading(false);
    } catch (error) {
      console.error('❌ Exception creating minimal profile:', error);
      setProfileMissing(true);
      setLoading(false);
    }
  };

  /**
   * Initialize auth state and set up auth state listener
   */
  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        // Create a timeout promise for session fetch
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
        );

        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]) as any;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Don't wait for profile - fetch in background
          fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        // Set loading to false immediately - don't wait for profile
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          await fetchProfile(session.user.id);
        } catch (error) {
          console.error('❌ Failed to fetch profile in auth listener:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /**
   * Multi-tab logout synchronization
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.token' && !e.newValue) {
        // Session was cleared in another tab
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Sign up a new user
   */
  const signUp = async (data: SignUpData): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
            role: data.role,
            phone: data.phone || null,
          },
        },
      });

      if (authError) throw authError;

      // If user is created but email confirmation is enabled, profile won't be created yet
      // Create profile manually as fallback
      if (authData.user && !authData.session) {
        // Email confirmation is enabled, wait for user to confirm
        console.log('Email confirmation required. Please check your email.');
      } else if (authData.user) {
        // Auto sign-in is enabled, ensure profile exists
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!existingProfile) {
          console.log('Creating profile manually for user:', authData.user.id);
          const profileData: any = {
            id: authData.user.id,
            email: authData.user.email!,
            display_name: data.displayName,
            role: data.role,
          };

          // Add phone if provided
          if (data.phone) {
            profileData.phone = data.phone;
          }

          const { error: insertError } = await supabase.from('profiles').insert(profileData);

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }

        // Fetch the profile
        await fetchProfile(authData.user.id);
      }

      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Sign in an existing user
   */
  const signIn = async (data: SignInData): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      console.log('🔑 SignIn called for:', data.email);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('❌ Auth error from Supabase:', authError);
        throw authError;
      }

      console.log('✅ Auth successful! User:', authData.user?.id);
      console.log('✅ Session:', authData.session ? 'Active' : 'None');

      // Profile will be fetched automatically by the auth state change listener
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      console.error('❌ SignIn exception:', authError);
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;

      // Clear state
      setUser(null);
      setProfile(null);
      setSession(null);

      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Sign up with phone number using Authentication Hook method
   */
  const signUpWithPhone = async (data: PhoneSignUpData): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      const { error: authError } = await supabase.auth.signUp({
        phone: data.phone,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
            role: data.role,
          },
        },
      });

      if (authError) throw authError;

      // OTP will be sent to the phone number
      // User needs to verify using verifyOTP method
      console.log('📱 OTP sent to phone:', data.phone);

      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Sign in with phone number and password
   */
  const signInWithPhone = async (data: PhoneSignInData): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      console.log('🔑 SignIn with phone called for:', data.phone);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        phone: data.phone,
        password: data.password,
      });

      if (authError) {
        console.error('❌ Auth error from Supabase:', authError);
        throw authError;
      }

      console.log('✅ Phone auth successful! User:', authData.user?.id);
      console.log('✅ Session:', authData.session ? 'Active' : 'None');

      // Profile will be fetched automatically by the auth state change listener
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      console.error('❌ SignIn with phone exception:', authError);
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Verify OTP for phone authentication
   */
  const verifyOTP = async (data: PhoneVerifyData): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      console.log('🔐 Verifying OTP for phone:', data.phone);

      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        phone: data.phone,
        token: data.token,
        type: 'sms',
      });

      if (authError) {
        console.error('❌ OTP verification error:', authError);
        throw authError;
      }

      console.log('✅ OTP verified successfully! User:', authData.user?.id);

      // Check if profile exists, create if not
      if (authData.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!existingProfile) {
          console.log('Creating profile for phone user:', authData.user.id);
          const { error: insertError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            phone: authData.user.phone!,
            display_name: authData.user.user_metadata?.display_name || 'User',
            role: authData.user.user_metadata?.role || 'buyer',
          });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }

        // Fetch the profile
        await fetchProfile(authData.user.id);
      }

      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      console.error('❌ Verify OTP exception:', authError);
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Resend OTP to phone number
   */
  const resendOTP = async (phone: string): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      console.log('📱 Resending OTP to:', phone);

      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (authError) {
        console.error('❌ Resend OTP error:', authError);
        throw authError;
      }

      console.log('✅ OTP resent successfully');
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      console.error('❌ Resend OTP exception:', authError);
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Sign in with email (OTP-based)
   */
  const signInWithEmail = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      console.log('📧 Sending OTP to email:', email);

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (authError) {
        console.error('❌ Email OTP error:', authError);
        throw authError;
      }

      console.log('✅ OTP sent to email successfully');
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      console.error('❌ Email OTP exception:', authError);
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Verify OTP for email authentication
   */
  const verifyEmailOTP = async (data: EmailVerifyData): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      console.log('🔐 Verifying email OTP for:', data.email);

      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        email: data.email,
        token: data.token,
        type: 'email',
      });

      if (authError) {
        console.error('❌ Email OTP verification error:', authError);
        throw authError;
      }

      console.log('✅ Email OTP verified successfully! User:', authData.user?.id);

      // Check if profile exists, create if not
      if (authData.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!existingProfile) {
          console.log('Creating profile for email user:', authData.user.id);
          const { error: insertError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            email: authData.user.email!,
            display_name: authData.user.user_metadata?.display_name || 'User',
            role: authData.user.user_metadata?.role || 'buyer',
          });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }

        // Fetch the profile
        await fetchProfile(authData.user.id);
      }

      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      console.error('❌ Verify email OTP exception:', authError);
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Resend OTP to email
   */
  const resendEmailOTP = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      console.log('📧 Resending OTP to email:', email);

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (authError) {
        console.error('❌ Resend email OTP error:', authError);
        throw authError;
      }

      console.log('✅ Email OTP resent successfully');
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      console.error('❌ Resend email OTP exception:', authError);
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Request a password reset email
   */
  const resetPasswordRequest = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (authError) throw authError;
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Reset password using token from email
   */
  const resetPassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) throw authError;
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Update password for logged-in user
   */
  const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');

      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) throw authError;
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Update user email (requires re-verification)
   */
  const updateEmail = async (newEmail: string): Promise<{ error: AuthError | null }> => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');

      const { error: authError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (authError) throw authError;
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates: ProfileUpdate): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      setError(null);

      // Optimistic update
      if (profile) {
        setProfile({ ...profile, ...updates } as Profile);
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile to get the latest data
      await fetchProfile(user.id);

      return { error: null };
    } catch (err) {
      // Revert optimistic update on error
      if (user) {
        await fetchProfile(user.id);
      }
      return { error: err as Error };
    }
  };

  /**
   * Refresh user profile from database
   */
  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  /**
   * Upload user avatar
   */
  const uploadAvatar = async (file: File): Promise<{ url: string | null; error: Error | null }> => {
    if (!user) return { url: null, error: new Error('No user logged in') };

    try {
      setError(null);

      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      }

      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 2MB.');
      }

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: data.publicUrl });

      return { url: data.publicUrl, error: null };
    } catch (err) {
      return { url: null, error: err as Error };
    }
  };

  /**
   * Delete user avatar
   */
  const deleteAvatar = async (): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('No user logged in') };
    if (!profile?.avatar_url) return { error: new Error('No avatar to delete') };

    try {
      setError(null);

      const oldPath = profile.avatar_url.split('/').pop();
      if (oldPath) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${oldPath}`]);

        if (deleteError) throw deleteError;
      }

      // Update profile to remove avatar URL
      await updateProfile({ avatar_url: null });

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  /**
   * Delete user account (requires re-authentication)
   */
  const deleteAccount = async (): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      setError(null);

      // Delete avatar if exists
      if (profile?.avatar_url) {
        await deleteAvatar();
      }

      // Note: Supabase doesn't have a direct API to delete users from client
      // The profile deletion will cascade due to ON DELETE CASCADE in the schema
      // You would typically need to implement this via a server-side function or admin API

      // For now, we'll sign out and let an admin handle account deletion
      // Or implement a server-side edge function to handle this

      await signOut();

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    profileMissing,
    signUp,
    signIn,
    signOut,
    signUpWithPhone,
    signInWithPhone,
    verifyOTP,
    resendOTP,
    signInWithEmail,
    verifyEmailOTP,
    resendEmailOTP,
    resetPasswordRequest,
    resetPassword,
    updatePassword,
    updateEmail,
    updateProfile,
    refreshProfile,
    deleteAccount,
    uploadAvatar,
    deleteAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * 
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * const { user, profile, signIn, signOut } = useAuth();
 * 
 * if (user) {
 *   return <div>Welcome, {profile?.display_name}!</div>;
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

