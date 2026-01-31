# PAKApi

API for Patient Transport Management System (Sistema de Gestión de Traslados de Pacientes)

## Overview

PAKApi is a backend system designed to manage patient transport services, including health insurance integration, driver management, destination tracking, patient records, service configuration, billing periods, and monthly transport tracking.

## Database Schema

The database consists of ten main tables implemented across three phases:

**FASE 1 (Completed):**
- **obras_sociales**: Health insurance companies and social works
- **pacientes**: Patient records and information
- **conductores**: Driver information and licenses
- **destinos**: Transport destinations (hospitals, clinics, etc.)

**FASE 2 (Completed):**
- **servicios_paciente**: Transport service configuration per patient
- **periodos_facturacion**: Monthly billing periods
- **traslados_mensuales**: Monthly transport tracking and billing

**FASE 3 (Completed):**
- **facturas**: Invoices for health insurance companies
- **facturas_detalle**: Invoice line items with service details
- **notas_credito**: Credit notes for invoice adjustments

For detailed schema information, see [supabase/SCHEMA.md](supabase/SCHEMA.md)

## Database Setup

The project uses Supabase (PostgreSQL) for data storage. Migrations are located in the `supabase/migrations/` directory.

### Applying Migrations

See [supabase/README.md](supabase/README.md) for detailed instructions on applying database migrations.

### Quick Start

1. Create a Supabase project at https://supabase.com
2. Apply migrations in order:
   - `00001_create_base_tables.sql` - Creates FASE 1 tables with RLS policies
   - `00002_seed_initial_data.sql` - Seeds initial data for FASE 1
   - `00003_create_fase2_tables.sql` - Creates FASE 2 tables with RLS policies
   - `00004_create_fase3_tables.sql` - Creates FASE 3 tables with RLS policies

## Features

### FASE 1 Features ✅
- ✅ PostgreSQL database with Row Level Security (RLS)
- ✅ Health insurance company management
- ✅ Patient records with health insurance integration
- ✅ Driver management with license tracking
- ✅ Destination management with geolocation support
- ✅ Automatic timestamp updates
- ✅ Comprehensive indexing for performance

### FASE 2 Features ✅
- ✅ Patient transport service configuration
- ✅ Monthly billing period management
- ✅ Monthly transport tracking and counting
- ✅ Billing split between health insurance and patient
- ✅ Service authorization and overage tracking
- ✅ Composite unique constraints for data integrity

### FASE 3 Features ✅
- ✅ Invoice generation and management
- ✅ Invoice line items with detailed billing
- ✅ Credit note issuance and tracking
- ✅ Status workflows for invoices and credit notes
- ✅ Integration with billing periods and monthly transports
- ✅ Comprehensive audit trail with timestamps

## Project Status

**FASE 1**: ✅ Completed - Database tables created with RLS, triggers, and initial seeds
**FASE 2**: ✅ Completed - Billing and transport tracking tables created with RLS and triggers
**FASE 3**: ✅ Completed - Invoice and credit note tables created with RLS and triggers