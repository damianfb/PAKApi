-- FASE 4: Create collections and receipts tables for PAKApi
-- Migration: 00005_create_fase4_tables.sql

-- ============================================
-- 1. Create cobranzas table
-- ============================================
-- This table tracks collection processes for invoices from health insurance companies
-- Manages the overall collection workflow and status
CREATE TABLE cobranzas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_cobranza VARCHAR(50) NOT NULL UNIQUE, -- Collection number (e.g., COB-2026-0001)
    fecha_cobranza DATE NOT NULL,
    obra_social_id UUID REFERENCES obras_sociales(id) ON DELETE SET NULL,
    periodo_id UUID REFERENCES periodos_facturacion(id) ON DELETE SET NULL,
    monto_total DECIMAL(10,2) DEFAULT 0 CHECK (monto_total >= 0),
    monto_cobrado DECIMAL(10,2) DEFAULT 0 CHECK (monto_cobrado >= 0),
    monto_pendiente DECIMAL(10,2) DEFAULT 0 CHECK (monto_pendiente >= 0),
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, parcial, cobrado, anulado
    fecha_vencimiento DATE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure monto_pendiente is consistent
    CONSTRAINT check_monto_pendiente CHECK (monto_pendiente = monto_total - monto_cobrado),
    -- Ensure dates are logical
    CONSTRAINT check_fecha_cobranza_vencimiento CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento >= fecha_cobranza)
);

-- Add trigger for updated_at
CREATE TRIGGER update_cobranzas_updated_at
    BEFORE UPDATE ON cobranzas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE cobranzas ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON cobranzas
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_cobranzas_numero_cobranza ON cobranzas(numero_cobranza);
CREATE INDEX idx_cobranzas_obra_social_id ON cobranzas(obra_social_id);
CREATE INDEX idx_cobranzas_periodo_id ON cobranzas(periodo_id);
CREATE INDEX idx_cobranzas_estado ON cobranzas(estado);
CREATE INDEX idx_cobranzas_fecha_cobranza ON cobranzas(fecha_cobranza);

-- Add comment
COMMENT ON TABLE cobranzas IS 'Procesos de cobranza a obras sociales';

-- ============================================
-- 2. Create recibos table
-- ============================================
-- This table stores receipts issued for payments received from health insurance companies
-- Each receipt represents an actual payment received
CREATE TABLE recibos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_recibo VARCHAR(50) NOT NULL UNIQUE, -- Receipt number (e.g., REC-2026-0001)
    fecha_emision DATE NOT NULL,
    fecha_pago DATE NOT NULL,
    cobranza_id UUID REFERENCES cobranzas(id) ON DELETE SET NULL,
    obra_social_id UUID REFERENCES obras_sociales(id) ON DELETE SET NULL,
    monto_total DECIMAL(10,2) DEFAULT 0 CHECK (monto_total >= 0),
    metodo_pago VARCHAR(50), -- efectivo, transferencia, cheque, tarjeta
    numero_operacion VARCHAR(100), -- Bank transaction number or check number
    estado VARCHAR(50) DEFAULT 'emitido', -- emitido, confirmado, anulado
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure dates are logical
    CONSTRAINT check_fecha_emision_pago CHECK (fecha_pago >= fecha_emision)
);

-- Add trigger for updated_at
CREATE TRIGGER update_recibos_updated_at
    BEFORE UPDATE ON recibos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON recibos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_recibos_numero_recibo ON recibos(numero_recibo);
CREATE INDEX idx_recibos_cobranza_id ON recibos(cobranza_id);
CREATE INDEX idx_recibos_obra_social_id ON recibos(obra_social_id);
CREATE INDEX idx_recibos_estado ON recibos(estado);
CREATE INDEX idx_recibos_fecha_emision ON recibos(fecha_emision);
CREATE INDEX idx_recibos_fecha_pago ON recibos(fecha_pago);

-- Add comment
COMMENT ON TABLE recibos IS 'Recibos de pagos recibidos de obras sociales';

-- ============================================
-- 3. Create recibos_detalle table
-- ============================================
-- This table stores receipt line items showing which invoices are being paid
-- Links receipts to the specific invoices they cover
CREATE TABLE recibos_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recibo_id UUID NOT NULL REFERENCES recibos(id) ON DELETE CASCADE,
    factura_id UUID REFERENCES facturas(id) ON DELETE SET NULL,
    descripcion VARCHAR(500) NOT NULL, -- Description of payment item
    monto_aplicado DECIMAL(10,2) DEFAULT 0 CHECK (monto_aplicado >= 0), -- Amount applied to this invoice
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER update_recibos_detalle_updated_at
    BEFORE UPDATE ON recibos_detalle
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE recibos_detalle ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON recibos_detalle
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_recibos_detalle_recibo_id ON recibos_detalle(recibo_id);
CREATE INDEX idx_recibos_detalle_factura_id ON recibos_detalle(factura_id);

-- Add comment
COMMENT ON TABLE recibos_detalle IS 'Líneas de detalle de recibos aplicadas a facturas';
