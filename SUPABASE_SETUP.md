# Supabase Authentication & Database Setup Guide

This guide will help you set up Supabase authentication and database for the BizSearch application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js installed on your machine

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: BizSearch (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize (~2 minutes)

## Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Run the Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

This will create:
- ✅ Custom enum types (user_role, verification_status, document_type)
- ✅ Profiles table with role-specific fields
- ✅ Verification documents table
- ✅ Activity logs table
- ✅ Row Level Security (RLS) policies
- ✅ Storage buckets for avatars and documents
- ✅ Automatic triggers for profile creation
- ✅ Indexes for better performance

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation, reset password, and magic link templates

### Enable Additional Auth Providers (Optional)

You can enable social login providers:

1. Go to **Authentication** → **Providers**
2. Enable desired providers (Google, GitHub, etc.)
3. Follow the setup instructions for each provider

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/signup` to create a test account
3. Fill in the registration form
4. Check your email for confirmation (if email confirmation is enabled)
5. After confirmation, log in at `/login`
6. Navigate to `/profile` to view your profile

## Database Schema Overview

### Tables

#### `profiles`
Main user profile table with role-specific fields:
- **Base fields**: id, email, display_name, role, avatar_url, bio, phone, location, etc.
- **Seller fields**: founded_year, employees, industry, asking_price
- **Buyer fields**: buyer_type, investment_min, investment_max, preferred_industries
- **Franchisor fields**: total_outlets, royalty_percentage, franchise_fee

#### `verification_documents`
Stores user verification documents:
- identity, business, financial, legal document types
- Linked to profiles table
- Status tracking (pending, verified, rejected)

#### `activity_logs`
Tracks user activities:
- All user actions logged with timestamps
- Metadata stored as JSONB for flexibility

### Storage Buckets

1. **avatars** (public)
   - User profile pictures
   - Max size: 2MB
   - Allowed formats: jpg, png, gif

2. **documents** (private)
   - Verification and business documents
   - Max size: 10MB
   - Allowed formats: pdf, doc, docx, jpg, png

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Profiles**: 
  - Anyone can view profiles
  - Users can only update their own profile
  
- **Verification Documents**:
  - Only profile owner can view their documents
  - Only profile owner can upload documents
  
- **Activity Logs**:
  - Only profile owner can view their activity
  - System can insert logs for any user

### Storage Security

- **Avatars**: Public read, owner-only write
- **Documents**: Private, owner-only read/write

## Troubleshooting

### "Invalid API key" error
- Check that you copied the correct anon/public key (not the secret key!)
- Make sure there are no extra spaces in your `.env` file

### "Profile not found" after signup
- The profile should be auto-created via database trigger
- Check the SQL Editor for any errors during migration
- Verify the trigger was created: `profiles_user_trigger`

### Authentication not working
- Clear your browser cache and local storage
- Check browser console for errors
- Verify your Supabase URL is correct (include https://)

### RLS Policy errors
- Make sure you ran the complete migration script
- Check that RLS is enabled on all tables
- Review policies in **Database** → **Policies** section

## Next Steps

1. **Customize Email Templates**: Update branding in Authentication → Email Templates
2. **Add Social Login**: Enable Google, GitHub, or other providers
3. **Create Test Data**: Add some sample profiles for testing
4. **Set Up CI/CD**: Automate migrations with Supabase CLI
5. **Monitor Usage**: Check dashboard for user analytics and database usage

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## Support

If you encounter any issues:
1. Check the [Supabase Discord](https://discord.supabase.com)
2. Review the [GitHub Discussions](https://github.com/supabase/supabase/discussions)
3. Check the application logs in the browser console
