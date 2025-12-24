import { z } from 'zod';
import type { PasswordStrength } from '@/types/auth.types';

// Password validation constants
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  specialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
};

/**
 * Validates password strength and returns detailed feedback
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= MIN_PASSWORD_LENGTH;
  const hasUpperCase = PASSWORD_REGEX.uppercase.test(password);
  const hasLowerCase = PASSWORD_REGEX.lowercase.test(password);
  const hasNumber = PASSWORD_REGEX.number.test(password);
  const hasSpecialChar = PASSWORD_REGEX.specialChar.test(password);

  const checks = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar];
  const score = checks.filter(Boolean).length;

  const feedback: string[] = [];
  if (!hasMinLength) feedback.push(`At least ${MIN_PASSWORD_LENGTH} characters`);
  if (!hasUpperCase) feedback.push('One uppercase letter');
  if (!hasLowerCase) feedback.push('One lowercase letter');
  if (!hasNumber) feedback.push('One number');
  if (!hasSpecialChar) feedback.push('One special character');

  return {
    score: Math.min(score, 4),
    feedback,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  };
}

/**
 * Returns a color class based on password strength score
 */
export function getPasswordStrengthColor(score: number): string {
  if (score <= 1) return 'bg-red-500';
  if (score === 2) return 'bg-orange-500';
  if (score === 3) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Returns a label based on password strength score
 */
export function getPasswordStrengthLabel(score: number): string {
  if (score <= 1) return 'Weak';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  if (score === 4) return 'Strong';
  return 'Very Weak';
}

// Zod schemas for validation

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  .regex(PASSWORD_REGEX.uppercase, 'Password must contain at least one uppercase letter')
  .regex(PASSWORD_REGEX.lowercase, 'Password must contain at least one lowercase letter')
  .regex(PASSWORD_REGEX.number, 'Password must contain at least one number');

export const strongPasswordSchema = passwordSchema.regex(
  PASSWORD_REGEX.specialChar,
  'Password must contain at least one special character'
);

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    role: z.enum(['seller', 'buyer', 'franchisor', 'franchisee', 'advisor', 'broker', 'admin']),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updateEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, 'Password is required for verification'),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  location: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const deleteAccountSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  confirmation: z
    .string()
    .min(1, 'Please type DELETE to confirm')
    .refine((val) => val === 'DELETE', {
      message: 'Please type DELETE in capital letters to confirm',
    }),
});

// Helper to format Zod errors
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  return formatted;
}

// Helper to format Supabase errors
export function formatSupabaseError(error: any): string {
  if (!error) return 'An unknown error occurred';

  // Handle common Supabase errors
  if (error.message) {
    const message = error.message.toLowerCase();

    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }

    if (message.includes('email not confirmed')) {
      return 'Please verify your email address before logging in.';
    }

    if (message.includes('user already registered')) {
      return 'An account with this email already exists.';
    }

    if (message.includes('password')) {
      return 'Password is too weak. Please choose a stronger password.';
    }

    if (message.includes('rate limit')) {
      return 'Too many attempts. Please wait a few minutes and try again.';
    }

    if (message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

