# FASE 7A - Edge Functions API Documentation

## Overview

This document describes the basic CRUD Edge Functions implemented for PAKApi Phase 7A. These functions provide REST API endpoints for managing the core entities of the patient transport management system.

## Base URL

```
https://your-project-ref.supabase.co/functions/v1
```

## Authentication

All endpoints require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Common Response Format

### Success Response
```json
{
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": { ... }
}
```

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`

---

## 1. Obras Sociales (Health Insurance Companies)

Base endpoint: `/obras-sociales`

### GET /obras-sociales
Get all obras sociales with optional filters.

**Query Parameters:**
- `activo` (boolean): Filter by active status
- `codigo` (string): Filter by codigo
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50)

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/obras-sociales?activo=true&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "OSDE",
      "codigo": "OSDE",
      "telefono": "+54 11 4321-1234",
      "email": "contacto@osde.com.ar",
      "direccion": "Av. Leandro N. Alem 1050, CABA",
      "activo": true,
      "created_at": "2026-01-31T00:00:00Z",
      "updated_at": "2026-01-31T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### GET /obras-sociales/:id
Get a specific obra social by ID.

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/obras-sociales/{id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### POST /obras-sociales
Create a new obra social.

**Required Fields:**
- `nombre` (string): Name of the health insurance company

**Optional Fields:**
- `codigo` (string): Unique code
- `telefono` (string): Phone number
- `email` (string): Email address
- `direccion` (string): Physical address
- `activo` (boolean): Active status (default: true)

**Example:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/obras-sociales" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "OSDE",
    "codigo": "OSDE",
    "telefono": "+54 11 4321-1234",
    "email": "contacto@osde.com.ar",
    "direccion": "Av. Leandro N. Alem 1050, CABA"
  }'
```

### PUT /obras-sociales/:id
Update an existing obra social.

**Example:**
```bash
curl -X PUT "https://your-project.supabase.co/functions/v1/obras-sociales/{id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+54 11 4321-5678"
  }'
```

### DELETE /obras-sociales/:id
Soft delete an obra social (sets activo to false).

**Example:**
```bash
curl -X DELETE "https://your-project.supabase.co/functions/v1/obras-sociales/{id}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 2. Pacientes (Patients)

Base endpoint: `/pacientes`

### GET /pacientes
Get all pacientes with optional filters.

**Query Parameters:**
- `activo` (boolean): Filter by active status
- `dni` (string): Filter by DNI
- `obra_social_id` (uuid): Filter by health insurance company
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50)

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/pacientes?activo=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "fecha_nacimiento": "1980-01-15",
      "telefono": "+54 11 1234-5678",
      "email": "juan.perez@email.com",
      "direccion": "Calle Falsa 123",
      "ciudad": "Buenos Aires",
      "provincia": "Buenos Aires",
      "codigo_postal": "1234",
      "obra_social_id": "uuid",
      "numero_afiliado": "123456",
      "activo": true,
      "created_at": "2026-01-31T00:00:00Z",
      "updated_at": "2026-01-31T00:00:00Z",
      "obra_social": {
        "id": "uuid",
        "nombre": "OSDE",
        "codigo": "OSDE"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### GET /pacientes/:id
Get a specific paciente by ID (includes obra social details).

### GET /pacientes/:id/servicios
Get all services for a specific patient.

**Query Parameters:**
- `activo` (boolean): Filter by active services only

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/pacientes/{id}/servicios?activo=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
[
  {
    "id": "uuid",
    "paciente_id": "uuid",
    "obra_social_id": "uuid",
    "destino_id": "uuid",
    "tipo_servicio": "ambulancia",
    "frecuencia": "diario",
    "dias_semana": "lunes,miercoles,viernes",
    "cantidad_mensual": 12,
    "observaciones": "Requiere camilla",
    "fecha_inicio": "2026-01-01",
    "fecha_fin": null,
    "activo": true,
    "obra_social": { ... },
    "destino": { ... }
  }
]
```

### POST /pacientes
Create a new paciente.

**Required Fields:**
- `nombre` (string): First name
- `apellido` (string): Last name
- `dni` (string): DNI (must be unique)

**Optional Fields:**
- `fecha_nacimiento` (date): Date of birth
- `telefono` (string): Phone number
- `email` (string): Email address
- `direccion` (string): Address
- `ciudad` (string): City
- `provincia` (string): Province
- `codigo_postal` (string): Postal code
- `obra_social_id` (uuid): Health insurance company ID
- `numero_afiliado` (string): Insurance membership number
- `activo` (boolean): Active status (default: true)

**Example:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/pacientes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "fecha_nacimiento": "1980-01-15",
    "telefono": "+54 11 1234-5678",
    "obra_social_id": "uuid"
  }'
```

### PUT /pacientes/:id
Update an existing paciente.

### DELETE /pacientes/:id
Soft delete a paciente (sets activo to false).

---

## 3. Destinos (Destinations)

Base endpoint: `/destinos`

### GET /destinos
Get all destinos with optional filters.

**Query Parameters:**
- `activo` (boolean): Filter by active status
- `tipo` (string): Filter by destination type
- `ciudad` (string): Filter by city (partial match)
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50)

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/destinos?tipo=hospital&ciudad=Buenos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### GET /destinos/:id
Get a specific destino by ID.

### POST /destinos
Create a new destino.

**Required Fields:**
- `nombre` (string): Destination name
- `direccion` (string): Address

**Optional Fields:**
- `ciudad` (string): City
- `provincia` (string): Province
- `codigo_postal` (string): Postal code
- `telefono` (string): Phone number
- `tipo` (string): Destination type (hospital, clinica, centro_medico, etc.)
- `coordenadas_lat` (decimal): Latitude
- `coordenadas_lng` (decimal): Longitude
- `activo` (boolean): Active status (default: true)

**Example:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/destinos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Hospital Italiano",
    "direccion": "Juan D. Perón 4190",
    "ciudad": "Buenos Aires",
    "provincia": "Buenos Aires",
    "tipo": "hospital",
    "coordenadas_lat": -34.617776,
    "coordenadas_lng": -58.399712
  }'
```

### PUT /destinos/:id
Update an existing destino.

### DELETE /destinos/:id
Soft delete a destino (sets activo to false).

---

## 4. Conductores (Drivers)

Base endpoint: `/conductores`

### GET /conductores
Get all conductores with optional filters.

**Query Parameters:**
- `activo` (boolean): Filter by active status
- `dni` (string): Filter by DNI
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50)

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/conductores?activo=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### GET /conductores/:id
Get a specific conductor by ID.

### POST /conductores
Create a new conductor.

**Required Fields:**
- `nombre` (string): First name
- `apellido` (string): Last name
- `dni` (string): DNI (must be unique)

**Optional Fields:**
- `telefono` (string): Phone number
- `email` (string): Email address
- `licencia_conducir` (string): Driver's license number
- `licencia_vencimiento` (date): License expiration date
- `activo` (boolean): Active status (default: true)

**Example:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/conductores" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "apellido": "González",
    "dni": "23456789",
    "telefono": "+54 11 2345-6789",
    "licencia_conducir": "BA-123456",
    "licencia_vencimiento": "2027-12-31"
  }'
```

### PUT /conductores/:id
Update an existing conductor.

### DELETE /conductores/:id
Soft delete a conductor (sets activo to false).

---

## 5. Servicios Paciente (Patient Services)

Base endpoint: `/servicios-paciente`

### GET /servicios-paciente
Get all servicios_paciente with optional filters.

**Query Parameters:**
- `activo` (boolean): Filter by active status
- `paciente_id` (uuid): Filter by patient ID
- `tipo_servicio` (string): Filter by service type
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50)

**Example:**
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/servicios-paciente?paciente_id={uuid}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "paciente_id": "uuid",
      "obra_social_id": "uuid",
      "destino_id": "uuid",
      "tipo_servicio": "ambulancia",
      "frecuencia": "diario",
      "dias_semana": "lunes,miercoles,viernes",
      "cantidad_mensual": 12,
      "observaciones": "Requiere camilla",
      "fecha_inicio": "2026-01-01",
      "fecha_fin": null,
      "activo": true,
      "created_at": "2026-01-31T00:00:00Z",
      "updated_at": "2026-01-31T00:00:00Z",
      "paciente": { ... },
      "obra_social": { ... },
      "destino": { ... }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

### GET /servicios-paciente/:id
Get a specific servicio_paciente by ID (includes patient, obra social, and destino details).

### POST /servicios-paciente
Create a new servicio_paciente.

**Required Fields:**
- `paciente_id` (uuid): Patient ID
- `tipo_servicio` (string): Service type (ambulancia, traslado_programado, urgencia, etc.)
- `fecha_inicio` (date): Start date

**Optional Fields:**
- `obra_social_id` (uuid): Health insurance company ID
- `destino_id` (uuid): Destination ID
- `frecuencia` (string): Frequency (diario, semanal, mensual, por_demanda)
- `dias_semana` (string): Days of the week (comma-separated: lunes,martes,miercoles)
- `cantidad_mensual` (integer): Monthly limit (default: 0)
- `observaciones` (string): Additional notes
- `fecha_fin` (date): End date
- `activo` (boolean): Active status (default: true)

**Example:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/servicios-paciente" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_id": "uuid",
    "obra_social_id": "uuid",
    "destino_id": "uuid",
    "tipo_servicio": "ambulancia",
    "frecuencia": "semanal",
    "dias_semana": "lunes,miercoles,viernes",
    "cantidad_mensual": 12,
    "fecha_inicio": "2026-02-01"
  }'
```

### PUT /servicios-paciente/:id
Update an existing servicio_paciente.

### DELETE /servicios-paciente/:id
Soft delete a servicio_paciente (sets activo to false).

---

## Error Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid input or missing required fields
- `404 Not Found`: Resource not found
- `405 Method Not Allowed`: HTTP method not supported
- `500 Internal Server Error`: Server error

## Notes

1. **Soft Deletes**: All DELETE operations perform soft deletes by setting `activo = false`. Records are never physically deleted.

2. **Pagination**: All list endpoints support pagination via `page` and `limit` query parameters.

3. **Timestamps**: All records have `created_at` and `updated_at` timestamps that are automatically managed.

4. **Foreign Keys**: Related entities are automatically included in responses using Supabase's query syntax.

5. **Validation**: Basic field validation is performed on the server side. More complex business logic will be added in future phases.

## Future Phases

Phase 7A focuses on basic CRUD operations. Future phases will include:
- Advanced business logic
- Batch operations
- Complex queries and reports
- WebSocket support for real-time updates
- File uploads for documents
- PDF generation for invoices

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
