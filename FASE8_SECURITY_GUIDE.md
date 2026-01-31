# FASE 8 - Security Hardening Guide

## Overview

This document outlines the security measures, Row Level Security (RLS) policies, and best practices implemented in PAKApi Phase 8 to ensure data protection and proper access control.

## Table of Contents

1. [Current Security Implementation](#current-security-implementation)
2. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
3. [Authentication & Authorization](#authentication--authorization)
4. [Input Validation](#input-validation)
5. [Security Best Practices](#security-best-practices)
6. [Audit Logging](#audit-logging)
7. [Security Testing](#security-testing)
8. [Common Security Concerns](#common-security-concerns)

---

## Current Security Implementation

### 1. Database Level Security

All tables in PAKApi have Row Level Security (RLS) enabled:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### 2. Current RLS Policies

**Status**: ✅ All tables have basic authenticated user policies

All tables currently use this policy:
```sql
CREATE POLICY "Allow full access to authenticated users"
    ON table_name
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
```

**Tables with RLS enabled** (16 tables + 6 views):
- obras_sociales
- pacientes
- conductores
- destinos
- servicios_paciente
- periodos_facturacion
- traslados_mensuales
- facturas
- facturas_detalle
- notas_credito
- cobranzas
- recibos
- recibos_detalle
- horarios_traslados
- gastos_operativos
- liquidaciones_conductores

**Views with security_invoker**:
All 6 reporting views use `security_invoker = true`, which means they respect the RLS policies of underlying tables.

---

## Row Level Security (RLS) Policies

### Recommended Enhanced Policies

#### 1. Role-Based Access Control

**Proposed Roles**:
- `admin`: Full access to all operations
- `operator`: Create, read, update operations (limited delete)
- `viewer`: Read-only access
- `driver`: Access to own data only (horarios, liquidaciones, gastos)

#### 2. Policy Examples for Enhanced Security

**Example 1: Read-Only Access for Viewers**
```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON pacientes;

-- Create read policy for viewers
CREATE POLICY "viewers_read_pacientes"
    ON pacientes
    FOR SELECT
    TO authenticated
    USING (true);

-- Create full access for admins and operators
CREATE POLICY "admins_operators_full_access_pacientes"
    ON pacientes
    FOR ALL
    TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'operator')
    )
    WITH CHECK (
        current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'operator')
    );
```

**Example 2: Driver Self-Service Access**
```sql
-- Drivers can only see their own liquidations
CREATE POLICY "drivers_own_liquidaciones"
    ON liquidaciones_conductores
    FOR SELECT
    TO authenticated
    USING (
        conductor_id::text = current_setting('request.jwt.claims', true)::json->>'conductor_id'
        OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'operator')
    );
```

**Example 3: Immutable Financial Records**
```sql
-- Prevent deletion of paid invoices
CREATE POLICY "prevent_delete_paid_facturas"
    ON facturas
    FOR DELETE
    TO authenticated
    USING (
        estado != 'pagada'
        AND current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
    );
```

### Implementation Steps

1. **Define Custom Claims in JWT**
   ```typescript
   // When creating user sessions, include custom claims
   const claims = {
     role: 'operator', // or 'admin', 'viewer', 'driver'
     conductor_id: 'uuid-if-driver',
     obra_social_id: 'uuid-if-obra-social-user'
   };
   ```

2. **Update RLS Policies**
   Create migration file: `00009_enhance_rls_policies.sql`
   
3. **Test Policies**
   Use different user roles to verify access control works as expected

---

## Authentication & Authorization

### Current Implementation

✅ **Edge Functions**: All Edge Functions require JWT authentication
```typescript
const supabase = createSupabaseClient(req);
// Automatically validates JWT from Authorization header
```

✅ **Service Role Key**: Used for admin operations and testing
- Should NEVER be exposed to clients
- Only used server-side

✅ **Anon Key**: Used for public API access
- Limited by RLS policies
- Safe for client-side use

### Recommended Enhancements

#### 1. API Key Authentication for External Integrations

```typescript
// Example middleware for API key validation
async function validateApiKey(req: Request): Promise<boolean> {
  const apiKey = req.headers.get('X-API-Key');
  if (!apiKey) return false;
  
  // Validate against stored API keys in database
  const { data } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', hashApiKey(apiKey))
    .eq('active', true)
    .single();
    
  return !!data;
}
```

#### 2. Rate Limiting

```typescript
// Example rate limiting using Upstash Redis
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});

// In Edge Function
const identifier = req.headers.get('cf-connecting-ip') || 'anonymous';
const { success } = await ratelimit.limit(identifier);

if (!success) {
  return errorResponse('Rate limit exceeded', 429);
}
```

#### 3. Request Signing for Webhooks

```typescript
// Verify webhook signatures
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

---

## Input Validation

### Current Implementation

✅ **Basic validation** in Edge Functions:
```typescript
if (!body.nombre || !body.apellido || !body.dni) {
  return errorResponse('Required fields missing', 400);
}
```

### Recommended Enhancements

#### 1. Schema Validation with Zod

```typescript
import { z } from 'https://deno.land/x/zod/mod.ts';

const PacienteSchema = z.object({
  nombre: z.string().min(1).max(100),
  apellido: z.string().min(1).max(100),
  dni: z.string().regex(/^\d{7,8}$/),
  email: z.string().email().optional(),
  telefono: z.string().regex(/^\d{10}$/).optional(),
});

// Usage
try {
  const validated = PacienteSchema.parse(body);
} catch (error) {
  return errorResponse('Invalid input', 400, error.errors);
}
```

#### 2. SQL Injection Prevention

✅ **Already implemented**: Using parameterized queries via Supabase client
```typescript
// GOOD - Parameterized query
await supabase.from('pacientes').select().eq('id', id);

// BAD - String concatenation (DO NOT USE)
// await supabase.rpc('raw_query', `SELECT * FROM pacientes WHERE id = '${id}'`);
```

#### 3. XSS Prevention

```typescript
// Sanitize HTML content
function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

---

## Security Best Practices

### 1. Environment Variables

✅ **Use Supabase Secrets**:
```bash
# Set secrets (never commit to git)
supabase secrets set API_KEY=your-secret-key
supabase secrets set WEBHOOK_SECRET=your-webhook-secret

# In Edge Function
const apiKey = Deno.env.get('API_KEY');
```

### 2. CORS Configuration

✅ **Currently implemented** in `_shared/cors.ts`:
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

⚠️ **Production recommendation**: Restrict origins
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};
```

### 3. Error Handling

✅ **Don't expose sensitive information in errors**:
```typescript
// GOOD
return errorResponse('Invalid credentials', 401);

// BAD
return errorResponse(`User ${email} not found in database table users`, 401);
```

### 4. Logging

```typescript
// Log important events (but NOT sensitive data)
console.log(`[${new Date().toISOString()}] Invoice created: ${facturaId}`);

// DON'T log sensitive data
// console.log(`User password: ${password}`); // NEVER!
```

---

## Audit Logging

### Recommended Implementation

#### 1. Create Audit Log Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    user_email VARCHAR(255),
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
```

#### 2. Create Audit Trigger Function

```sql
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3. Apply Audit Logging to Critical Tables

```sql
-- Apply to sensitive tables
CREATE TRIGGER audit_facturas_changes
    AFTER INSERT OR UPDATE OR DELETE ON facturas
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_recibos_changes
    AFTER INSERT OR UPDATE OR DELETE ON recibos
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_liquidaciones_changes
    AFTER INSERT OR UPDATE OR DELETE ON liquidaciones_conductores
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
```

---

## Security Testing

### 1. Test Authentication

```bash
# Test without token - should fail
curl -X GET "https://your-project.supabase.co/functions/v1/pacientes"

# Test with invalid token - should fail
curl -X GET "https://your-project.supabase.co/functions/v1/pacientes" \
  -H "Authorization: Bearer invalid-token"

# Test with valid token - should succeed
curl -X GET "https://your-project.supabase.co/functions/v1/pacientes" \
  -H "Authorization: Bearer ${VALID_TOKEN}"
```

### 2. Test RLS Policies

```sql
-- Test as different users
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"role": "viewer"}';
SELECT * FROM pacientes; -- Should work

SET LOCAL request.jwt.claims = '{"role": "viewer"}';
UPDATE pacientes SET nombre = 'Test' WHERE id = '...'; -- Should fail
```

### 3. Test Input Validation

```bash
# Test SQL injection attempt
curl -X POST "https://your-project.supabase.co/functions/v1/pacientes" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test'; DROP TABLE pacientes;--", "apellido": "Test", "dni": "12345678"}'
```

---

## Common Security Concerns

### ✅ Addressed

1. **SQL Injection**: Using parameterized queries via Supabase client
2. **Authentication**: JWT required for all Edge Functions
3. **CORS**: Configured in all Edge Functions
4. **RLS**: Enabled on all tables
5. **Password Storage**: Handled by Supabase Auth (bcrypt hashing)

### ⚠️ Recommended Enhancements

1. **Role-Based Access Control**: Implement granular permissions
2. **Rate Limiting**: Prevent abuse and DDoS attacks
3. **Audit Logging**: Track all critical operations
4. **Input Validation**: Add schema validation with Zod
5. **API Keys**: For external integrations
6. **Monitoring**: Set up alerts for suspicious activity

### 🔒 Critical Security Checklist

- [ ] Never commit secrets to git
- [ ] Use environment variables for sensitive data
- [ ] Rotate API keys regularly
- [ ] Monitor failed authentication attempts
- [ ] Keep dependencies updated
- [ ] Use HTTPS only in production
- [ ] Implement rate limiting
- [ ] Add audit logging for financial transactions
- [ ] Test security policies regularly
- [ ] Document security procedures

---

## Next Steps

1. **Implement Enhanced RLS Policies**
   - Create migration with role-based policies
   - Test with different user roles

2. **Add Audit Logging**
   - Create audit_logs table
   - Add triggers to critical tables

3. **Implement Input Validation**
   - Add Zod schemas to Edge Functions
   - Validate all user inputs

4. **Set Up Monitoring**
   - Configure alerts for failed logins
   - Monitor API usage patterns

5. **Security Audit**
   - Perform penetration testing
   - Review all policies and permissions

---

## Support

For security concerns or questions:
1. Review this document thoroughly
2. Check Supabase security documentation
3. Consult with security team
4. Create confidential issue if vulnerability found

**Remember**: Security is an ongoing process, not a one-time implementation.
