import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type UserRole = Database['public']['Enums']['user_role'];

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthContextType extends AuthState {
  // Authentication methods
  signUp: (data: SignUpData) => Promise<{ error: AuthError | null }>;
  signIn: (data: SignInData) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  
  // Password management
  resetPasswordRequest: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  
  // Email management
  updateEmail: (newEmail: string) => Promise<{ error: AuthError | null }>;
  
  // Profile management
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  
  // Account management
  deleteAccount: () => Promise<{ error: Error | null }>;
  
  // Avatar management
  uploadAvatar: (file: File) => Promise<{ url: string | null; error: Error | null }>;
  deleteAvatar: () => Promise<{ error: Error | null }>;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

