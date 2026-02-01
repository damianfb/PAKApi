# Quick Deployment Guide - JWT Authentication Fix

## What Was Fixed
✅ Angular frontend can now connect to Supabase Edge Functions
✅ Fixed "Invalid JWT" 401 errors
✅ Added missing `apikey` header to HTTP requests

## Files Changed (3 code files)
1. `frontend/src/app/core/interceptors/auth.interceptor.ts` - Added apikey header
2. `supabase/functions/_shared/supabase.ts` - Extract and use apikey from requests
3. `supabase/functions/_shared/cors.ts` - Added Access-Control-Allow-Methods

## Deployment Steps

### 1. Deploy Edge Functions (Required)
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all functions (recommended)
supabase functions deploy

# OR deploy individually if needed
supabase functions deploy pacientes
supabase functions deploy facturas
supabase functions deploy obras-sociales
# ... etc for other functions
```

### 2. Frontend Configuration (Verify)
Ensure `frontend/src/environments/environment.ts` has correct values:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://xxxxx.supabase.co',      // Your project URL
  supabaseKey: 'eyJhbGciOiJI...',                // Your anon key
  apiUrl: 'https://xxxxx.supabase.co/functions/v1'
};
```

### 3. Frontend Build (Only if environment changed)
```bash
cd frontend
npm install    # If dependencies changed
ng build      # For production build
# OR
ng serve      # For local testing
```

## Testing

### Quick Test
1. Open browser to `http://localhost:4200`
2. Login with credentials
3. Navigate to any module (Pacientes, Facturas, etc.)
4. Open DevTools → Network tab
5. Verify HTTP requests show:
   - ✓ Status 200 (not 401)
   - ✓ Header: `authorization: Bearer eyJ...`
   - ✓ Header: `apikey: eyJ...`

### Test Checklist
- [ ] Login works
- [ ] GET requests work (list data)
- [ ] POST requests work (create data)
- [ ] PUT requests work (update data)
- [ ] DELETE requests work (remove data)
- [ ] No 401 errors in console
- [ ] No CORS errors in console

## Rollback (If Needed)

### Rollback Edge Functions
```bash
# Redeploy previous version
git checkout <previous-commit>
supabase functions deploy
```

### Rollback Frontend
```bash
# Revert changes
git checkout <previous-commit>
ng build
```

## Support

### If Still Getting 401 Errors
1. Verify environment.ts has correct supabaseKey
2. Clear browser cache and localStorage
3. Logout and login again
4. Check browser console for error messages
5. Verify Edge Functions were deployed successfully

### If Getting CORS Errors
1. Verify CORS headers in Edge Functions response
2. Check browser console for specific CORS error
3. Ensure OPTIONS requests return 200
4. Verify Origin header is being sent

### Common Issues

**Issue**: Frontend builds but 401 errors persist
**Solution**: Edge Functions need to be redeployed with new code

**Issue**: Edge Functions deployed but still 401
**Solution**: Clear browser cache, logout/login, verify environment.ts

**Issue**: Works in Postman but not browser
**Solution**: This was the original issue - should now be fixed after deployment

## Documentation
- `AUTHENTICATION_FIX.md` - Detailed technical explanation
- `JWT_AUTH_FIX_SUMMARY.md` - Executive summary and analysis

## Contact
If issues persist after deployment, check:
1. Supabase dashboard → Edge Functions logs
2. Browser DevTools → Console for errors
3. Browser DevTools → Network tab for request/response details
