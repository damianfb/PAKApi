# JWT Authentication Fix for Angular Frontend

## Problem Summary

The Angular frontend (localhost:4200) was unable to connect to Supabase Edge Functions, receiving a `401 Unauthorized` error with message `"Invalid JWT"`. The same requests worked correctly from Postman.

## Root Cause

The issue was that the frontend HTTP interceptor was only sending the `Authorization` header with the user's JWT token, but **not** the `apikey` header with Supabase's anon key. Supabase Edge Functions require **both** headers:

1. `Authorization: Bearer <user-jwt>` - Authenticates the user
2. `apikey: <supabase-anon-key>` - Authenticates the request to the Supabase project

Postman was working because it was sending both headers, but the Angular interceptor was only sending one.

## Changes Made

### 1. Frontend - Updated HTTP Interceptor

**File:** `frontend/src/app/core/interceptors/auth.interceptor.ts`

Added the `apikey` header to all outgoing HTTP requests:

```typescript
const cloned = req.clone({
  setHeaders: {
    Authorization: `Bearer ${token}`,
    apikey: environment.supabaseKey,  // Added this line
    'Content-Type': 'application/json'
  }
});
```

### 2. Backend - Updated Supabase Client Factory

**File:** `supabase/functions/_shared/supabase.ts`

Updated the `createSupabaseClient` function to:
- Extract the `apikey` header from incoming requests
- Use the provided `apikey` if available, fallback to environment variable
- Handle cases where the Authorization header might be missing

```typescript
export function createSupabaseClient(req: Request) {
  // Get the authorization header from the request
  const authHeader = req.headers.get('Authorization');
  // Get the apikey header from the request
  const apikeyHeader = req.headers.get('apikey');
  
  // Use the apikey from the request if provided, otherwise use the anon key from environment
  const supabaseKey = apikeyHeader ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    supabaseKey,
    {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    }
  );
}
```

### 3. Backend - Improved CORS Configuration

**File:** `supabase/functions/_shared/cors.ts`

Added `Access-Control-Allow-Methods` to the CORS headers:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};
```

## How to Test

### 1. Update Frontend Environment

Make sure `frontend/src/environments/environment.ts` has the correct values:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key-here',
  apiUrl: 'https://your-project.supabase.co/functions/v1'
};
```

### 2. Deploy Edge Functions

Deploy the updated Edge Functions to Supabase:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific functions
supabase functions deploy pacientes
supabase functions deploy facturas
# etc.
```

### 3. Build and Run Frontend

```bash
cd frontend
npm install
ng serve
```

### 4. Test from Browser

1. Navigate to `http://localhost:4200`
2. Log in with valid credentials
3. Try accessing any module (Pacientes, Facturas, etc.)
4. The requests should now work without `401` errors

### 5. Verify in Browser DevTools

Open the Network tab in browser DevTools and check that requests to Edge Functions include both headers:

- `authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Additional Notes

### Why Both Headers Are Required

- **apikey**: Identifies and authenticates the Supabase project. This is the public "anon" key that's safe to expose in the frontend.
- **Authorization**: Contains the user's JWT token which proves the user is authenticated and authorized to access specific data based on Row Level Security (RLS) policies.

### Security Considerations

- The `apikey` (anon key) is safe to expose in the frontend as it only provides access according to RLS policies
- The `Authorization` token is user-specific and should be kept secure
- Edge Functions automatically validate both tokens before processing requests
- All data access is still controlled by Supabase RLS policies

### CORS Configuration

The CORS configuration now explicitly:
- Allows all origins (`*`) - suitable for development, consider restricting in production
- Allows the necessary headers: `authorization`, `apikey`, `x-client-info`, `content-type`
- Allows all standard HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Handles OPTIONS preflight requests in all Edge Functions

## Testing Checklist

- [ ] Frontend can authenticate users
- [ ] Frontend can fetch data from Edge Functions (GET requests)
- [ ] Frontend can create data via Edge Functions (POST requests)
- [ ] Frontend can update data via Edge Functions (PUT requests)
- [ ] Frontend can delete data via Edge Functions (DELETE requests)
- [ ] No CORS errors in browser console
- [ ] No 401 authentication errors
- [ ] RLS policies are still enforced (users can only access their allowed data)
