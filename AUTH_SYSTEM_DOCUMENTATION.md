# BizSearch Authentication System Documentation

## Overview

This document provides comprehensive documentation for the production-ready authentication system implemented using Supabase Auth. The system includes complete user authentication, profile management, and account security features.

## Table of Contents

1. [Architecture](#architecture)
2. [Features](#features)
3. [File Structure](#file-structure)
4. [Core Components](#core-components)
5. [Usage Examples](#usage-examples)
6. [Security Considerations](#security-considerations)
7. [Testing Checklist](#testing-checklist)
8. [Troubleshooting](#troubleshooting)

## Architecture

### Authentication Flow

```
User Registration → Email Verification (optional) → Profile Creation → Session Management
         ↓
User Login → Session Validation → Protected Routes → Auto Token Refresh
         ↓
User Logout → Session Clear → Multi-tab Sync → Redirect
```

### State Management

- **AuthContext**: Centralized authentication state management
- **React Hooks**: Custom `useAuth()` hook for easy access
- **Optimistic Updates**: Immediate UI feedback for profile changes
- **Multi-tab Sync**: Automatic logout synchronization across browser tabs

## Features

### ✅ Implemented Features

#### Authentication
- [x] User registration with email and password
- [x] Email verification flow
- [x] Login with credentials
- [x] Password reset via email
- [x] Remember me functionality
- [x] Automatic session management
- [x] Token refresh
- [x] Multi-tab logout synchronization
- [x] Logout functionality

#### Profile Management
- [x] Profile creation (automatic via database trigger)
- [x] Profile viewing (own and public profiles)
- [x] Profile editing with role-specific fields
- [x] Avatar upload and management
- [x] Email change with re-verification
- [x] Password change
- [x] Account deletion

#### Security
- [x] Row Level Security (RLS) policies
- [x] Password strength validation
- [x] Protected routes with role checking
- [x] Redirect to intended route after login
- [x] XSS protection (React default)
- [x] CSRF protection (Supabase default)
- [x] Secure token storage (Supabase client)

#### User Experience
- [x] Loading states for async operations
- [x] Comprehensive error handling
- [x] User-friendly error messages
- [x] Form validation with Zod
- [x] Password strength indicator
- [x] Responsive design
- [x] Accessible form controls
- [x] Toast notifications

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx              # Main auth context provider
├── hooks/
│   └── use-auth.ts                  # (Legacy - can be removed)
├── components/
│   ├── auth/
│   │   ├── sign-up-form.tsx        # Registration form
│   │   ├── sign-in-form.tsx        # Login form
│   │   ├── forgot-password-form.tsx # Password reset request
│   │   ├── reset-password-form.tsx  # Password reset with token
│   │   └── protected-route.tsx      # Route protection HOC
│   └── profile/
│       ├── avatar-upload.tsx        # Avatar management
│       ├── update-email-form.tsx    # Email change
│       ├── update-password-form.tsx # Password change
│       └── delete-account-form.tsx  # Account deletion
├── pages/
│   └── auth/
│       ├── login.tsx                # Login page
│       ├── signup.tsx               # Registration page
│       ├── forgot-password.tsx      # Password reset request page
│       └── reset-password.tsx       # Password reset page
├── lib/
│   └── supabase.ts                  # Supabase client setup
├── types/
│   ├── auth.types.ts                # Auth-related TypeScript types
│   └── supabase.ts                  # Supabase database types
└── utils/
    └── validation.ts                # Validation schemas and helpers
```

## Core Components

### 1. AuthContext (`contexts/AuthContext.tsx`)

The central authentication provider that manages:
- User state
- Profile state
- Session state
- Loading and error states
- All authentication methods

**Key Methods:**
```typescript
signUp(data: SignUpData): Promise<{ error: AuthError | null }>
signIn(data: SignInData): Promise<{ error: AuthError | null }>
signOut(): Promise<{ error: AuthError | null }>
resetPasswordRequest(email: string): Promise<{ error: AuthError | null }>
resetPassword(newPassword: string): Promise<{ error: AuthError | null }>
updatePassword(newPassword: string): Promise<{ error: AuthError | null }>
updateEmail(newEmail: string): Promise<{ error: AuthError | null }>
updateProfile(updates: ProfileUpdate): Promise<{ error: Error | null }>
refreshProfile(): Promise<void>
uploadAvatar(file: File): Promise<{ url: string | null; error: Error | null }>
deleteAvatar(): Promise<{ error: Error | null }>
deleteAccount(): Promise<{ error: Error | null }>
```

### 2. ProtectedRoute Component

Protects routes requiring authentication and/or specific roles.

**Usage:**
```tsx
// Basic protection (requires authentication)
<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>

// Role-based protection (single role)
<ProtectedRoute requiredRole="seller">
  <AddBusinessListing />
</ProtectedRoute>

// Multi-role protection
<ProtectedRoute requiredRoles={["seller", "broker"]}>
  <ManageListings />
</ProtectedRoute>
```

### 3. Form Components

All form components include:
- Zod validation
- Loading states
- Error handling
- User-friendly feedback
- Accessibility features

## Usage Examples

### 1. Using Authentication in Components

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {profile?.display_name}!</h1>
      <p>Role: {profile?.role}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### 2. Signing Up a New User

```tsx
import { useAuth } from '@/contexts/AuthContext';

function SignUpComponent() {
  const { signUp } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await signUp({
      email: 'user@example.com',
      password: 'SecurePass123!',
      displayName: 'John Doe',
      role: 'buyer',
    });

    if (error) {
      console.error('Sign up error:', error);
    } else {
      console.log('Sign up successful!');
    }
  };

  return <form onSubmit={handleSignUp}>...</form>;
}
```

### 3. Updating User Profile

```tsx
import { useAuth } from '@/contexts/AuthContext';

function ProfileEditor() {
  const { profile, updateProfile } = useAuth();

  const handleUpdate = async () => {
    const { error } = await updateProfile({
      display_name: 'Jane Doe',
      bio: 'Updated bio',
      phone: '+1234567890',
    });

    if (error) {
      console.error('Update error:', error);
    } else {
      console.log('Profile updated!');
    }
  };

  return <button onClick={handleUpdate}>Update Profile</button>;
}
```

### 4. Uploading an Avatar

```tsx
import { useAuth } from '@/contexts/AuthContext';

function AvatarUploader() {
  const { uploadAvatar } = useAuth();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { url, error } = await uploadAvatar(file);

    if (error) {
      console.error('Upload error:', error);
    } else {
      console.log('Avatar uploaded:', url);
    }
  };

  return <input type="file" onChange={handleFileSelect} />;
}
```

## Security Considerations

### 1. Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (for strong passwords)

### 2. Row Level Security (RLS)

All database tables have RLS enabled with the following policies:

**Profiles Table:**
- Anyone can view profiles (public information)
- Users can only insert/update/delete their own profile

**Verification Documents:**
- Users can only view their own documents
- Users can only upload documents for themselves
- Admins can view and update all documents

**Activity Logs:**
- Users can only view their own activity
- Users can only insert activity for themselves

**Storage Buckets:**
- Avatars: Public read, owner-only write/delete
- Documents: Private, owner-only read/write/delete

### 3. Token Management

- Tokens are automatically refreshed by Supabase client
- Sessions are stored securely by Supabase
- Multi-tab logout is synchronized via storage events
- No manual token storage in localStorage

### 4. Input Validation

- All inputs are validated on both client and server
- Zod schemas ensure type safety
- Supabase provides server-side validation
- XSS protection via React's automatic escaping

## Testing Checklist

### Authentication Flow
- [ ] New user signup with valid data succeeds
- [ ] Signup with duplicate email shows appropriate error
- [ ] Signup with weak password is rejected
- [ ] Login with correct credentials succeeds
- [ ] Login with incorrect credentials shows error
- [ ] Login with unverified email (if enabled) shows error
- [ ] Password reset email is sent successfully
- [ ] Password reset link works and updates password
- [ ] Reset password with weak password is rejected
- [ ] Logout clears session and redirects
- [ ] Multi-tab logout synchronizes across tabs

### Profile Management
- [ ] Profile is automatically created after signup
- [ ] Profile can be viewed by owner
- [ ] Profile can be updated with valid data
- [ ] Avatar can be uploaded (valid file types only)
- [ ] Avatar upload rejects files > 2MB
- [ ] Avatar can be deleted
- [ ] Email can be changed (requires verification)
- [ ] Password can be changed with current password
- [ ] Account can be deleted with proper confirmation

### Protected Routes
- [ ] Unauthenticated users are redirected to login
- [ ] Return URL is preserved after login redirect
- [ ] Users without required role see access denied
- [ ] Loading state shows during auth check
- [ ] Session persists on page reload

### Security
- [ ] RLS policies prevent unauthorized data access
- [ ] Users cannot read other users' documents
- [ ] Users cannot update other users' profiles
- [ ] Admins can perform admin-only operations
- [ ] Token refresh works before expiration
- [ ] Failed login attempts are rate-limited (Supabase)

### User Experience
- [ ] Loading states show during async operations
- [ ] Error messages are user-friendly
- [ ] Success feedback is provided
- [ ] Forms are validated before submission
- [ ] Password strength indicator works correctly
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen readers can navigate forms
- [ ] Responsive design works on mobile devices

## Troubleshooting

### Common Issues

#### 1. Profile Not Found After Signup

**Symptom:** User signs up but profile doesn't appear.

**Solutions:**
1. Check if the database trigger is enabled:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Manually create the profile:
   ```sql
   INSERT INTO profiles (id, email, display_name, role)
   VALUES ('user-id', 'email@example.com', 'Name', 'buyer');
   ```
3. Check trigger logs for errors

#### 2. "Invalid API Key" Error

**Solutions:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
2. Ensure you're using the anon/public key, not the secret key
3. Check for extra spaces or quotes in environment variables
4. Restart development server after changing `.env`

#### 3. RLS Policy Errors

**Symptom:** "new row violates row-level security policy"

**Solutions:**
1. Verify RLS policies are correctly defined
2. Check if user is authenticated (`auth.uid()` returns value)
3. Ensure policy conditions match the operation
4. Test policies in SQL editor:
   ```sql
   SELECT * FROM profiles WHERE auth.uid() = id;
   ```

#### 4. Avatar Upload Fails

**Solutions:**
1. Check file type (must be jpeg, png, gif, or webp)
2. Verify file size is under 2MB
3. Ensure storage bucket exists:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'avatars';
   ```
4. Check storage policies allow the upload

#### 5. Email Not Sending

**Solutions:**
1. Check Supabase email settings in dashboard
2. Verify SMTP configuration if using custom provider
3. Check spam folder
4. For development, check Supabase dashboard for email logs

### Debug Tips

1. **Enable Console Logging:**
   The AuthContext logs auth state changes. Check browser console for:
   ```
   Auth state changed: SIGNED_IN
   Error fetching profile: ...
   ```

2. **Check Network Tab:**
   Monitor Supabase API calls in browser DevTools Network tab

3. **Inspect RLS Policies:**
   Test queries directly in Supabase SQL Editor

4. **Review Supabase Logs:**
   Check Supabase dashboard → Logs → API for detailed error messages

## Future Enhancements

### Planned Features
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub, etc.)
- [ ] Magic link authentication
- [ ] Active session management
- [ ] Login history and device tracking
- [ ] Email verification required toggle
- [ ] Account suspension/deactivation
- [ ] Privacy settings (profile visibility)
- [ ] Notification preferences
- [ ] Data export functionality

### Potential Improvements
- [ ] Implement rate limiting on client side
- [ ] Add biometric authentication for mobile
- [ ] Implement OAuth for third-party integrations
- [ ] Add WebAuthn/Passkey support
- [ ] Implement progressive profile completion
- [ ] Add account recovery questions
- [ ] Implement session timeout warnings

## Support

For issues or questions:
1. Check this documentation first
2. Review Supabase Auth documentation: https://supabase.com/docs/guides/auth
3. Check GitHub issues or create a new one
4. Contact the development team

## Version History

### v1.0.0 (Current)
- Initial production-ready implementation
- Complete authentication flow
- Profile management
- Security features
- Comprehensive error handling
- Full TypeScript support

---

**Last Updated:** November 17, 2025
**Author:** Claude Sonnet 4.5
**License:** MIT

