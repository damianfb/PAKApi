# PAKApi

API for Patient Transport Management System (Sistema de Gestión de Traslados de Pacientes)

## Overview

PAKApi is a backend system designed to manage patient transport services, including health insurance integration, driver management, destination tracking, patient records, service configuration, billing periods, and monthly transport tracking.

## Database Schema

The database consists of sixteen main tables implemented across six phases:

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

**FASE 4 (Completed):**
- **cobranzas**: Collection processes for health insurance payments
- **recibos**: Payment receipts from health insurance companies
- **recibos_detalle**: Receipt line items applied to invoices

**FASE 5 (Completed):**
- **horarios_traslados**: Individual transport schedules with date, time, and driver assignment

**FASE 6 (Completed):**
- **gastos_operativos**: Operational expenses (fuel, maintenance, tolls, insurance, etc.)
- **liquidaciones_conductores**: Driver payment settlements and liquidations

**FASE 7A (Completed):**
- **Edge Functions**: TypeScript/Deno Edge Functions for REST API endpoints
- **CRUD Operations**: Full CRUD for obras_sociales, pacientes, destinos, conductores, servicios_paciente
- **API Documentation**: Comprehensive API reference with examples

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
   - `00005_create_fase4_tables.sql` - Creates FASE 4 tables with RLS policies
   - `00006_create_fase5_tables.sql` - Creates FASE 5 tables with RLS policies
   - `00007_create_fase6_tables.sql` - Creates FASE 6 tables with RLS policies

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

### FASE 4 Features ✅
- ✅ Collection process management for health insurance payments
- ✅ Payment receipt generation and tracking
- ✅ Receipt line items for payment allocation to invoices
- ✅ Payment method and transaction tracking
- ✅ Status workflows for collections and receipts
- ✅ Automatic calculation validation for pending amounts

### FASE 5 Features ✅
- ✅ Individual transport scheduling with date and time
- ✅ Driver assignment for each transport
- ✅ Scheduled vs actual time tracking
- ✅ Transport type classification (one-way, round-trip)
- ✅ Status workflow for transport lifecycle
- ✅ Distance tracking and reporting
- ✅ Integration with monthly billing aggregates

### FASE 6 Features ✅
- ✅ Operational expense tracking and management
- ✅ Multiple expense types (fuel, maintenance, tolls, insurance, etc.)
- ✅ Driver-specific expense assignment
- ✅ Expense approval and payment workflows
- ✅ Driver settlement/liquidation calculations
- ✅ Integration with transport counts and expenses
- ✅ Bonuses and deductions support
- ✅ Automatic net payment calculation validation
- ✅ Payment method and transaction tracking

### FASE 7A Features ✅
- ✅ Supabase Edge Functions (TypeScript/Deno)
- ✅ REST API endpoints for all core entities
- ✅ Full CRUD operations (POST, GET, PUT, DELETE)
- ✅ Pagination and filtering support
- ✅ Special endpoint: GET /pacientes/:id/servicios
- ✅ CORS support for frontend integration
- ✅ Comprehensive error handling
- ✅ Complete API documentation
- ✅ Deployment-ready functions

## API Documentation

For the REST API documentation, see:
- [FASE7A_API_DOCUMENTATION.md](FASE7A_API_DOCUMENTATION.md) - Complete API reference
- [supabase/functions/README.md](supabase/functions/README.md) - Deployment guide

## Project Status

**FASE 1**: ✅ Completed - Database tables created with RLS, triggers, and initial seeds
**FASE 2**: ✅ Completed - Billing and transport tracking tables created with RLS and triggers
**FASE 3**: ✅ Completed - Invoice and credit note tables created with RLS and triggers
**FASE 4**: ✅ Completed - Collection and receipt tables created with RLS and triggers
**FASE 5**: ✅ Completed - Transport schedules table created with RLS and triggers
**FASE 6**: ✅ Completed - Operational expenses and driver settlements tables created with RLS and triggers
**FASE 7A**: ✅ Completed - Edge Functions with CRUD operations for all core entities