# Database Schema Diagram - FASE 1, FASE 2 & FASE 3

## Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│        obras_sociales               │
│─────────────────────────────────────│
│ id (UUID, PK)                       │
│ nombre (VARCHAR 255, NOT NULL)      │
│ codigo (VARCHAR 50, UNIQUE)         │
│ telefono (VARCHAR 50)               │
│ email (VARCHAR 255)                 │
│ direccion (TEXT)                    │
│ activo (BOOLEAN, DEFAULT true)      │
│ created_at (TIMESTAMP)              │
│ updated_at (TIMESTAMP)              │
└─────────────────────────────────────┘
              │
              │ (1:N)
              │
              ▼
┌─────────────────────────────────────┐
│          pacientes                  │
│─────────────────────────────────────│
│ id (UUID, PK)                       │
│ nombre (VARCHAR 255, NOT NULL)      │
│ apellido (VARCHAR 255, NOT NULL)    │
│ dni (VARCHAR 20, UNIQUE)            │
│ fecha_nacimiento (DATE)             │
│ telefono (VARCHAR 50)               │
│ email (VARCHAR 255)                 │
│ direccion (TEXT)                    │
│ ciudad (VARCHAR 100)                │
│ provincia (VARCHAR 100)             │
│ codigo_postal (VARCHAR 20)          │
│ obra_social_id (UUID, FK)           │◄────┐
│ numero_afiliado (VARCHAR 100)       │     │
│ activo (BOOLEAN, DEFAULT true)      │     │
│ created_at (TIMESTAMP)              │     │
│ updated_at (TIMESTAMP)              │     │
└─────────────────────────────────────┘     │
                                            │
                                            │
┌─────────────────────────────────────┐     │
│          conductores                │     │
│─────────────────────────────────────│     │
│ id (UUID, PK)                       │     │
│ nombre (VARCHAR 255, NOT NULL)      │     │
│ apellido (VARCHAR 255, NOT NULL)    │     │
│ dni (VARCHAR 20, UNIQUE)            │     │
│ telefono (VARCHAR 50)               │     │
│ email (VARCHAR 255)                 │     │
│ licencia_conducir (VARCHAR 50)      │     │
│ licencia_vencimiento (DATE)         │     │
│ activo (BOOLEAN, DEFAULT true)      │     │
│ created_at (TIMESTAMP)              │     │
│ updated_at (TIMESTAMP)              │     │
└─────────────────────────────────────┘     │
                                            │
                                            │
┌─────────────────────────────────────┐     │
│           destinos                  │     │
│─────────────────────────────────────│     │
│ id (UUID, PK)                       │     │
│ nombre (VARCHAR 255, NOT NULL)      │     │
│ direccion (TEXT, NOT NULL)          │     │
│ ciudad (VARCHAR 100)                │     │
│ provincia (VARCHAR 100)             │     │
│ codigo_postal (VARCHAR 20)          │     │
│ telefono (VARCHAR 50)               │     │
│ tipo (VARCHAR 50)                   │     │
│ coordenadas_lat (DECIMAL 10,8)      │     │
│ coordenadas_lng (DECIMAL 11,8)      │     │
│ activo (BOOLEAN, DEFAULT true)      │     │
│ created_at (TIMESTAMP)              │     │
│ updated_at (TIMESTAMP)              │     │
└─────────────────────────────────────┘     │
                                            │
            Foreign Key: ──────────────────┘
            pacientes.obra_social_id → obras_sociales.id
            (ON DELETE SET NULL)
```

## FASE 2 Tables

```
┌──────────────────────────────────────┐
│    servicios_paciente                │
│──────────────────────────────────────│
│ id (UUID, PK)                        │
│ paciente_id (UUID, FK, NOT NULL) ────┼──→ pacientes.id (CASCADE)
│ obra_social_id (UUID, FK)        ────┼──→ obras_sociales.id (SET NULL)
│ destino_id (UUID, FK)            ────┼──→ destinos.id (SET NULL)
│ tipo_servicio (VARCHAR 100, NOT NULL)│
│ frecuencia (VARCHAR 50)              │
│ dias_semana (VARCHAR 100)            │
│ cantidad_mensual (INTEGER)           │
│ observaciones (TEXT)                 │
│ fecha_inicio (DATE, NOT NULL)        │
│ fecha_fin (DATE)                     │
│ activo (BOOLEAN, DEFAULT true)       │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│ PARTIAL UNIQUE INDEX:                │
│   (paciente_id, tipo_servicio,       │
│    destino_id) WHERE activo = true   │
└──────────────────────────────────────┘
                │
                │
┌──────────────────────────────────────┐
│    periodos_facturacion              │
│──────────────────────────────────────│
│ id (UUID, PK)                        │
│ periodo (VARCHAR 7, UNIQUE, NOT NULL)│
│ fecha_inicio (DATE, NOT NULL)        │
│ fecha_fin (DATE, NOT NULL)           │
│ estado (VARCHAR 50, DEFAULT 'abierto') │
│ fecha_cierre (TIMESTAMP)             │
│ observaciones (TEXT)                 │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│ CHECK(fecha_fin >= fecha_inicio)     │
└──────────────────────────────────────┘
                │
                │ (1:N)
                │
                ▼
┌──────────────────────────────────────┐
│    traslados_mensuales               │
│──────────────────────────────────────│
│ id (UUID, PK)                        │
│ paciente_id (UUID, FK, NOT NULL) ────┼──→ pacientes.id (CASCADE)
│ periodo_id (UUID, FK, NOT NULL)  ────┼──→ periodos_facturacion.id (CASCADE)
│ servicio_paciente_id (UUID, FK)  ────┼──→ servicios_paciente.id (SET NULL)
│ obra_social_id (UUID, FK)        ────┼──→ obras_sociales.id (SET NULL)
│ cantidad_traslados (INTEGER)         │
│ cantidad_autorizada (INTEGER)        │
│ cantidad_excedida (INTEGER)          │
│ monto_total (DECIMAL 10,2)           │
│ monto_obra_social (DECIMAL 10,2)     │
│ monto_paciente (DECIMAL 10,2)        │
│ observaciones (TEXT)                 │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│ UNIQUE(paciente_id, periodo_id)      │
│ CHECK: Non-negative cantidad/monto   │
└──────────────────────────────────────┘
```

## FASE 3 Tables

```
┌──────────────────────────────────────┐
│           facturas                   │
│──────────────────────────────────────│
│ id (UUID, PK)                        │
│ numero_factura (VARCHAR 50, UNIQUE)  │
│ fecha_emision (DATE, NOT NULL)       │
│ fecha_vencimiento (DATE)             │
│ periodo_id (UUID, FK, NOT NULL)  ────┼──→ periodos_facturacion.id (CASCADE)
│ obra_social_id (UUID, FK)        ────┼──→ obras_sociales.id (SET NULL)
│ subtotal (DECIMAL 10,2, DEFAULT 0)   │
│ impuestos (DECIMAL 10,2, DEFAULT 0)  │
│ monto_total (DECIMAL 10,2, DEFAULT 0)│
│ estado (VARCHAR 50, DEFAULT          │
│         'borrador')                  │
│ fecha_pago (TIMESTAMP)               │
│ observaciones (TEXT)                 │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│ CHECK: Non-negative monetary values  │
│ CHECK: fecha_vencimiento >=          │
│        fecha_emision                 │
└──────────────────────────────────────┘
                │
                │ (1:N)
                │
                ▼
┌──────────────────────────────────────┐
│       facturas_detalle               │
│──────────────────────────────────────│
│ id (UUID, PK)                        │
│ factura_id (UUID, FK, NOT NULL)  ────┼──→ facturas.id (CASCADE)
│ traslado_mensual_id (UUID, FK)   ────┼──→ traslados_mensuales.id (SET NULL)
│ paciente_id (UUID, FK)           ────┼──→ pacientes.id (SET NULL)
│ descripcion (VARCHAR 500, NOT NULL)  │
│ cantidad (INTEGER, DEFAULT 0)        │
│ precio_unitario (DECIMAL 10,2,       │
│                  DEFAULT 0)          │
│ subtotal (DECIMAL 10,2, DEFAULT 0)   │
│ observaciones (TEXT)                 │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│ CHECK: Non-negative values           │
└──────────────────────────────────────┘


┌──────────────────────────────────────┐
│        notas_credito                 │
│──────────────────────────────────────│
│ id (UUID, PK)                        │
│ numero_nota (VARCHAR 50, UNIQUE)     │
│ fecha_emision (DATE, NOT NULL)       │
│ factura_id (UUID, FK)            ────┼──→ facturas.id (SET NULL)
│ obra_social_id (UUID, FK)        ────┼──→ obras_sociales.id (SET NULL)
│ motivo (VARCHAR 100, NOT NULL)       │
│ descripcion (TEXT, NOT NULL)         │
│ monto (DECIMAL 10,2, NOT NULL)       │
│ estado (VARCHAR 50, DEFAULT          │
│         'borrador')                  │
│ fecha_aplicacion (TIMESTAMP)         │
│ observaciones (TEXT)                 │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│ CHECK: Non-negative monto            │
└──────────────────────────────────────┘
```

## FASE 4 Tables

```
┌──────────────────────────────────────┐
│           cobranzas                  │
│──────────────────────────────────────│
│ id (UUID, PK)                        │
│ numero_cobranza (VARCHAR 50, UNIQUE) │
│ fecha_cobranza (DATE, NOT NULL)      │
│ obra_social_id (UUID, FK)        ────┼──→ obras_sociales.id (SET NULL)
│ periodo_id (UUID, FK)            ────┼──→ periodos_facturacion.id (SET NULL)
│ monto_total (DECIMAL 10,2, DEFAULT 0)│
│ monto_cobrado (DECIMAL 10,2,         │
│                DEFAULT 0)            │
│ monto_pendiente (DECIMAL 10,2,       │
│                  DEFAULT 0)          │
│ estado (VARCHAR 50, DEFAULT          │
│         'pendiente')                 │
│ fecha_vencimiento (DATE)             │
│ observaciones (TEXT)                 │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│ CHECK: Non-negative monetary values  │
│ CHECK: monto_pendiente =             │
│        monto_total - monto_cobrado   │
│ CHECK: fecha_vencimiento >=          │
│        fecha_cobranza                │
└──────────────────────────────────────┘
                │
                │ (1:N)
                │
                ▼
┌──────────────────────────────────────┐
│            recibos                   │
│──────────────────────────────────────│
│ id (UUID, PK)                        │
│ numero_recibo (VARCHAR 50, UNIQUE)   │
│ fecha_emision (DATE, NOT NULL)       │
│ fecha_pago (DATE, NOT NULL)          │
│ cobranza_id (UUID, FK)           ────┼──→ cobranzas.id (SET NULL)
│ obra_social_id (UUID, FK)        ────┼──→ obras_sociales.id (SET NULL)
│ monto_total (DECIMAL 10,2, DEFAULT 0)│
│ metodo_pago (VARCHAR 50)             │
│ numero_operacion (VARCHAR 100)       │
│ estado (VARCHAR 50, DEFAULT          │
│         'emitido')                   │
│ observaciones (TEXT)                 │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│ CHECK: Non-negative monto_total      │
│ CHECK: fecha_pago >= fecha_emision   │
└──────────────────────────────────────┘
                │
                │ (1:N)
                │
                ▼
┌──────────────────────────────────────┐
│        recibos_detalle               │
│──────────────────────────────────────│
│ id (UUID, PK)                        │
│ recibo_id (UUID, FK, NOT NULL)   ────┼──→ recibos.id (CASCADE)
│ factura_id (UUID, FK)            ────┼──→ facturas.id (SET NULL)
│ descripcion (VARCHAR 500, NOT NULL)  │
│ monto_aplicado (DECIMAL 10,2,        │
│                 DEFAULT 0)           │
│ observaciones (TEXT)                 │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│ CHECK: Non-negative monto_aplicado   │
└──────────────────────────────────────┘
```

## Table Descriptions

### FASE 1 Tables

### obras_sociales (Health Insurance Companies)
- **Purpose**: Stores health insurance and social work organizations
- **Seeds**: 15 major Argentinian health insurance companies
- **Key Fields**: codigo (unique identifier), nombre, contacto info
- **Relationships**: Referenced by pacientes table

### pacientes (Patients)
- **Purpose**: Stores patient information for transport services
- **Key Fields**: dni (unique), personal info, health insurance details
- **Relationships**: Links to obras_sociales via obra_social_id
- **Constraints**: Foreign key with ON DELETE SET NULL to preserve patient records

### conductores (Drivers)
- **Purpose**: Stores driver information for patient transport
- **Seeds**: 10 active drivers with valid licenses
- **Key Fields**: dni (unique), license info, contact details
- **Usage**: Will be referenced in future viajes table

### destinos (Destinations)
- **Purpose**: Stores destinations for patient transport
- **Seeds**: 5 major hospitals/clinics in Buenos Aires
- **Key Fields**: tipo (hospital, clinica, centro_medico, domicilio), coordenadas
- **Usage**: Referenced by servicios_paciente in FASE 2

### FASE 2 Tables

### servicios_paciente (Patient Transport Service Configuration)
- **Purpose**: Defines transport service configuration per patient
- **Key Fields**: tipo_servicio, frecuencia, cantidad_mensual, fecha_inicio
- **Relationships**: 
  - Links to pacientes (CASCADE)
  - Links to obras_sociales (SET NULL)
  - Links to destinos (SET NULL)
- **Partial Unique Index**: (paciente_id, tipo_servicio, destino_id) WHERE activo = true
  - Ensures one active service per patient-type-destination
  - Allows multiple inactive historical records
- **Usage**: Referenced by traslados_mensuales

### periodos_facturacion (Billing Periods)
- **Purpose**: Manages monthly billing cycles
- **Key Fields**: periodo (YYYY-MM), fecha_inicio, fecha_fin, estado
- **Unique Constraint**: periodo must be unique
- **Check Constraint**: fecha_fin >= fecha_inicio
- **Status Values**: abierto, cerrado, facturado
- **Usage**: Referenced by traslados_mensuales

### traslados_mensuales (Monthly Transport Tracking)
- **Purpose**: Tracks transport counts and billing per patient per month
- **Key Fields**: cantidad_traslados, cantidad_autorizada, cantidad_excedida, montos
- **Relationships**:
  - Links to pacientes (CASCADE)
  - Links to periodos_facturacion (CASCADE)
  - Links to servicios_paciente (SET NULL)
  - Links to obras_sociales (SET NULL)
- **Unique Constraint**: One record per patient per billing period
- **Check Constraints**: Non-negative values for cantidad and monto fields
- **Billing Fields**: monto_total, monto_obra_social, monto_paciente (DECIMAL 10,2)

### FASE 3 Tables

### facturas (Invoices)
- **Purpose**: Stores invoices generated for health insurance companies
- **Key Fields**: numero_factura (unique), fecha_emision, estado, monetary breakdown
- **Relationships**:
  - Links to periodos_facturacion (CASCADE)
  - Links to obras_sociales (SET NULL)
- **Unique Constraint**: numero_factura must be unique
- **Check Constraints**: Non-negative monetary values, fecha_vencimiento >= fecha_emision
- **Status Values**: borrador, emitida, pagada, anulada
- **Usage**: Referenced by facturas_detalle and notas_credito

### facturas_detalle (Invoice Line Items)
- **Purpose**: Detail lines for each invoice with service descriptions and pricing
- **Key Fields**: descripcion, cantidad, precio_unitario, subtotal
- **Relationships**:
  - Links to facturas (CASCADE)
  - Links to traslados_mensuales (SET NULL)
  - Links to pacientes (SET NULL)
- **Check Constraints**: Non-negative values for cantidad, precio_unitario, subtotal
- **Usage**: Provides detailed breakdown of invoice charges

### notas_credito (Credit Notes)
- **Purpose**: Credit notes for invoice adjustments, corrections, and cancellations
- **Key Fields**: numero_nota (unique), motivo, monto, estado
- **Relationships**:
  - Links to facturas (SET NULL)
  - Links to obras_sociales (SET NULL)
- **Unique Constraint**: numero_nota must be unique
- **Check Constraints**: Non-negative monto value
- **Status Values**: borrador, emitida, aplicada, anulada
- **Motivo Values**: sobrecobranza, error_facturacion, cancelacion, ajuste, descuento

### FASE 4 Tables

### cobranzas (Collections)
- **Purpose**: Tracks collection processes for invoices from health insurance companies
- **Key Fields**: numero_cobranza (unique), fecha_cobranza, montos (total, cobrado, pendiente), estado
- **Relationships**:
  - Links to obras_sociales (SET NULL)
  - Links to periodos_facturacion (SET NULL)
- **Unique Constraint**: numero_cobranza must be unique
- **Check Constraints**: Non-negative monetary values, monto_pendiente = monto_total - monto_cobrado, fecha_vencimiento >= fecha_cobranza
- **Status Values**: pendiente, parcial, cobrado, anulado
- **Usage**: Referenced by recibos

### recibos (Receipts)
- **Purpose**: Stores receipts issued for payments received from health insurance companies
- **Key Fields**: numero_recibo (unique), fecha_emision, fecha_pago, monto_total, metodo_pago, estado
- **Relationships**:
  - Links to cobranzas (SET NULL)
  - Links to obras_sociales (SET NULL)
- **Unique Constraint**: numero_recibo must be unique
- **Check Constraints**: Non-negative monto_total, fecha_pago >= fecha_emision
- **Status Values**: emitido, confirmado, anulado
- **Payment Methods**: efectivo, transferencia, cheque, tarjeta
- **Usage**: Referenced by recibos_detalle

### recibos_detalle (Receipt Line Items)
- **Purpose**: Detail lines for each receipt showing which invoices are being paid
- **Key Fields**: descripcion, monto_aplicado
- **Relationships**:
  - Links to recibos (CASCADE)
  - Links to facturas (SET NULL)
- **Check Constraints**: Non-negative monto_aplicado
- **Usage**: Provides payment allocation to specific invoices

## Security Features

All FASE 1, FASE 2, FASE 3, and FASE 4 tables include:
- ✅ Row Level Security (RLS) enabled
- ✅ Policy "Usuarios autenticados tienen acceso completo" for authenticated users (full access)
- ✅ updated_at trigger for automatic timestamp updates
- ✅ Proper indexes for performance
- ✅ UUID primary keys for security and distribution

## Indexes

### FASE 1 Indexes

| Table           | Index Name                        | Column(s)          | Purpose                        |
|-----------------|-----------------------------------|--------------------|--------------------------------|
| pacientes       | idx_pacientes_obra_social_id      | obra_social_id     | Join performance               |
| pacientes       | idx_pacientes_dni                 | dni                | Fast patient lookup            |
| conductores     | idx_conductores_dni               | dni                | Fast driver lookup             |
| obras_sociales  | idx_obras_sociales_codigo         | codigo             | Fast health insurance lookup   |
| destinos        | idx_destinos_tipo                 | tipo               | Filter destinations by type    |

### FASE 2 Indexes

| Table                | Index Name                                    | Column(s)              | Purpose                           |
|----------------------|-----------------------------------------------|------------------------|-----------------------------------|
| servicios_paciente   | idx_servicios_paciente_paciente_id           | paciente_id            | Fast patient lookups              |
| servicios_paciente   | idx_servicios_paciente_obra_social_id        | obra_social_id         | Fast health insurance filtering   |
| servicios_paciente   | idx_servicios_paciente_destino_id            | destino_id             | Fast destination filtering        |
| servicios_paciente   | idx_servicios_paciente_activo                | activo                 | Fast active service filtering     |
| periodos_facturacion | idx_periodos_facturacion_periodo             | periodo                | Fast period lookups               |
| periodos_facturacion | idx_periodos_facturacion_estado              | estado                 | Fast status filtering             |
| periodos_facturacion | idx_periodos_facturacion_fecha_inicio        | fecha_inicio           | Fast date range queries           |
| traslados_mensuales  | idx_traslados_mensuales_paciente_id          | paciente_id            | Fast patient lookups              |
| traslados_mensuales  | idx_traslados_mensuales_periodo_id           | periodo_id             | Fast period lookups               |
| traslados_mensuales  | idx_traslados_mensuales_servicio_paciente_id | servicio_paciente_id   | Fast service configuration joins  |
| traslados_mensuales  | idx_traslados_mensuales_obra_social_id       | obra_social_id         | Fast health insurance reporting   |

### FASE 3 Indexes

| Table             | Index Name                                | Column(s)        | Purpose                         |
|-------------------|-------------------------------------------|------------------|---------------------------------|
| facturas          | idx_facturas_numero_factura              | numero_factura   | Fast invoice number lookup      |
| facturas          | idx_facturas_periodo_id                  | periodo_id       | Fast billing period filtering   |
| facturas          | idx_facturas_obra_social_id              | obra_social_id   | Fast health insurance filtering |
| facturas          | idx_facturas_estado                      | estado           | Fast status filtering           |
| facturas          | idx_facturas_fecha_emision               | fecha_emision    | Fast date range queries         |
| facturas_detalle  | idx_facturas_detalle_factura_id          | factura_id       | Fast invoice lookup             |
| facturas_detalle  | idx_facturas_detalle_traslado_mensual_id | traslado_mensual_id | Fast monthly transport lookups |
| facturas_detalle  | idx_facturas_detalle_paciente_id         | paciente_id      | Fast patient lookups            |
| notas_credito     | idx_notas_credito_numero_nota            | numero_nota      | Fast credit note number lookup  |
| notas_credito     | idx_notas_credito_factura_id             | factura_id       | Fast invoice lookup             |
| notas_credito     | idx_notas_credito_obra_social_id         | obra_social_id   | Fast health insurance filtering |
| notas_credito     | idx_notas_credito_estado                 | estado           | Fast status filtering           |
| notas_credito     | idx_notas_credito_fecha_emision          | fecha_emision    | Fast date range queries         |

### FASE 4 Indexes

| Table             | Index Name                                | Column(s)        | Purpose                         |
|-------------------|-------------------------------------------|------------------|---------------------------------|
| cobranzas         | idx_cobranzas_numero_cobranza            | numero_cobranza  | Fast collection number lookup   |
| cobranzas         | idx_cobranzas_obra_social_id             | obra_social_id   | Fast health insurance filtering |
| cobranzas         | idx_cobranzas_periodo_id                 | periodo_id       | Fast billing period filtering   |
| cobranzas         | idx_cobranzas_estado                     | estado           | Fast status filtering           |
| cobranzas         | idx_cobranzas_fecha_cobranza             | fecha_cobranza   | Fast date range queries         |
| recibos           | idx_recibos_numero_recibo                | numero_recibo    | Fast receipt number lookup      |
| recibos           | idx_recibos_cobranza_id                  | cobranza_id      | Fast collection lookup          |
| recibos           | idx_recibos_obra_social_id               | obra_social_id   | Fast health insurance filtering |
| recibos           | idx_recibos_estado                       | estado           | Fast status filtering           |
| recibos           | idx_recibos_fecha_emision                | fecha_emision    | Fast issue date queries         |
| recibos           | idx_recibos_fecha_pago                   | fecha_pago       | Fast payment date queries       |
| recibos_detalle   | idx_recibos_detalle_recibo_id            | recibo_id        | Fast receipt lookup             |
| recibos_detalle   | idx_recibos_detalle_factura_id           | factura_id       | Fast invoice lookup             |

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- FASE 1 tables support soft delete via `activo` field
- FASE 2 adds billing and transport tracking capabilities
- FASE 3 adds invoicing and credit note management
- FASE 4 adds collection and receipt management
- Partial unique index on servicios_paciente ensures one active service per patient-type-destination while allowing historical inactive records
- Unique constraints ensure data integrity:
  - periodos_facturacion: unique periodo
  - traslados_mensuales: (paciente_id, periodo_id)
  - facturas: unique numero_factura
  - notas_credito: unique numero_nota
  - cobranzas: unique numero_cobranza
  - recibos: unique numero_recibo
- Check constraints validate data:
  - periodos_facturacion: fecha_fin >= fecha_inicio
  - traslados_mensuales: non-negative cantidad and monto values
  - facturas: non-negative monetary values, fecha_vencimiento >= fecha_emision
  - facturas_detalle: non-negative cantidad, precio_unitario, subtotal
  - notas_credito: non-negative monto
  - cobranzas: non-negative monetary values, monto_pendiente calculation validation, fecha_vencimiento >= fecha_cobranza
  - recibos: non-negative monto_total, fecha_pago >= fecha_emision
  - recibos_detalle: non-negative monto_aplicado
- Foreign key cascading strategies:
  - CASCADE: When parent is critical to child (paciente_id in servicios_paciente and traslados_mensuales, periodo_id in facturas, factura_id in facturas_detalle, recibo_id in recibos_detalle)
  - SET NULL: When parent is reference data (obra_social_id, destino_id, servicio_paciente_id, factura_id in notas_credito, cobranza_id, factura_id in recibos_detalle)
