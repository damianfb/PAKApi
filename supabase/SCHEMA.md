# Database Schema Diagram - FASE 1

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

## Table Descriptions

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
- **Usage**: Will be referenced in future viajes table

## Security Features

All tables include:
- ✅ Row Level Security (RLS) enabled
- ✅ Policy for authenticated users (full access)
- ✅ updated_at trigger for automatic timestamp updates
- ✅ Proper indexes for performance
- ✅ UUID primary keys for security and distribution

## Indexes

| Table           | Index Name                        | Column(s)          | Purpose                        |
|-----------------|-----------------------------------|--------------------|--------------------------------|
| pacientes       | idx_pacientes_obra_social_id      | obra_social_id     | Join performance               |
| pacientes       | idx_pacientes_dni                 | dni                | Fast patient lookup            |
| conductores     | idx_conductores_dni               | dni                | Fast driver lookup             |
| obras_sociales  | idx_obras_sociales_codigo         | codigo             | Fast health insurance lookup   |
| destinos        | idx_destinos_tipo                 | tipo               | Filter destinations by type    |

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- All tables support soft delete via `activo` field
- Future FASE 2 will likely include viajes (trips) table linking pacientes, conductores, and destinos
