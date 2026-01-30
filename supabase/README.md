# Supabase Database Migrations

This directory contains the database migrations for the PAKApi project.

## Structure

The migrations are organized sequentially:

- `00001_create_base_tables.sql` - Creates the core tables for FASE 1
- `00002_seed_initial_data.sql` - Seeds initial data for obras_sociales and conductores

## FASE 1 Tables

### 1. obras_sociales (Health Insurance Companies)
Stores information about health insurance companies and social works in Argentina.

**Fields:**
- `id` (UUID, Primary Key)
- `nombre` (VARCHAR 255, NOT NULL) - Name of the health insurance
- `codigo` (VARCHAR 50, UNIQUE, NOT NULL) - Unique code identifier
- `telefono` (VARCHAR 50) - Contact phone number
- `email` (VARCHAR 255) - Contact email
- `direccion` (TEXT) - Address
- `activo` (BOOLEAN, DEFAULT true) - Active status
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW())

**Features:**
- Row Level Security enabled
- Full access policy for authenticated users
- Updated_at trigger
- Initial seeds with major Argentinian health insurance companies

### 2. conductores (Drivers)
Stores information about drivers for patient transport.

**Fields:**
- `id` (UUID, Primary Key)
- `nombre` (VARCHAR 255, NOT NULL) - First name
- `apellido` (VARCHAR 255, NOT NULL) - Last name
- `dni` (VARCHAR 20, UNIQUE, NOT NULL) - National ID number
- `telefono` (VARCHAR 50) - Phone number
- `email` (VARCHAR 255) - Email address
- `licencia_conducir` (VARCHAR 50) - Driver's license number
- `licencia_vencimiento` (DATE) - License expiration date
- `activo` (BOOLEAN, DEFAULT true) - Active status
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW())

**Features:**
- Row Level Security enabled
- Full access policy for authenticated users
- Updated_at trigger
- Initial seeds with 10 active drivers

### 3. destinos (Destinations)
Stores information about destinations for patient transport.

**Fields:**
- `id` (UUID, Primary Key)
- `nombre` (VARCHAR 255, NOT NULL) - Name of the destination
- `direccion` (TEXT, NOT NULL) - Street address
- `ciudad` (VARCHAR 100) - City
- `provincia` (VARCHAR 100) - Province/State
- `codigo_postal` (VARCHAR 20) - Postal code
- `telefono` (VARCHAR 50) - Phone number
- `tipo` (VARCHAR 50) - Type (hospital, clinica, centro_medico, domicilio)
- `coordenadas_lat` (DECIMAL 10,8) - Latitude coordinates
- `coordenadas_lng` (DECIMAL 11,8) - Longitude coordinates
- `activo` (BOOLEAN, DEFAULT true) - Active status
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW())

**Features:**
- Row Level Security enabled
- Full access policy for authenticated users
- Updated_at trigger
- Sample seeds with major hospitals in Buenos Aires

### 4. pacientes (Patients)
Stores information about patients requiring transport services.

**Fields:**
- `id` (UUID, Primary Key)
- `nombre` (VARCHAR 255, NOT NULL) - First name
- `apellido` (VARCHAR 255, NOT NULL) - Last name
- `dni` (VARCHAR 20, UNIQUE, NOT NULL) - National ID number
- `fecha_nacimiento` (DATE) - Date of birth
- `telefono` (VARCHAR 50) - Phone number
- `email` (VARCHAR 255) - Email address
- `direccion` (TEXT) - Street address
- `ciudad` (VARCHAR 100) - City
- `provincia` (VARCHAR 100) - Province/State
- `codigo_postal` (VARCHAR 20) - Postal code
- `obra_social_id` (UUID, FOREIGN KEY) - Reference to obras_sociales table
- `numero_afiliado` (VARCHAR 100) - Health insurance member number
- `activo` (BOOLEAN, DEFAULT true) - Active status
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW())

**Features:**
- Row Level Security enabled
- Full access policy for authenticated users
- Updated_at trigger
- Foreign key relationship with obras_sociales (ON DELETE SET NULL)

## How to Apply Migrations

### Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

3. Apply migrations:
```bash
supabase db push
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each migration file in order
4. Execute each migration

### Manual Application

Execute the SQL files in order:
1. First apply `00001_create_base_tables.sql`
2. Then apply `00002_seed_initial_data.sql`

## Security

All tables have:
- **Row Level Security (RLS)** enabled
- **Full access policy** for authenticated users only
- Anonymous users have no access to any tables

## Indexes

Performance indexes are created on:
- `pacientes.obra_social_id` - For faster joins with obras_sociales
- `pacientes.dni` - For faster patient lookups
- `conductores.dni` - For faster driver lookups
- `obras_sociales.codigo` - For faster health insurance lookups
- `destinos.tipo` - For filtering destinations by type

## Triggers

All tables include an `updated_at` trigger that automatically updates the timestamp whenever a row is modified.

## Notes

- All IDs use UUID v4 for better distribution and security
- All timestamps are stored with timezone information
- The `activo` field allows for soft deletes
- Foreign key constraints use `ON DELETE SET NULL` to preserve data integrity
