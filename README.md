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

**FASE 7 (Completed):**
- **Phase 7A - CRUD Operations**: Full CRUD Edge Functions for all core entities
- **Phase 7B - Reports & Dashboards**: Reporting views and dashboard endpoints
- **Database Views**: 6 analytical views for business intelligence
- **Report Endpoints**: Annual billing, pending collections, profitability, patient analytics, dashboards

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
   - `00008_create_fase7_reporting_views.sql` - Creates FASE 7 reporting views and analytics

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

### FASE 7 Features ✅
- ✅ **Phase 7A - CRUD Operations:**
  - Supabase Edge Functions (TypeScript/Deno)
  - REST API endpoints for all core entities
  - Full CRUD operations (POST, GET, PUT, DELETE)
  - Pagination and filtering support
  - Special endpoint: GET /pacientes/:id/servicios
  - CORS support for frontend integration
  - Comprehensive error handling
- ✅ **Phase 7B - Reports & Dashboards:**
  - Annual billing report (facturación anual)
  - Pending collections report with aging (cobranzas pendientes)
  - Patients by health insurance analytics (pacientes por obra social)
  - Monthly profitability analysis (rentabilidad mensual)
  - Annual summary with KPIs (resumen anual)
  - General dashboard with real-time metrics
  - 6 optimized database views for reporting
  - Automatic report generation endpoints

### FASE 8 Features ✅
- ✅ **Complete Edge Function Coverage:**
  - 12 total Edge Functions (5 Phase 7A + 6 Phase 8 + 1 Reports)
  - traslados-mensuales, facturas, liquidaciones-conductores
  - recibos, horarios-traslados, gastos-operativos
  - 61 total API endpoints (55 CRUD + 6 reporting)
- ✅ **End-to-End Testing:**
  - Comprehensive E2E test suite with 50+ test cases
  - Complete billing workflow tests
  - Driver liquidation workflow tests
  - All CRUD operations tested
  - All reporting endpoints validated
  - Test utilities and helpers for easy extension
- ✅ **Security & Documentation:**
  - Comprehensive security hardening guide
  - Row Level Security (RLS) policy documentation
  - Enhanced RBAC recommendations
  - Production deployment guide
  - Backup and restore procedures
  - Rollback procedures
  - Monitoring and alerting setup guide
### FASE 7B Features ✅
- ✅ Automatic transfer generation (POST /traslados/generar-periodo)
- ✅ Automatic invoice generation (POST /facturas/generar)
- ✅ Driver settlement generation (POST /liquidaciones/generar)
- ✅ Monthly budget summary (GET /presupuesto/resumen/:mes/:anio)
- ✅ Analytical reports (GET /reportes/*)
  - ✅ Annual billing report
  - ✅ Pending collections report
  - ✅ Patients by health insurance report
  - ✅ Monthly profitability report
  - ✅ Driver performance report
- ✅ Batch processing and calculations
- ✅ Business logic implementation
- ✅ Shared utility functions

## API Documentation

For the REST API documentation, see:
- [FASE7A_API_DOCUMENTATION.md](FASE7A_API_DOCUMENTATION.md) - Complete CRUD API reference
- [FASE7B_SUMMARY.md](FASE7B_SUMMARY.md) - Batch processes and reports API reference
- [FASE7_COMPLETE_DOCUMENTATION.md](FASE7_COMPLETE_DOCUMENTATION.md) - Complete Phase 7 documentation (CRUD + Reports)
- [FASE7A_API_DOCUMENTATION.md](FASE7A_API_DOCUMENTATION.md) - CRUD API reference
- [FASE8_COMPLETION_REPORT.md](FASE8_COMPLETION_REPORT.md) - Phase 8 implementation report
- [FASE8_SECURITY_GUIDE.md](FASE8_SECURITY_GUIDE.md) - Security hardening and RLS policies
- [FASE8_DEPLOYMENT_GUIDE.md](FASE8_DEPLOYMENT_GUIDE.md) - Production deployment procedures
- [supabase/functions/README.md](supabase/functions/README.md) - Edge Functions deployment guide
- [tests/README.md](tests/README.md) - E2E test suite documentation

## Testing

The project includes a comprehensive end-to-end test suite:

```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"

# Run all tests
deno test --allow-net --allow-env --allow-read tests/

# Run specific test file
deno test --allow-net --allow-env --allow-read tests/01_crud_operations_test.ts
```

Test coverage includes:
- ✅ All CRUD operations for 11 entities
- ✅ Complete billing workflow (10+ steps)
- ✅ Driver liquidation workflow (9+ steps)
- ✅ All 6 reporting endpoints
- ✅ 50+ test cases total

## Project Status

**FASE 1**: ✅ Completed - Database tables created with RLS, triggers, and initial seeds  
**FASE 2**: ✅ Completed - Billing and transport tracking tables created with RLS and triggers  
**FASE 3**: ✅ Completed - Invoice and credit note tables created with RLS and triggers  
**FASE 4**: ✅ Completed - Collection and receipt tables created with RLS and triggers  
**FASE 5**: ✅ Completed - Transport schedules table created with RLS and triggers  
**FASE 6**: ✅ Completed - Operational expenses and driver settlements tables created with RLS and triggers  
**FASE 7**: ✅ Completed - Edge Functions with CRUD operations (7A) and reporting/dashboards (7B)  
**FASE 8**: ✅ Completed - E2E tests, complete Edge Function coverage, security hardening, deployment documentation
- [supabase/functions/README.md](supabase/functions/README.md) - Deployment guide

## Project Status

**FASE 1**: ✅ Completed - Database tables created with RLS, triggers, and initial seeds
**FASE 2**: ✅ Completed - Billing and transport tracking tables created with RLS and triggers
**FASE 3**: ✅ Completed - Invoice and credit note tables created with RLS and triggers
**FASE 4**: ✅ Completed - Collection and receipt tables created with RLS and triggers
**FASE 5**: ✅ Completed - Transport schedules table created with RLS and triggers
**FASE 6**: ✅ Completed - Operational expenses and driver settlements tables created with RLS and triggers
**FASE 7**: ✅ Completed - Edge Functions with CRUD operations (7A) and reporting/dashboards (7B)
