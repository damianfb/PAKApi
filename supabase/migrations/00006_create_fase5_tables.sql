-- FASE 5: Create transport schedules table for PAKApi
-- Migration: 00006_create_fase5_tables.sql

-- ============================================
-- 1. Create horarios_traslados table
-- ============================================
-- This table stores individual transport schedules/trips for patients
-- Each record represents a scheduled transport with specific date, time, and driver assignment
CREATE TABLE horarios_traslados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    conductor_id UUID REFERENCES conductores(id) ON DELETE SET NULL,
    destino_id UUID REFERENCES destinos(id) ON DELETE SET NULL,
    servicio_paciente_id UUID REFERENCES servicios_paciente(id) ON DELETE SET NULL,
    traslado_mensual_id UUID REFERENCES traslados_mensuales(id) ON DELETE SET NULL,
    fecha DATE NOT NULL, -- Scheduled date
    hora_inicio TIME, -- Scheduled start time
    hora_fin TIME, -- Scheduled end time
    hora_salida_real TIME, -- Actual departure time
    hora_llegada_real TIME, -- Actual arrival time
    tipo_traslado VARCHAR(100) NOT NULL, -- ida, vuelta, ida_y_vuelta
    estado VARCHAR(50) DEFAULT 'programado', -- programado, confirmado, en_curso, completado, cancelado, no_realizado
    distancia_km DECIMAL(8,2), -- Distance in kilometers
    observaciones TEXT,
    motivo_cancelacion TEXT, -- Reason for cancellation if estado = cancelado or no_realizado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Composite unique constraint: one schedule per patient per date per service type
    CONSTRAINT unique_horario_traslado UNIQUE (paciente_id, fecha, tipo_traslado, servicio_paciente_id),
    -- Check constraints for data validation
    CONSTRAINT check_distancia_non_negative CHECK (distancia_km IS NULL OR distancia_km >= 0),
    CONSTRAINT check_hora_inicio_fin CHECK (hora_fin IS NULL OR hora_inicio IS NULL OR hora_fin >= hora_inicio),
    CONSTRAINT check_hora_salida_llegada CHECK (hora_llegada_real IS NULL OR hora_salida_real IS NULL OR hora_llegada_real >= hora_salida_real)
);

-- Add trigger for updated_at
CREATE TRIGGER update_horarios_traslados_updated_at
    BEFORE UPDATE ON horarios_traslados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE horarios_traslados ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON horarios_traslados
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_horarios_traslados_paciente_id ON horarios_traslados(paciente_id);
CREATE INDEX idx_horarios_traslados_conductor_id ON horarios_traslados(conductor_id);
CREATE INDEX idx_horarios_traslados_destino_id ON horarios_traslados(destino_id);
CREATE INDEX idx_horarios_traslados_servicio_paciente_id ON horarios_traslados(servicio_paciente_id);
CREATE INDEX idx_horarios_traslados_traslado_mensual_id ON horarios_traslados(traslado_mensual_id);
CREATE INDEX idx_horarios_traslados_fecha ON horarios_traslados(fecha);
CREATE INDEX idx_horarios_traslados_estado ON horarios_traslados(estado);

-- Add comment
COMMENT ON TABLE horarios_traslados IS 'Horarios y programación de traslados individuales de pacientes';

-- ============================================
-- Summary
-- ============================================
-- Created 1 table:
-- 1. horarios_traslados - Individual transport schedules/trips with date, time, and driver assignment
--
-- This table includes:
-- - UUID primary key
-- - Row Level Security enabled
-- - Full access policy for authenticated users
-- - updated_at trigger for automatic timestamp management
-- - Appropriate indexes for query performance
-- - Check constraints for data validation (non-negative distance, logical time sequences)
-- - Composite unique constraint: (paciente_id, fecha, tipo_traslado, servicio_paciente_id)
-- - Foreign key relationships with proper CASCADE/SET NULL rules:
--   - paciente_id → pacientes (CASCADE) - patient is essential
--   - conductor_id → conductores (SET NULL) - preserve record if driver removed
--   - destino_id → destinos (SET NULL) - preserve record if destination removed
--   - servicio_paciente_id → servicios_paciente (SET NULL) - preserve record if service config removed
--   - traslado_mensual_id → traslados_mensuales (SET NULL) - preserve record if monthly aggregate removed
