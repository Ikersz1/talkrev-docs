# Deployment Guide - Vercel

This guide will help you deploy TalkRev Docs to Vercel.

## Prerequisites

- GitHub repository (already set up ✅)
- Vercel account ([Sign up here](https://vercel.com))
- Supabase project with:
  - Project URL
  - Anon key
- OpenRouter API key

## Step-by-Step Deployment

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select the `talkrev-docs` repository
5. Click **"Import"**

### 2. Configure Project Settings

Vercel will auto-detect Next.js. You can leave the default settings:
- **Framework Preset:** Next.js
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### 3. Add Environment Variables

Before deploying, add these environment variables in the Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add each variable:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGci...` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | `sk-or-v1-...` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | `https://talkrev-docs.vercel.app` |

**Important:** 
- Add these for **Production**, **Preview**, and **Development** environments
- For `NEXT_PUBLIC_APP_URL`, you can set it to your production URL after the first deployment

### 4. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### 5. Update App URL (After First Deployment)

1. Once deployed, copy your production URL
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
4. Redeploy (Vercel will auto-redeploy on the next push, or you can trigger a redeploy manually)

## Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test document creation
- [ ] Test file upload (especially PDFs)
- [ ] Test the AI chatbot
- [ ] Verify Supabase Storage bucket permissions
- [ ] Check that environment variables are set correctly

## Troubleshooting

### Build Fails

- Check that all environment variables are set
- Verify Node.js version (should be 18+)
- Check build logs in Vercel dashboard

### PDF Upload/Processing Issues

- Ensure Supabase Storage bucket is configured
- Check that `pdf-parse` is in dependencies (it is ✅)
- Verify file size limits in `next.config.ts`

### AI Chatbot Not Working

- Verify `OPENROUTER_API_KEY` is set correctly
- Check that `NEXT_PUBLIC_APP_URL` matches your Vercel URL
- Review API route logs in Vercel dashboard

### Supabase Connection Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase RLS policies
- Ensure CORS is configured in Supabase

## Continuous Deployment

Vercel automatically deploys on every push to:
- `main` branch → Production
- Other branches → Preview deployments

No additional configuration needed!

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` with your custom domain
