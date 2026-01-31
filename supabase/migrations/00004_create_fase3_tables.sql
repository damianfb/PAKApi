-- FASE 3: Create invoicing and credit note tables for PAKApi
-- Migration: 00004_create_fase3_tables.sql

-- ============================================
-- 1. Create facturas table
-- ============================================
-- This table stores invoices generated for health insurance companies
-- Links to billing periods and aggregates transport costs
CREATE TABLE facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_factura VARCHAR(50) NOT NULL UNIQUE, -- Invoice number (e.g., FAC-2026-0001)
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    periodo_id UUID NOT NULL REFERENCES periodos_facturacion(id) ON DELETE CASCADE,
    obra_social_id UUID REFERENCES obras_sociales(id) ON DELETE SET NULL,
    subtotal DECIMAL(10,2) DEFAULT 0 CHECK (subtotal >= 0),
    impuestos DECIMAL(10,2) DEFAULT 0 CHECK (impuestos >= 0),
    monto_total DECIMAL(10,2) DEFAULT 0 CHECK (monto_total >= 0),
    estado VARCHAR(50) DEFAULT 'borrador', -- borrador, emitida, pagada, anulada
    fecha_pago TIMESTAMP WITH TIME ZONE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure dates are logical
    CONSTRAINT check_fecha_emision_vencimiento CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento >= fecha_emision)
);

-- Add trigger for updated_at
CREATE TRIGGER update_facturas_updated_at
    BEFORE UPDATE ON facturas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON facturas
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_facturas_numero_factura ON facturas(numero_factura);
CREATE INDEX idx_facturas_periodo_id ON facturas(periodo_id);
CREATE INDEX idx_facturas_obra_social_id ON facturas(obra_social_id);
CREATE INDEX idx_facturas_estado ON facturas(estado);
CREATE INDEX idx_facturas_fecha_emision ON facturas(fecha_emision);

-- Add comment
COMMENT ON TABLE facturas IS 'Facturas generadas para obras sociales';

-- ============================================
-- 2. Create facturas_detalle table
-- ============================================
-- This table stores invoice line items (detail lines)
-- Each line represents services provided that are being billed
CREATE TABLE facturas_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    traslado_mensual_id UUID REFERENCES traslados_mensuales(id) ON DELETE SET NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    descripcion VARCHAR(500) NOT NULL, -- Description of service/line item
    cantidad INTEGER DEFAULT 0 CHECK (cantidad >= 0), -- Number of transports or units
    precio_unitario DECIMAL(10,2) DEFAULT 0 CHECK (precio_unitario >= 0), -- Unit price
    subtotal DECIMAL(10,2) DEFAULT 0 CHECK (subtotal >= 0), -- Line subtotal (cantidad * precio_unitario)
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_facturas_detalle_updated_at
    BEFORE UPDATE ON facturas_detalle
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE facturas_detalle ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON facturas_detalle
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_facturas_detalle_factura_id ON facturas_detalle(factura_id);
CREATE INDEX idx_facturas_detalle_traslado_mensual_id ON facturas_detalle(traslado_mensual_id);
CREATE INDEX idx_facturas_detalle_paciente_id ON facturas_detalle(paciente_id);

-- Add comment
COMMENT ON TABLE facturas_detalle IS 'Líneas de detalle de facturas con servicios prestados';

-- ============================================
-- 3. Create notas_credito table
-- ============================================
-- This table stores credit notes for invoice adjustments
-- Used for corrections, cancellations, overcharges, discounts, etc.
CREATE TABLE notas_credito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_nota VARCHAR(50) NOT NULL UNIQUE, -- Credit note number (e.g., NC-2026-0001)
    fecha_emision DATE NOT NULL,
    factura_id UUID REFERENCES facturas(id) ON DELETE SET NULL,
    obra_social_id UUID REFERENCES obras_sociales(id) ON DELETE SET NULL,
    motivo VARCHAR(100) NOT NULL, -- sobrecobranza, error_facturacion, cancelacion, ajuste, descuento
    descripcion TEXT NOT NULL, -- Detailed description of the credit note
    monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0), -- Credit amount
    estado VARCHAR(50) DEFAULT 'borrador', -- borrador, emitida, aplicada, anulada
    fecha_aplicacion TIMESTAMP WITH TIME ZONE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_notas_credito_updated_at
    BEFORE UPDATE ON notas_credito
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE notas_credito ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON notas_credito
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_notas_credito_numero_nota ON notas_credito(numero_nota);
CREATE INDEX idx_notas_credito_factura_id ON notas_credito(factura_id);
CREATE INDEX idx_notas_credito_obra_social_id ON notas_credito(obra_social_id);
CREATE INDEX idx_notas_credito_estado ON notas_credito(estado);
CREATE INDEX idx_notas_credito_fecha_emision ON notas_credito(fecha_emision);

-- Add comment
COMMENT ON TABLE notas_credito IS 'Notas de crédito para ajustes y correcciones de facturas';

-- ============================================
-- Summary
-- ============================================
-- Created 3 tables:
-- 1. facturas - Invoice header table with billing period and health insurance references
-- 2. facturas_detalle - Invoice line items with service details and pricing
-- 3. notas_credito - Credit notes for invoice adjustments and corrections
--
-- All tables include:
-- - UUID primary keys
-- - Row Level Security enabled
-- - Full access policies for authenticated users
-- - updated_at triggers for automatic timestamp management
-- - Appropriate indexes for query performance
-- - Check constraints for data validation
-- - Foreign key relationships with proper CASCADE/SET NULL rules
