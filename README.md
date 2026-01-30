# PAKApi

API for Patient Transport Management System (Sistema de Gestión de Traslados de Pacientes)

## Overview

PAKApi is a backend system designed to manage patient transport services, including health insurance integration, driver management, destination tracking, and patient records.

## Database Schema

The database consists of four main tables implemented in FASE 1:

- **obras_sociales**: Health insurance companies and social works
- **pacientes**: Patient records and information
- **conductores**: Driver information and licenses
- **destinos**: Transport destinations (hospitals, clinics, etc.)

For detailed schema information, see [supabase/SCHEMA.md](supabase/SCHEMA.md)

## Database Setup

The project uses Supabase (PostgreSQL) for data storage. Migrations are located in the `supabase/migrations/` directory.

### Applying Migrations

See [supabase/README.md](supabase/README.md) for detailed instructions on applying database migrations.

### Quick Start

1. Create a Supabase project at https://supabase.com
2. Apply migrations in order:
   - `00001_create_base_tables.sql` - Creates all tables with RLS policies
   - `00002_seed_initial_data.sql` - Seeds initial data

## Features

- ✅ PostgreSQL database with Row Level Security (RLS)
- ✅ Health insurance company management
- ✅ Patient records with health insurance integration
- ✅ Driver management with license tracking
- ✅ Destination management with geolocation support
- ✅ Automatic timestamp updates
- ✅ Comprehensive indexing for performance

## Project Status

**FASE 1**: ✅ Completed - Database tables created with RLS, triggers, and initial seeds