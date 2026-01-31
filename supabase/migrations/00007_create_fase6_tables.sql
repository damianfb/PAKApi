-- FASE 6: Create operational expenses and driver settlements tables for PAKApi
-- Migration: 00007_create_fase6_tables.sql

-- ============================================
-- 1. Create gastos_operativos table
-- ============================================
-- This table tracks operational expenses related to patient transport operations
-- Includes fuel, vehicle maintenance, tolls, insurance, and other operational costs
CREATE TABLE gastos_operativos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_gasto VARCHAR(50) NOT NULL UNIQUE, -- Expense number (e.g., GAS-2026-0001)
    fecha DATE NOT NULL,
    tipo_gasto VARCHAR(100) NOT NULL, -- combustible, mantenimiento, peaje, seguro, limpieza, reparacion, otros
    monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
    conductor_id UUID REFERENCES conductores(id) ON DELETE SET NULL,
    periodo_id UUID REFERENCES periodos_facturacion(id) ON DELETE SET NULL,
    descripcion TEXT,
    comprobante VARCHAR(100), -- Receipt or voucher number
    proveedor VARCHAR(255), -- Supplier/vendor name
    estado VARCHAR(50) DEFAULT 'registrado', -- registrado, aprobado, pagado, rechazado, anulado
    fecha_pago DATE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure payment date is not before expense date
    CONSTRAINT check_fecha_pago CHECK (fecha_pago IS NULL OR fecha_pago >= fecha)
);

-- Add trigger for updated_at
CREATE TRIGGER update_gastos_operativos_updated_at
    BEFORE UPDATE ON gastos_operativos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE gastos_operativos ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON gastos_operativos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_gastos_operativos_numero_gasto ON gastos_operativos(numero_gasto);
CREATE INDEX idx_gastos_operativos_conductor_id ON gastos_operativos(conductor_id);
CREATE INDEX idx_gastos_operativos_periodo_id ON gastos_operativos(periodo_id);
CREATE INDEX idx_gastos_operativos_tipo_gasto ON gastos_operativos(tipo_gasto);
CREATE INDEX idx_gastos_operativos_estado ON gastos_operativos(estado);
CREATE INDEX idx_gastos_operativos_fecha ON gastos_operativos(fecha);

-- Add comment
COMMENT ON TABLE gastos_operativos IS 'Gastos operativos del sistema de transporte (combustible, mantenimiento, etc.)';

-- ============================================
-- 2. Create liquidaciones_conductores table
-- ============================================
-- This table tracks driver payment settlements/liquidations
-- Calculates driver compensation based on completed transports minus operational expenses
CREATE TABLE liquidaciones_conductores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_liquidacion VARCHAR(50) NOT NULL UNIQUE, -- Settlement number (e.g., LIQ-2026-0001)
    conductor_id UUID NOT NULL REFERENCES conductores(id) ON DELETE CASCADE,
    periodo_id UUID REFERENCES periodos_facturacion(id) ON DELETE SET NULL,
    fecha_generacion DATE NOT NULL,
    fecha_pago DATE,
    cantidad_traslados INTEGER DEFAULT 0 CHECK (cantidad_traslados >= 0),
    monto_traslados DECIMAL(10,2) DEFAULT 0 CHECK (monto_traslados >= 0), -- Total amount for transports
    monto_gastos DECIMAL(10,2) DEFAULT 0 CHECK (monto_gastos >= 0), -- Total deductions from operational expenses
    monto_bonificaciones DECIMAL(10,2) DEFAULT 0 CHECK (monto_bonificaciones >= 0), -- Bonuses/incentives
    monto_deducciones DECIMAL(10,2) DEFAULT 0 CHECK (monto_deducciones >= 0), -- Other deductions
    monto_neto DECIMAL(10,2) DEFAULT 0 CHECK (monto_neto >= 0), -- Net amount to pay
    metodo_pago VARCHAR(50), -- transferencia, efectivo, cheque
    numero_comprobante VARCHAR(100), -- Payment receipt/transaction number
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, aprobada, pagada, anulada
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure net amount calculation is consistent
    CONSTRAINT check_monto_neto CHECK (monto_neto = monto_traslados - monto_gastos + monto_bonificaciones - monto_deducciones),
    -- Ensure payment date is not before generation date
    CONSTRAINT check_fecha_pago_liquidacion CHECK (fecha_pago IS NULL OR fecha_pago >= fecha_generacion)
);

-- Add trigger for updated_at
CREATE TRIGGER update_liquidaciones_conductores_updated_at
    BEFORE UPDATE ON liquidaciones_conductores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE liquidaciones_conductores ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON liquidaciones_conductores
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_liquidaciones_conductores_numero_liquidacion ON liquidaciones_conductores(numero_liquidacion);
CREATE INDEX idx_liquidaciones_conductores_conductor_id ON liquidaciones_conductores(conductor_id);
CREATE INDEX idx_liquidaciones_conductores_periodo_id ON liquidaciones_conductores(periodo_id);
CREATE INDEX idx_liquidaciones_conductores_estado ON liquidaciones_conductores(estado);
CREATE INDEX idx_liquidaciones_conductores_fecha_generacion ON liquidaciones_conductores(fecha_generacion);
CREATE INDEX idx_liquidaciones_conductores_fecha_pago ON liquidaciones_conductores(fecha_pago);

-- Add comment
COMMENT ON TABLE liquidaciones_conductores IS 'Liquidaciones de pagos a conductores basadas en traslados realizados';

-- ============================================
-- Summary
-- ============================================
-- Created 2 tables:
-- 1. gastos_operativos - Operational expenses tracking (fuel, maintenance, tolls, etc.)
-- 2. liquidaciones_conductores - Driver payment settlements based on transports and expenses
--
-- Both tables include:
-- - UUID primary key
-- - Row Level Security enabled
-- - Full access policy for authenticated users
-- - updated_at trigger for automatic timestamp management
-- - Appropriate indexes for query performance
-- - Check constraints for data validation (non-negative amounts, logical date sequences)
-- - Unique constraint on number fields (numero_gasto, numero_liquidacion)
-- - Foreign key relationships with proper CASCADE/SET NULL rules:
--   - gastos_operativos: conductor_id → conductores (SET NULL), periodo_id → periodos_facturacion (SET NULL)
--   - liquidaciones_conductores: conductor_id → conductores (CASCADE), periodo_id → periodos_facturacion (SET NULL)
