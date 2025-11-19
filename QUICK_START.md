# Quick Start Guide - Authentication System

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Git (optional)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Where to find these:**
   - Go to your Supabase project dashboard
   - Navigate to: Settings > API
   - Copy the "Project URL" and "anon public" key

### 3. Set Up Database

1. Open your Supabase project dashboard
2. Go to: SQL Editor
3. Create a new query
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click "Run" to execute

This will create:
- ✅ User profiles table
- ✅ Verification documents table
- ✅ Activity logs table
- ✅ RLS policies
- ✅ Storage buckets (avatars, documents)
- ✅ Database triggers
- ✅ Indexes

### 4. Configure Authentication (Optional)

#### Enable Email Confirmation (Recommended for Production)

1. In Supabase dashboard, go to: Authentication > Settings
2. Under "Email Auth", toggle on "Enable email confirmations"
3. Customize email templates if desired

#### Configure Email Templates (Optional)

1. Go to: Authentication > Email Templates
2. Customize templates for:
   - Confirmation email
   - Reset password email
   - Magic link email

#### Enable Social Login (Optional)

1. Go to: Authentication > Providers
2. Enable desired providers (Google, GitHub, etc.)
3. Follow provider-specific setup instructions

### 5. Start Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

## Testing the Authentication System

### 1. Sign Up a New User

1. Navigate to `http://localhost:5173/signup`
2. Fill in the form:
   - Full Name: Your Name
   - Email: your@email.com
   - Role: Choose any role
   - Password: Must be strong (8+ chars, uppercase, lowercase, number, special char)
   - Confirm Password: Match the password
   - Accept Terms: Check the box
3. Click "Create Account"

**Expected Result:**
- Success: Redirected to profile page
- If email confirmation is enabled: Check your email for verification link

### 2. Test Login

1. Navigate to `http://localhost:5173/login`
2. Enter your email and password
3. Click "Sign In"

**Expected Result:**
- Success: Redirected to profile page
- Error: See user-friendly error message

### 3. Test Password Reset

1. Navigate to `http://localhost:5173/forgot-password`
2. Enter your email
3. Click "Send Reset Link"
4. Check your email for the reset link
5. Click the link to reset your password

### 4. Test Profile Management

1. Log in and go to profile
2. Navigate to Settings (`/profile/settings`)
3. Try:
   - Uploading an avatar
   - Changing your email
   - Changing your password
   - Updating profile information

### 5. Test Protected Routes

1. While logged out, try accessing: `http://localhost:5173/profile`
2. You should be redirected to login
3. After logging in, you should be redirected back to the profile

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"

**Solution:**
1. Ensure `.env` file exists in project root
2. Check that variables are named correctly:
   - `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_KEY`)
3. Restart dev server after changing `.env`

### Issue: "Profile not found" after signup

**Solution:**
1. Check if database migration ran successfully
2. Verify the trigger was created:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. If missing, re-run the migration script

### Issue: Can't upload avatar

**Solution:**
1. Verify storage buckets were created:
   ```sql
   SELECT * FROM storage.buckets;
   ```
2. Check file size (must be < 2MB)
3. Check file type (jpeg, png, gif, or webp only)

### Issue: Emails not sending

**Solution:**
1. Check Supabase dashboard: Authentication > Logs
2. For development: Check email inbox and spam folder
3. For production: Configure custom SMTP (recommended)

## Next Steps

1. **Customize UI:** Update colors, logos, and styling in Tailwind config
2. **Add Social Login:** Enable OAuth providers in Supabase
3. **Configure Email Templates:** Customize email branding
4. **Set Up Production:** Deploy to Vercel/Netlify and configure production Supabase project
5. **Add Analytics:** Track auth events for monitoring
6. **Implement 2FA:** Add two-factor authentication (future enhancement)

## File Structure Reference

```
src/
├── contexts/
│   └── AuthContext.tsx           # Main auth provider
├── components/
│   ├── auth/                     # Auth forms
│   └── profile/                  # Profile management
├── pages/
│   └── auth/                     # Auth pages
├── lib/
│   └── supabase.ts              # Supabase client
├── types/
│   └── auth.types.ts            # TypeScript types
└── utils/
    └── validation.ts            # Validation schemas
```

## Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/signup` - Registration page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token

### Protected Routes (Require Authentication)
- `/profile` - User profile view
- `/profile/edit` - Edit profile
- `/profile/settings` - Account settings
- `/profile/documents` - Documents vault

## Available Hooks & Context

```typescript
import { useAuth } from '@/contexts/AuthContext';

const {
  user,           // Current user object
  profile,        // User profile data
  session,        // Current session
  loading,        // Loading state
  error,          // Error state
  signUp,         // Sign up function
  signIn,         // Sign in function
  signOut,        // Sign out function
  updateProfile,  // Update profile function
  uploadAvatar,   // Upload avatar function
  // ... and more
} = useAuth();
```

## Support & Documentation

- Full Documentation: See `AUTH_SYSTEM_DOCUMENTATION.md`
- Supabase Docs: https://supabase.com/docs
- Project Setup: See `SUPABASE_SETUP.md`

## Development Tips

1. **Use Browser DevTools:** Check Network tab for API calls
2. **Check Console:** Auth state changes are logged
3. **Supabase Dashboard:** Monitor database and auth in real-time
4. **Test RLS Policies:** Use SQL Editor to test queries as different users

---

**Need Help?** Check `AUTH_SYSTEM_DOCUMENTATION.md` for detailed troubleshooting and usage examples.

