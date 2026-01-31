# Supabase Edge Functions - FASE 7A

This directory contains TypeScript Edge Functions for the PAKApi project, providing REST API endpoints for managing patient transport services.

## Directory Structure

```
functions/
├── _shared/
│   ├── cors.ts           # CORS configuration
│   ├── response.ts       # Response helpers
│   └── supabase.ts       # Supabase client factory
├── obras-sociales/
│   └── index.ts          # Health insurance CRUD
├── pacientes/
│   └── index.ts          # Patient CRUD + services
├── destinos/
│   └── index.ts          # Destination CRUD
├── conductores/
│   └── index.ts          # Driver CRUD
├── servicios-paciente/
│   └── index.ts          # Patient service CRUD
└── deno.json             # Deno configuration
```

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Supabase project created
- Database migrations applied (FASE 1-6)

## Deployment

### 1. Login to Supabase

```bash
supabase login
```

### 2. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

To find your project reference ID:
- Go to your Supabase project settings
- Look for "Reference ID"

### 3. Deploy Functions

Deploy all functions at once:

```bash
cd /path/to/PAKApi

# Deploy each function
supabase functions deploy obras-sociales
supabase functions deploy pacientes
supabase functions deploy destinos
supabase functions deploy conductores
supabase functions deploy servicios-paciente
```

Or use a loop:

```bash
for func in obras-sociales pacientes destinos conductores servicios-paciente; do
  supabase functions deploy $func
done
```

### 4. Set Environment Variables

If you need to set environment variables for your functions:

```bash
supabase secrets set MY_SECRET=my-value
```

## Local Development

### Start Supabase Locally

```bash
supabase start
```

### Serve a Function Locally

```bash
supabase functions serve obras-sociales --no-verify-jwt
```

The function will be available at: `http://localhost:54321/functions/v1/obras-sociales`

### Test Locally

```bash
curl -X GET "http://localhost:54321/functions/v1/obras-sociales" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing Deployed Functions

After deployment, functions are available at:

```
https://your-project-ref.supabase.co/functions/v1/{function-name}
```

### Get Authentication Token

1. **For Development/Testing**: Use the service_role key (found in project settings)
   ```bash
   export SUPABASE_SERVICE_KEY="your-service-role-key"
   ```

2. **For Production**: Use Supabase Auth to get a user JWT token
   - Sign in a user via Supabase Auth
   - Get the session token
   - Use it in the Authorization header

### Example Test Commands

See `test_edge_functions.sh` in the project root for comprehensive test examples.

Quick test:

```bash
# Replace with your values
export SUPABASE_URL="https://your-project-ref.supabase.co"
export JWT_TOKEN="your-jwt-token"

# Test GET all obras sociales
curl -X GET "${SUPABASE_URL}/functions/v1/obras-sociales?activo=true" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

## Function Endpoints

### obras-sociales
- `GET /obras-sociales` - List all
- `GET /obras-sociales/:id` - Get one
- `POST /obras-sociales` - Create
- `PUT /obras-sociales/:id` - Update
- `DELETE /obras-sociales/:id` - Delete (soft)

### pacientes
- `GET /pacientes` - List all
- `GET /pacientes/:id` - Get one
- `GET /pacientes/:id/servicios` - Get patient services
- `POST /pacientes` - Create
- `PUT /pacientes/:id` - Update
- `DELETE /pacientes/:id` - Delete (soft)

### destinos
- `GET /destinos` - List all
- `GET /destinos/:id` - Get one
- `POST /destinos` - Create
- `PUT /destinos/:id` - Update
- `DELETE /destinos/:id` - Delete (soft)

### conductores
- `GET /conductores` - List all
- `GET /conductores/:id` - Get one
- `POST /conductores` - Create
- `PUT /conductores/:id` - Update
- `DELETE /conductores/:id` - Delete (soft)

### servicios-paciente
- `GET /servicios-paciente` - List all
- `GET /servicios-paciente/:id` - Get one
- `POST /servicios-paciente` - Create
- `PUT /servicios-paciente/:id` - Update
- `DELETE /servicios-paciente/:id` - Delete (soft)

## Common Query Parameters

All list endpoints support:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50)
- `activo` (boolean): Filter by active status

Entity-specific filters:
- obras-sociales: `codigo`
- pacientes: `dni`, `obra_social_id`
- destinos: `tipo`, `ciudad`
- conductores: `dni`
- servicios-paciente: `paciente_id`, `tipo_servicio`

## Error Handling

All functions return consistent error responses:

```json
{
  "error": "Error message",
  "details": { ... }
}
```

Common status codes:
- `200`: Success (GET)
- `201`: Created (POST)
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

## Monitoring

### View Function Logs

```bash
supabase functions logs obras-sociales
```

### View All Functions

```bash
supabase functions list
```

## Troubleshooting

### "Function not found"
- Ensure the function is deployed: `supabase functions list`
- Check the function name matches exactly (case-sensitive)

### "Unauthorized"
- Check your JWT token is valid
- Ensure RLS policies allow access
- For testing, use service_role key

### "CORS errors"
- CORS is configured in all functions
- Ensure you're sending the Authorization header
- Check browser console for specific CORS issues

### "Timeout"
- Function cold starts can take 1-2 seconds
- Check function logs for errors
- Verify database connection

## Documentation

For complete API documentation, see:
- `FASE7A_API_DOCUMENTATION.md` - Full API reference
- `FASE7A_SUMMARY.md` - Implementation summary

## Support

For issues or questions:
1. Check function logs: `supabase functions logs {function-name}`
2. Review the Supabase documentation: https://supabase.com/docs/guides/functions
3. Create an issue in the repository

## Next Steps

After deploying and testing these basic functions:
1. Test all CRUD operations
2. Verify pagination and filtering
3. Check error handling
4. Review function performance
5. Move to FASE 7B for advanced functionality
