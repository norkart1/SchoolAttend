# Vercel Deployment Guide

This school attendance management system is currently built with a traditional Express.js backend, which works perfectly on Replit. However, for Vercel deployment, some architectural considerations are important:

## Current Architecture

- **Backend**: Express.js server with JWT-based authentication (stateless)
- **Database**: PostgreSQL (Neon) with WebSocket pooling
- **Authentication**: JWT tokens (stateless, Vercel-compatible)
- **Session**: No server-side sessions (fully stateless)

## Deployment Options

### Option 1: Deploy on Replit (Recommended)
The application is production-ready and can be deployed on Replit directly:
1. Click the "Publish" button in Replit
2. Your app will be available at `https://your-repl-name.replit.app`
3. All features work out of the box with zero configuration

### Option 2: Vercel Deployment (Requires Modification)
To deploy on Vercel, you would need to restructure the backend:

**Current Limitations:**
- Vercel runs serverless functions, not long-lived Express servers
- WebSocket pooling for Neon needs to be converted to HTTP pooling

**Required Changes for Vercel:**
1. Convert Express routes to Vercel API routes (`/api` folder structure)
2. Change Neon pooling from WebSocket to HTTP:
   ```typescript
   // Instead of:
   import { Pool, neonConfig } from '@neondatabase/serverless';
   import ws from "ws";
   neonConfig.webSocketConstructor = ws;
   
   // Use:
   import { neon } from '@neondatabase/serverless';
   const sql = neon(process.env.DATABASE_URL!);
   ```
3. Ensure each API route is a separate serverless function
4. Add `vercel.json` configuration

**Vercel Configuration Example:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### Option 3: Hybrid Approach
- Deploy frontend on Vercel
- Deploy backend on Replit or another platform that supports long-lived processes
- Update frontend API calls to point to backend URL

## Security Notes

✅ **Implemented Security Features:**
- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens for stateless authentication
- HTTP-only cookies to prevent XSS attacks
- Secure cookies in production (HTTPS only)
- No server-side session storage (fully stateless)

⚠️ **Production Checklist:**
1. Set `JWT_SECRET` environment variable to a strong random string
2. Ensure `NODE_ENV=production` is set
3. Use HTTPS (automatic on Replit and Vercel)
4. Consider adding rate limiting for login attempts
5. Enable CORS only for trusted origins

## Recommendation

For the fastest and easiest deployment, **use Replit's built-in deployment**. The application is already optimized for this platform and requires no modifications.

If Vercel deployment is required, the application would need significant restructuring to work with serverless architecture. Contact a developer for assistance with this migration.
