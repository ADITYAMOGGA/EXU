# Render Deployment Setup for ChatterLite

## Environment Variables Required

When deploying to Render, you need to set the following environment variables in your Render dashboard:

### Required Environment Variables:

1. **VITE_SUPABASE_URL**
   - Value: Your Supabase project URL (e.g., `https://your-project-id.supabase.co`)
   - Get this from: Supabase Dashboard > Project Settings > API > Project URL

2. **VITE_SUPABASE_ANON_KEY**
   - Value: Your Supabase anonymous/public key
   - Get this from: Supabase Dashboard > Project Settings > API > anon public key

3. **SUPABASE_URL** (same as above)
   - Value: Your Supabase project URL

4. **SUPABASE_ANON_KEY** (same as above)
   - Value: Your Supabase anonymous/public key

5. **NODE_ENV**
   - Value: `production`

### Optional (if using external database):
6. **DATABASE_URL**
   - Value: PostgreSQL connection string if using external database

## Deployment Steps:

1. **Connect your repository** to Render
2. **Set environment variables** in Render Dashboard:
   - Go to your service settings
   - Navigate to "Environment Variables"
   - Add each variable listed above
3. **Deploy** - Render will automatically build and deploy your app

## Troubleshooting:

If you see "Missing Supabase environment variables" error:
1. Double-check all environment variables are set in Render
2. Make sure the variable names match exactly (case-sensitive)
3. Verify your Supabase project is active and the keys are correct
4. Redeploy after adding/updating environment variables

## Build Configuration:

The `render.yaml` file in the root directory contains the deployment configuration:
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment: Node.js
- Plan: Free tier compatible

## Getting Supabase Credentials:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the **Project URL** and **anon public** key
5. Use these values for the environment variables above