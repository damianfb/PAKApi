# Supabase Edge Functions - FASE 7A & 7B

This directory contains TypeScript Edge Functions for the PAKApi project, providing REST API endpoints for managing patient transport services.

## Overview

The Edge Functions are organized into two phases:

### FASE 7A: CRUD Operations ✅
Basic CRUD endpoints for core entities (completed).

### FASE 7B: Batch Processes and Reports ✅
Automated batch operations and analytical reports (completed).

## Directory Structure

```
functions/
├── _shared/
│   ├── cors.ts           # CORS configuration
│   ├── response.ts       # Response helpers
│   ├── supabase.ts       # Supabase client factory
│   └── utils.ts          # Common utilities (NEW in FASE 7B)
│
├── obras-sociales/       # FASE 7A: Health insurance CRUD
│   └── index.ts
├── pacientes/            # FASE 7A: Patient CRUD + services
│   └── index.ts
├── destinos/             # FASE 7A: Destination CRUD
│   └── index.ts
├── conductores/          # FASE 7A: Driver CRUD
│   └── index.ts
├── servicios-paciente/   # FASE 7A: Patient service CRUD
│   └── index.ts
│
├── traslados-generar-periodo/  # FASE 7B: Generate monthly transfers
│   └── index.ts
├── facturas-generar/           # FASE 7B: Generate monthly invoices
│   └── index.ts
├── liquidaciones-generar/      # FASE 7B: Generate driver settlements
│   └── index.ts
├── presupuesto-resumen/        # FASE 7B: Monthly budget summary
│   └── index.ts
├── reportes/                   # FASE 7B: Analytical reports
│   └── index.ts
│
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

Deploy FASE 7A functions (CRUD):

```bash
cd /path/to/PAKApi

# Deploy FASE 7A functions
for func in obras-sociales pacientes destinos conductores servicios-paciente; do
  supabase functions deploy $func
done
```

Deploy FASE 7B functions (Batch & Reports):

```bash
# Deploy FASE 7B functions
for func in traslados-generar-periodo facturas-generar liquidaciones-generar presupuesto-resumen reportes; do
  supabase functions deploy $func
done
```

Or deploy all at once:

```bash
# Deploy ALL functions (FASE 7A + 7B)
for func in obras-sociales pacientes destinos conductores servicios-paciente traslados-generar-periodo facturas-generar liquidaciones-generar presupuesto-resumen reportes; do
  echo "Deploying $func..."
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

### FASE 7A - CRUD Operations

#### obras-sociales
- `GET /obras-sociales` - List all
- `GET /obras-sociales/:id` - Get one
- `POST /obras-sociales` - Create
- `PUT /obras-sociales/:id` - Update
- `DELETE /obras-sociales/:id` - Delete (soft)

#### pacientes
- `GET /pacientes` - List all
- `GET /pacientes/:id` - Get one
- `GET /pacientes/:id/servicios` - Get patient services
- `POST /pacientes` - Create
- `PUT /pacientes/:id` - Update
- `DELETE /pacientes/:id` - Delete (soft)

#### destinos
- `GET /destinos` - List all
- `GET /destinos/:id` - Get one
- `POST /destinos` - Create
- `PUT /destinos/:id` - Update
- `DELETE /destinos/:id` - Delete (soft)

#### conductores
- `GET /conductores` - List all
- `GET /conductores/:id` - Get one
- `POST /conductores` - Create
- `PUT /conductores/:id` - Update
- `DELETE /conductores/:id` - Delete (soft)

#### servicios-paciente
- `GET /servicios-paciente` - List all
- `GET /servicios-paciente/:id` - Get one
- `POST /servicios-paciente` - Create
- `PUT /servicios-paciente/:id` - Update
- `DELETE /servicios-paciente/:id` - Delete (soft)

### FASE 7B - Batch Processes & Reports

#### traslados-generar-periodo
- `POST /traslados/generar-periodo` - Generate monthly transfers
  - Request: `{ "mes": 1, "anio": 2026 }`

#### facturas-generar
- `POST /facturas/generar` - Generate monthly invoices
  - Request: `{ "mes": 1, "anio": 2026 }`

#### liquidaciones-generar
- `POST /liquidaciones/generar` - Generate driver settlements
  - Request: `{ "mes": 1, "anio": 2026 }`

#### presupuesto-resumen
- `GET /presupuesto/resumen/:mes/:anio` - Monthly budget summary

#### reportes
- `GET /reportes/facturacion-anual/:anio` - Annual billing report
- `GET /reportes/cobranzas-pendientes` - Pending collections
- `GET /reportes/pacientes-por-obra-social` - Patients by health insurance
- `GET /reportes/rentabilidad/:mes/:anio` - Monthly profitability
- `GET /reportes/conductores-rendimiento/:mes/:anio` - Driver performance

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
- **FASE 7A**: `FASE7A_API_DOCUMENTATION.md` - Full CRUD API reference
- **FASE 7B**: `FASE7B_SUMMARY.md` - Batch processes and reports API reference
- **FASE 7B**: `FASE7B_DEPLOYMENT_GUIDE.md` - Detailed testing and deployment guide
- `FASE7A_SUMMARY.md` - FASE 7A implementation summary

## Support

For issues or questions:
1. Check function logs: `supabase functions logs {function-name}`
2. Review the Supabase documentation: https://supabase.com/docs/guides/functions
3. Create an issue in the repository

## Next Steps

After deploying and testing these functions:
1. Test all CRUD operations (FASE 7A)
2. Test batch processes (FASE 7B)
3. Verify pagination and filtering
4. Check error handling
5. Review function performance
6. Set up automated testing
7. Configure monitoring and alerts
8. Plan for integration with frontend
