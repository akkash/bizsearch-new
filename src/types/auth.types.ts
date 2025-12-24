import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type UserRole = Database['public']['Enums']['user_role'];

// Multi-role types
export type ProfileRole = Database['public']['Tables']['profile_roles']['Row'];
export type ProfileRoleInsert = Database['public']['Tables']['profile_roles']['Insert'];
export type SellerDetails = Database['public']['Tables']['seller_details']['Row'];
export type BuyerDetails = Database['public']['Tables']['buyer_details']['Row'];
export type FranchisorDetails = Database['public']['Tables']['franchisor_details']['Row'];
export type FranchiseeDetails = Database['public']['Tables']['franchisee_details']['Row'];
export type AdvisorDetails = Database['public']['Tables']['advisor_details']['Row'];

// Extended profile with all role details
export interface ExtendedProfile extends Profile {
  roles?: ProfileRole[];
  seller_details?: SellerDetails | null;
  buyer_details?: BuyerDetails | null;
  franchisor_details?: FranchisorDetails | null;
  franchisee_details?: FranchiseeDetails | null;
  advisor_details?: AdvisorDetails | null;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  profileMissing: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  phone?: string; // Optional phone number
}

export interface PhoneSignUpData {
  phone: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PhoneSignInData {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

export interface PhoneVerifyData {
  phone: string;
  token: string;
}

export interface EmailVerifyData {
  email: string;
  token: string;
}

export interface AuthContextType extends AuthState {
  // Authentication methods
  signUp: (data: SignUpData) => Promise<{ error: AuthError | null }>;
  signIn: (data: SignInData) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;

  // Phone authentication methods
  signUpWithPhone: (data: PhoneSignUpData) => Promise<{ error: AuthError | null }>;
  signInWithPhone: (data: PhoneSignInData) => Promise<{ error: AuthError | null }>;
  verifyOTP: (data: PhoneVerifyData) => Promise<{ error: AuthError | null }>;
  resendOTP: (phone: string) => Promise<{ error: AuthError | null }>;
  signInWithEmail: (email: string) => Promise<{ error: AuthError | null }>;
  verifyEmailOTP: (data: EmailVerifyData) => Promise<{ error: AuthError | null }>;
  resendEmailOTP: (email: string) => Promise<{ error: AuthError | null }>;

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

