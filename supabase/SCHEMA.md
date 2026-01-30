# Database Schema Diagram - FASE 1 & FASE 2

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
│ UNIQUE(paciente_id, tipo_servicio,  │
│        destino_id, activo)           │
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
│ estado (VARCHAR 50, DEFAULT 'abierto')
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
- **Unique Constraint**: One active service per patient-type-destination combination
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
- **Billing Fields**: monto_total, monto_obra_social, monto_paciente (DECIMAL 10,2)

## Security Features

All FASE 1 and FASE 2 tables include:
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

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- FASE 1 tables support soft delete via `activo` field
- FASE 2 adds billing and transport tracking capabilities
- Composite unique constraints ensure data integrity:
  - servicios_paciente: (paciente_id, tipo_servicio, destino_id, activo)
  - traslados_mensuales: (paciente_id, periodo_id)
- Foreign key cascading strategies:
  - CASCADE: When parent is critical to child (paciente_id in servicios_paciente and traslados_mensuales)
  - SET NULL: When parent is reference data (obra_social_id, destino_id, servicio_paciente_id)
