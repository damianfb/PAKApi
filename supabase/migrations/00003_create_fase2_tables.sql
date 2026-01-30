-- FASE 2: Create billing and monthly transport tracking tables for PAKApi
-- Migration: 00003_create_fase2_tables.sql

-- ============================================
-- 1. Create servicios_paciente table
-- ============================================
-- This table stores the transport service configuration for each patient
-- Defines transport types, frequencies, and monthly limits
CREATE TABLE servicios_paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    obra_social_id UUID REFERENCES obras_sociales(id) ON DELETE SET NULL,
    destino_id UUID REFERENCES destinos(id) ON DELETE SET NULL,
    tipo_servicio VARCHAR(100) NOT NULL, -- ambulancia, traslado_programado, urgencia, etc.
    frecuencia VARCHAR(50), -- diario, semanal, mensual, por_demanda
    dias_semana VARCHAR(100), -- lunes,martes,miercoles... (for weekly services)
    cantidad_mensual INTEGER DEFAULT 0, -- number of transports allowed per month
    observaciones TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Composite unique constraint: one active service per patient-type-destination
    CONSTRAINT unique_servicio_paciente UNIQUE (paciente_id, tipo_servicio, destino_id, activo)
);

-- Add trigger for updated_at
CREATE TRIGGER update_servicios_paciente_updated_at
    BEFORE UPDATE ON servicios_paciente
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE servicios_paciente ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON servicios_paciente
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_servicios_paciente_paciente_id ON servicios_paciente(paciente_id);
CREATE INDEX idx_servicios_paciente_obra_social_id ON servicios_paciente(obra_social_id);
CREATE INDEX idx_servicios_paciente_destino_id ON servicios_paciente(destino_id);
CREATE INDEX idx_servicios_paciente_activo ON servicios_paciente(activo);

-- Add comment
COMMENT ON TABLE servicios_paciente IS 'Configuración de servicios de traslado por paciente';

-- ============================================
-- 2. Create periodos_facturacion table
-- ============================================
-- This table stores monthly billing periods
CREATE TABLE periodos_facturacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periodo VARCHAR(7) NOT NULL UNIQUE, -- YYYY-MM format, e.g., 2026-01
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'abierto', -- abierto, cerrado, facturado
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure dates are logical
    CONSTRAINT check_fecha_inicio_fin CHECK (fecha_fin >= fecha_inicio)
);

-- Add trigger for updated_at
CREATE TRIGGER update_periodos_facturacion_updated_at
    BEFORE UPDATE ON periodos_facturacion
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE periodos_facturacion ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON periodos_facturacion
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_periodos_facturacion_periodo ON periodos_facturacion(periodo);
CREATE INDEX idx_periodos_facturacion_estado ON periodos_facturacion(estado);
CREATE INDEX idx_periodos_facturacion_fecha_inicio ON periodos_facturacion(fecha_inicio);

-- Add comment
COMMENT ON TABLE periodos_facturacion IS 'Períodos de facturación mensuales';

-- ============================================
-- 3. Create traslados_mensuales table
-- ============================================
-- This table tracks monthly transport counts per patient
CREATE TABLE traslados_mensuales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    periodo_id UUID NOT NULL REFERENCES periodos_facturacion(id) ON DELETE CASCADE,
    servicio_paciente_id UUID REFERENCES servicios_paciente(id) ON DELETE SET NULL,
    obra_social_id UUID REFERENCES obras_sociales(id) ON DELETE SET NULL,
    cantidad_traslados INTEGER DEFAULT 0,
    cantidad_autorizada INTEGER DEFAULT 0,
    cantidad_excedida INTEGER DEFAULT 0,
    monto_total DECIMAL(10, 2) DEFAULT 0.00,
    monto_obra_social DECIMAL(10, 2) DEFAULT 0.00,
    monto_paciente DECIMAL(10, 2) DEFAULT 0.00,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Composite unique constraint: one record per patient per period
    CONSTRAINT unique_traslado_mensual UNIQUE (paciente_id, periodo_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_traslados_mensuales_updated_at
    BEFORE UPDATE ON traslados_mensuales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE traslados_mensuales ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON traslados_mensuales
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_traslados_mensuales_paciente_id ON traslados_mensuales(paciente_id);
CREATE INDEX idx_traslados_mensuales_periodo_id ON traslados_mensuales(periodo_id);
CREATE INDEX idx_traslados_mensuales_servicio_paciente_id ON traslados_mensuales(servicio_paciente_id);
CREATE INDEX idx_traslados_mensuales_obra_social_id ON traslados_mensuales(obra_social_id);

-- Add comment
COMMENT ON TABLE traslados_mensuales IS 'Registro mensual de traslados realizados por paciente';
