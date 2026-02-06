-- FASE 9: Add missing fields for CARTERA functionality
-- Migration: 00009_add_cartera_fields.sql
-- This migration adds the fields needed to fully support the CARTERA Excel functionality

-- ============================================
-- 1. Add missing fields to servicios_paciente
-- ============================================

-- Add kilometros_diarios: kilometers traveled per day for this service
ALTER TABLE servicios_paciente 
ADD COLUMN IF NOT EXISTS kilometros_diarios DECIMAL(8, 2) DEFAULT 0;

-- Add hora_ida: departure time
ALTER TABLE servicios_paciente 
ADD COLUMN IF NOT EXISTS hora_ida TIME;

-- Add hora_vuelta: return time
ALTER TABLE servicios_paciente 
ADD COLUMN IF NOT EXISTS hora_vuelta TIME;

-- Add numero_autorizacion: authorization number (AD column in Excel)
ALTER TABLE servicios_paciente 
ADD COLUMN IF NOT EXISTS numero_autorizacion VARCHAR(50);

-- Add valor_por_km: value per km (can override the default based on dependencia)
ALTER TABLE servicios_paciente 
ADD COLUMN IF NOT EXISTS valor_por_km DECIMAL(10, 2);

-- Add monto_mensual_estimado: calculated monthly amount
ALTER TABLE servicios_paciente 
ADD COLUMN IF NOT EXISTS monto_mensual_estimado DECIMAL(12, 2) DEFAULT 0;

-- Add comments
COMMENT ON COLUMN servicios_paciente.kilometros_diarios IS 'Kilometers per day for this service (KM/DIA in CARTERA)';
COMMENT ON COLUMN servicios_paciente.hora_ida IS 'Scheduled departure time';
COMMENT ON COLUMN servicios_paciente.hora_vuelta IS 'Scheduled return time';
COMMENT ON COLUMN servicios_paciente.numero_autorizacion IS 'Authorization number from obra social (AD in CARTERA)';
COMMENT ON COLUMN servicios_paciente.valor_por_km IS 'Value per km for this service (overrides default if set)';
COMMENT ON COLUMN servicios_paciente.monto_mensual_estimado IS 'Estimated monthly amount (calculated: cantidad_mensual * kilometros_diarios * valor_por_km)';

-- ============================================
-- 2. Add missing fields to pacientes
-- ============================================

-- Add tutor_responsable if not exists
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS tutor_responsable VARCHAR(255);

-- Add telefono_tutor if not exists
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS telefono_tutor VARCHAR(50);

-- Add telefono_alternativo if not exists
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS telefono_alternativo VARCHAR(50);

-- Add tipo_dependencia to determine km value
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS tipo_dependencia VARCHAR(20) DEFAULT 'S/DEPEN' 
CHECK (tipo_dependencia IN ('C/DEPEN', 'S/DEPEN'));

-- Add comments
COMMENT ON COLUMN pacientes.tutor_responsable IS 'Name of parent/guardian (MAMA-PAPA in CARTERA)';
COMMENT ON COLUMN pacientes.telefono_tutor IS 'Phone number of parent/guardian';
COMMENT ON COLUMN pacientes.tipo_dependencia IS 'Dependency type: C/DEPEN (with) or S/DEPEN (without) - affects km value';

-- ============================================
-- 3. Create configuration table for km values
-- ============================================

CREATE TABLE IF NOT EXISTS configuracion_valores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor DECIMAL(12, 2) NOT NULL,
    descripcion TEXT,
    vigente_desde DATE NOT NULL DEFAULT CURRENT_DATE,
    vigente_hasta DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_configuracion_valores_updated_at
    BEFORE UPDATE ON configuracion_valores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE configuracion_valores ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON configuracion_valores
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert default km values (from CARTERA Excel - Resol. 2/2025)
INSERT INTO configuracion_valores (clave, valor, descripcion, vigente_desde) VALUES
    ('VALOR_KM_SIN_DEPENDENCIA', 617.62, 'Valor por km para pacientes S/DEPEN (Resolucion 2/2025)', '2025-01-01'),
    ('VALOR_KM_CON_DEPENDENCIA', 833.79, 'Valor por km para pacientes C/DEPEN (Resolucion 2/2025)', '2025-01-01')
ON CONFLICT (clave) DO UPDATE SET 
    valor = EXCLUDED.valor,
    descripcion = EXCLUDED.descripcion,
    vigente_desde = EXCLUDED.vigente_desde;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_configuracion_valores_clave ON configuracion_valores(clave);
CREATE INDEX IF NOT EXISTS idx_configuracion_valores_activo ON configuracion_valores(activo);

-- ============================================
-- 4. Create view for cartera summary
-- ============================================

CREATE OR REPLACE VIEW vista_cartera AS
SELECT 
    p.id as paciente_id,
    p.apellido,
    p.nombre,
    p.dni,
    p.telefono,
    p.tutor_responsable,
    p.direccion as direccion_particular,
    p.ciudad as localidad,
    p.numero_afiliado,
    p.tipo_dependencia,
    p.activo,
    os.id as obra_social_id,
    os.nombre as obra_social_nombre,
    os.codigo as obra_social_codigo,
    -- Aggregate services data
    (
        SELECT json_agg(json_build_object(
            'id', sp.id,
            'tipo_servicio', sp.tipo_servicio,
            'destino_nombre', d.nombre,
            'destino_direccion', d.direccion,
            'dias_semana', sp.dias_semana,
            'cantidad_mensual', sp.cantidad_mensual,
            'kilometros_diarios', sp.kilometros_diarios,
            'valor_por_km', COALESCE(sp.valor_por_km, 
                CASE WHEN p.tipo_dependencia = 'C/DEPEN' 
                    THEN (SELECT valor FROM configuracion_valores WHERE clave = 'VALOR_KM_CON_DEPENDENCIA' AND activo = true LIMIT 1)
                    ELSE (SELECT valor FROM configuracion_valores WHERE clave = 'VALOR_KM_SIN_DEPENDENCIA' AND activo = true LIMIT 1)
                END
            ),
            'numero_autorizacion', sp.numero_autorizacion,
            'monto_mensual_estimado', sp.monto_mensual_estimado,
            'activo', sp.activo
        ) ORDER BY sp.tipo_servicio)
        FROM servicios_paciente sp
        LEFT JOIN destinos d ON sp.destino_id = d.id
        WHERE sp.paciente_id = p.id AND sp.activo = true
    ) as servicios,
    -- Calculate totals
    (
        SELECT COALESCE(SUM(sp.kilometros_diarios * sp.cantidad_mensual), 0)
        FROM servicios_paciente sp
        WHERE sp.paciente_id = p.id AND sp.activo = true
    ) as total_km_mes,
    (
        SELECT COALESCE(SUM(sp.monto_mensual_estimado), 0)
        FROM servicios_paciente sp
        WHERE sp.paciente_id = p.id AND sp.activo = true
    ) as total_monto_mensual,
    -- Get default km value based on dependencia
    CASE WHEN p.tipo_dependencia = 'C/DEPEN' 
        THEN (SELECT valor FROM configuracion_valores WHERE clave = 'VALOR_KM_CON_DEPENDENCIA' AND activo = true LIMIT 1)
        ELSE (SELECT valor FROM configuracion_valores WHERE clave = 'VALOR_KM_SIN_DEPENDENCIA' AND activo = true LIMIT 1)
    END as valor_km_default
FROM pacientes p
LEFT JOIN obras_sociales os ON p.obra_social_id = os.id
WHERE p.activo = true
ORDER BY p.apellido, p.nombre;

COMMENT ON VIEW vista_cartera IS 'Vista consolidada de cartera de pacientes con sus servicios y totales';

