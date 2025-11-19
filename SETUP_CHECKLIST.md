# Setup Checklist - Authentication System

Use this checklist to ensure your authentication system is properly configured and working.

## ☑️ Pre-Setup

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Code repository cloned/downloaded

## ☑️ Environment Configuration

- [ ] Created `.env` file in project root
- [ ] Added `VITE_SUPABASE_URL` to `.env`
- [ ] Added `VITE_SUPABASE_ANON_KEY` to `.env`
- [ ] Verified no extra spaces or quotes in `.env` values
- [ ] Restarted development server after creating `.env`

**How to get credentials:**
1. Go to Supabase Dashboard
2. Select your project
3. Go to Settings > API
4. Copy "Project URL" → `VITE_SUPABASE_URL`
5. Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

## ☑️ Database Setup

- [ ] Opened Supabase SQL Editor
- [ ] Ran `supabase/migrations/001_initial_schema.sql`
- [ ] Verified tables were created:
  - [ ] `profiles` table exists
  - [ ] `verification_documents` table exists
  - [ ] `activity_logs` table exists
- [ ] Verified RLS is enabled on all tables
- [ ] Verified storage buckets were created:
  - [ ] `avatars` bucket (public)
  - [ ] `documents` bucket (private)
- [ ] Verified trigger was created: `on_auth_user_created`

**Verification SQL:**
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check triggers
SELECT tgname FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check buckets
SELECT * FROM storage.buckets;
```

## ☑️ Authentication Configuration

- [ ] Email provider is enabled (should be default)
- [ ] Decided on email confirmation setting:
  - [ ] Enabled for production (recommended)
  - [ ] Disabled for development (optional)
- [ ] Configured Site URL (Settings > General)
- [ ] Configured Redirect URLs (Settings > Authentication)
  - [ ] Added `http://localhost:5173/**` for development
  - [ ] Will add production URLs later

**Optional but recommended:**
- [ ] Customized email templates (Authentication > Email Templates)
- [ ] Configured custom SMTP (for production)
- [ ] Enabled desired social providers (Google, GitHub, etc.)

## ☑️ Dependencies Installation

- [ ] Ran `npm install` successfully
- [ ] No dependency errors
- [ ] All packages installed

## ☑️ Development Server

- [ ] Started dev server with `npm run dev`
- [ ] Server running at `http://localhost:5173`
- [ ] No console errors on startup
- [ ] No environment variable errors

## ☑️ Basic Functionality Tests

### Sign Up Test
- [ ] Navigated to `/signup`
- [ ] Form displays correctly
- [ ] Password strength indicator works
- [ ] Can type in all fields
- [ ] Terms checkbox is present
- [ ] Tried signing up with weak password → rejected ✓
- [ ] Successfully signed up with strong password
- [ ] Redirected to profile page OR received email verification message

### Profile Creation Test
- [ ] Profile page loads without errors
- [ ] User data displays correctly
- [ ] Avatar placeholder shows initials

### Login Test
- [ ] Logged out successfully
- [ ] Navigated to `/login`
- [ ] Form displays correctly
- [ ] Tried logging in with wrong password → error message ✓
- [ ] Successfully logged in with correct credentials
- [ ] Redirected to profile page

### Password Reset Test
- [ ] Navigated to `/forgot-password`
- [ ] Entered email address
- [ ] Received success message
- [ ] Checked email inbox
- [ ] Clicked reset link in email
- [ ] Redirected to `/reset-password`
- [ ] Successfully changed password
- [ ] Can log in with new password

### Protected Routes Test
- [ ] While logged out, tried accessing `/profile` → redirected to login ✓
- [ ] After logging in, redirected back to `/profile` ✓
- [ ] Can access protected routes while authenticated

## ☑️ Profile Management Tests

### Avatar Upload Test
- [ ] Navigated to `/profile/settings`
- [ ] Avatar upload section visible
- [ ] Tried uploading invalid file type → rejected ✓
- [ ] Tried uploading file > 2MB → rejected ✓
- [ ] Successfully uploaded valid image
- [ ] Avatar displays on profile
- [ ] Can delete avatar

### Email Change Test
- [ ] Opened "Account" tab in settings
- [ ] Entered new email
- [ ] Entered password
- [ ] Received verification email
- [ ] Clicked verification link
- [ ] Email updated successfully

### Password Change Test
- [ ] Opened "Security" tab in settings
- [ ] Entered current password
- [ ] Entered new strong password
- [ ] Password strength indicator works
- [ ] Successfully changed password
- [ ] Can log in with new password

### Account Deletion Test (Optional)
- [ ] Opened "Account" tab in settings
- [ ] Scrolled to danger zone
- [ ] Entered email
- [ ] Entered password
- [ ] Typed "DELETE"
- [ ] Confirmed in dialog
- [ ] Account deleted and logged out

## ☑️ Security Verification

### RLS Policies Test
- [ ] Created two test accounts
- [ ] Logged in as User A
- [ ] Cannot see User B's profile data in database
- [ ] Cannot update User B's profile
- [ ] Cannot view User B's documents

**Test with SQL:**
```sql
-- As User A, try to update User B's profile (should fail)
UPDATE profiles 
SET display_name = 'Hacked' 
WHERE id = 'user-b-id';
```

### Password Security Test
- [ ] Password must be 8+ characters
- [ ] Password must have uppercase letter
- [ ] Password must have lowercase letter
- [ ] Password must have number
- [ ] Weak passwords are rejected

### Session Security Test
- [ ] Session persists on page reload
- [ ] Token refresh works (check Network tab after 1 hour)
- [ ] Logout clears session
- [ ] Logout in one tab logs out other tabs

## ☑️ User Experience Tests

### Loading States
- [ ] Buttons show loading spinner during submit
- [ ] Page shows loading during auth check
- [ ] Forms disable during submission

### Error Messages
- [ ] Validation errors are user-friendly
- [ ] Network errors show helpful messages
- [ ] Supabase errors are translated to user-friendly text

### Success Feedback
- [ ] Toast notifications show for successful actions
- [ ] Success screens show for password reset
- [ ] Visual confirmation for profile updates

### Accessibility
- [ ] Can navigate forms with keyboard (Tab key)
- [ ] Can submit forms with Enter key
- [ ] Focus states are visible
- [ ] Error messages are associated with fields

### Responsive Design
- [ ] Forms work on mobile (< 640px)
- [ ] Forms work on tablet (640px - 1024px)
- [ ] Forms work on desktop (> 1024px)
- [ ] Touch targets are large enough on mobile

## ☑️ Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## ☑️ Performance

- [ ] Initial page load is fast (< 3 seconds)
- [ ] Auth check doesn't block UI
- [ ] Forms are responsive to user input
- [ ] No console warnings or errors
- [ ] No memory leaks (check DevTools Memory tab)

## ☑️ Production Preparation

Before deploying to production:

### Environment
- [ ] Created production Supabase project
- [ ] Updated `.env` with production credentials
- [ ] Configured production URLs in Supabase
- [ ] Set up custom domain for auth redirects

### Email Configuration
- [ ] Configured custom SMTP provider
- [ ] Customized all email templates
- [ ] Tested email delivery in production
- [ ] Set up SPF/DKIM records for email domain

### Security
- [ ] Enabled email confirmation
- [ ] Reviewed and tested all RLS policies
- [ ] Set up rate limiting (if needed)
- [ ] Configured CORS properly
- [ ] Reviewed storage bucket policies

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics
- [ ] Set up uptime monitoring
- [ ] Create dashboard for auth metrics

### Documentation
- [ ] Team trained on auth system
- [ ] Admin documentation created
- [ ] User documentation created
- [ ] Support team briefed on common issues

## ☑️ Optional Enhancements

Consider implementing:
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub, etc.)
- [ ] Magic link authentication
- [ ] Session management UI
- [ ] Login history tracking
- [ ] Account recovery questions

## 📋 Issue Tracking

If you encounter issues, check them off here:

### Common Issues
- [ ] ❌ Missing environment variables → Fixed: Added to `.env`
- [ ] ❌ Profile not found → Fixed: Re-ran migration
- [ ] ❌ Email not sending → Fixed: Configured SMTP
- [ ] ❌ RLS policy error → Fixed: Reviewed policies
- [ ] ❌ Avatar upload fails → Fixed: Checked bucket policies
- [ ] ❌ Token refresh fails → Fixed: Checked Supabase settings

### Custom Issues
- [ ] Issue: ___________________ → Solution: ___________________
- [ ] Issue: ___________________ → Solution: ___________________
- [ ] Issue: ___________________ → Solution: ___________________

## ✅ Final Verification

When all checkboxes above are complete:

- [ ] All basic tests pass
- [ ] All security tests pass
- [ ] All UX tests pass
- [ ] Documentation reviewed
- [ ] Team is trained
- [ ] Monitoring is set up
- [ ] **System is ready for production**

## 📞 Need Help?

If you're stuck on any item:

1. Check `QUICK_START.md` for detailed setup steps
2. Review `AUTH_SYSTEM_DOCUMENTATION.md` for troubleshooting
3. Check Supabase dashboard logs
4. Review browser console for errors
5. Check Network tab for failed requests

## 🎉 Success!

Once all items are checked, your authentication system is fully operational and production-ready!

---

**Checklist Version:** 1.0.0  
**Last Updated:** November 17, 2025  
**Estimated Time to Complete:** 30-60 minutes

