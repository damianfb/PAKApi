# FASE 7A Deployment Checklist

Use this checklist to ensure a smooth deployment of the Edge Functions to Supabase.

## Pre-Deployment

- [ ] Supabase project is created
- [ ] Database migrations (FASE 1-6) are applied
- [ ] Tables exist: `obras_sociales`, `pacientes`, `destinos`, `conductores`, `servicios_paciente`
- [ ] RLS is enabled on all tables
- [ ] Supabase CLI is installed: `npm install -g supabase`
- [ ] You have your Supabase project reference ID

## Deployment Steps

### 1. Login to Supabase
```bash
supabase login
```
- [ ] Login successful

### 2. Link Your Project
```bash
cd /path/to/PAKApi
supabase link --project-ref YOUR_PROJECT_REF
```
- [ ] Project linked successfully

### 3. Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy obras-sociales
supabase functions deploy pacientes
supabase functions deploy destinos
supabase functions deploy conductores
supabase functions deploy servicios-paciente
```

**Deployment Checklist:**
- [ ] `obras-sociales` deployed successfully
- [ ] `pacientes` deployed successfully
- [ ] `destinos` deployed successfully
- [ ] `conductores` deployed successfully
- [ ] `servicios-paciente` deployed successfully

### 4. Verify Deployment
```bash
supabase functions list
```
- [ ] All 5 functions appear in the list

## Testing

### 1. Get Authentication Token

For testing purposes, you can use the service_role key (found in Project Settings > API):
```bash
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SERVICE_KEY="your-service-role-key"
```
- [ ] Service role key obtained

**Note**: For production, use proper JWT tokens from Supabase Auth.

### 2. Test Each Function

#### Test obras-sociales
```bash
curl -X GET "${SUPABASE_URL}/functions/v1/obras-sociales?activo=true&limit=5" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Returns list of obras sociales
- [ ] Response includes pagination data

#### Test pacientes
```bash
curl -X GET "${SUPABASE_URL}/functions/v1/pacientes?limit=5" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Returns list of pacientes
- [ ] Response includes obra_social data (if applicable)

#### Test destinos
```bash
curl -X GET "${SUPABASE_URL}/functions/v1/destinos?activo=true&limit=5" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Returns list of destinos

#### Test conductores
```bash
curl -X GET "${SUPABASE_URL}/functions/v1/conductores?activo=true&limit=5" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Returns list of conductores

#### Test servicios-paciente
```bash
curl -X GET "${SUPABASE_URL}/functions/v1/servicios-paciente?limit=5" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Returns list of servicios_paciente

### 3. Test CRUD Operations

Pick one function to test all CRUD operations:

#### Create (POST)
```bash
curl -X POST "${SUPABASE_URL}/functions/v1/destinos" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Hospital",
    "direccion": "Calle Test 123",
    "ciudad": "Buenos Aires"
  }'
```
- [ ] Record created successfully
- [ ] Response status is 201
- [ ] Save the returned ID for next tests

#### Read Single (GET /:id)
```bash
# Replace {id} with the ID from the create response
curl -X GET "${SUPABASE_URL}/functions/v1/destinos/{id}" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Returns single record
- [ ] Data matches created record

#### Update (PUT /:id)
```bash
curl -X PUT "${SUPABASE_URL}/functions/v1/destinos/{id}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+54 11 1234-5678"
  }'
```
- [ ] Record updated successfully
- [ ] Response includes updated data

#### Delete (DELETE /:id)
```bash
curl -X DELETE "${SUPABASE_URL}/functions/v1/destinos/{id}" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Record soft-deleted (activo=false)
- [ ] Success message returned

### 4. Test Special Endpoints

#### GET /pacientes/:id/servicios
```bash
# First, get a patient ID
PATIENT_ID=$(curl -s -X GET "${SUPABASE_URL}/functions/v1/pacientes?limit=1" \
  -H "Authorization: Bearer ${SERVICE_KEY}" | jq -r '.data[0].id')

# Then get their services
curl -X GET "${SUPABASE_URL}/functions/v1/pacientes/${PATIENT_ID}/servicios" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Returns array of services for the patient
- [ ] Includes related obra_social and destino data

### 5. Test Pagination and Filtering

```bash
# Test pagination
curl -X GET "${SUPABASE_URL}/functions/v1/pacientes?page=1&limit=10" \
  -H "Authorization: Bearer ${SERVICE_KEY}"

# Test filtering
curl -X GET "${SUPABASE_URL}/functions/v1/pacientes?activo=true" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Pagination works correctly
- [ ] Filtering by activo works
- [ ] Response includes pagination metadata

### 6. Test Error Handling

#### Test 404
```bash
curl -X GET "${SUPABASE_URL}/functions/v1/pacientes/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
- [ ] Returns 404 status
- [ ] Error message in response

#### Test 400 (Missing Required Field)
```bash
curl -X POST "${SUPABASE_URL}/functions/v1/pacientes" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan"
  }'
```
- [ ] Returns 400 status
- [ ] Error indicates missing required fields

#### Test CORS
```bash
curl -X OPTIONS "${SUPABASE_URL}/functions/v1/obras-sociales" \
  -H "Access-Control-Request-Method: GET" \
  -H "Origin: http://localhost:3000"
```
- [ ] Returns 200 OK
- [ ] CORS headers present in response

## Monitoring

### View Function Logs
```bash
# View recent logs for a function
supabase functions logs obras-sociales --tail
```
- [ ] Logs are accessible
- [ ] No unexpected errors in logs

### Check Function Performance
- [ ] Cold start time is acceptable (< 3 seconds)
- [ ] Warm requests respond quickly (< 500ms)
- [ ] No timeout errors

## Post-Deployment

### Documentation
- [ ] Update team on new endpoints
- [ ] Share API documentation (`FASE7A_API_DOCUMENTATION.md`)
- [ ] Document base URL for the project

### Security
- [ ] Service role key is kept secure (not committed to git)
- [ ] RLS policies are tested and working
- [ ] Authentication is required for all endpoints

### Next Steps
- [ ] Integrate frontend with new API endpoints
- [ ] Set up monitoring/alerting for production
- [ ] Plan Phase 7B (advanced functions)

## Troubleshooting

### Function not found
- Verify deployment: `supabase functions list`
- Check function name (case-sensitive)
- Try redeploying: `supabase functions deploy {function-name}`

### Unauthorized errors
- Check JWT token is valid
- Verify RLS policies allow access
- Use service_role key for testing

### CORS errors
- Verify OPTIONS request works
- Check Authorization header is included
- Ensure frontend sends correct headers

### Database errors
- Verify migrations are applied
- Check table names match exactly
- Verify RLS policies on tables

### Timeout errors
- Check database connectivity
- Review function logs for errors
- Verify Supabase project is active

## Sign-Off

- [ ] All functions deployed successfully
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Team notified
- [ ] Ready for integration

**Deployed By**: _________________
**Date**: _________________
**Supabase Project**: _________________

## Notes

Use this space to document any issues or special configurations:

---
