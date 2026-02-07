-- Migration: Create presupuesto tables
-- Date: 2026-02-07

-- Tabla de conceptos de presupuesto (gastos/ingresos fijos mensuales)
CREATE TABLE IF NOT EXISTS presupuesto_conceptos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- 'autonomos', 'sueldos', 'servicios', 'impuestos', 'prestamos', 'honorarios', 'otros'
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('egreso', 'ingreso')),
    monto_base DECIMAL(15, 2) DEFAULT 0,
    dia_vencimiento INTEGER CHECK (dia_vencimiento >= 1 AND dia_vencimiento <= 31),
    es_recurrente BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de movimientos mensuales del presupuesto
CREATE TABLE IF NOT EXISTS presupuesto_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concepto_id UUID REFERENCES presupuesto_conceptos(id),
    periodo VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    monto DECIMAL(15, 2) NOT NULL DEFAULT 0,
    monto_pagado DECIMAL(15, 2) DEFAULT 0,
    fecha_pago DATE,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'parcial', 'cancelado')),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Campos para movimientos no recurrentes (sin concepto)
    nombre VARCHAR(255),
    categoria VARCHAR(100),
    tipo VARCHAR(20) CHECK (tipo IN ('egreso', 'ingreso'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_presupuesto_movimientos_periodo ON presupuesto_movimientos(periodo);
CREATE INDEX IF NOT EXISTS idx_presupuesto_movimientos_estado ON presupuesto_movimientos(estado);
CREATE INDEX IF NOT EXISTS idx_presupuesto_conceptos_activo ON presupuesto_conceptos(activo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_presupuesto_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_presupuesto_conceptos_updated ON presupuesto_conceptos;
CREATE TRIGGER trigger_presupuesto_conceptos_updated
    BEFORE UPDATE ON presupuesto_conceptos
    FOR EACH ROW EXECUTE FUNCTION update_presupuesto_updated_at();

DROP TRIGGER IF EXISTS trigger_presupuesto_movimientos_updated ON presupuesto_movimientos;
CREATE TRIGGER trigger_presupuesto_movimientos_updated
    BEFORE UPDATE ON presupuesto_movimientos
    FOR EACH ROW EXECUTE FUNCTION update_presupuesto_updated_at();

-- Datos iniciales de conceptos comunes basados en PRESUPUESTO.md
INSERT INTO presupuesto_conceptos (nombre, categoria, tipo, monto_base, dia_vencimiento, es_recurrente) VALUES
    ('Autónomos 1', 'autonomos', 'egreso', 47763.71, 7, true),
    ('Autónomos 2', 'autonomos', 'egreso', 46630.57, 5, true),
    ('Cuota Préstamo', 'prestamos', 'egreso', 451090.48, 15, true),
    ('Contador', 'servicios', 'egreso', 97000.00, 25, true),
    ('Pablo (Sueldo)', 'sueldos', 'egreso', 650000.00, 28, true),
    ('Vanesa (Sueldo)', 'sueldos', 'egreso', 68000.00, 20, true),
    ('Romina (Sueldo)', 'sueldos', 'egreso', 75000.00, 28, true),
    ('Marcos Fernández (Conductor)', 'sueldos', 'egreso', 850000.00, 10, true),
    ('Damián Farías (Conductor)', 'sueldos', 'egreso', 850000.00, 10, true),
    ('Honorarios Rubén', 'honorarios', 'egreso', 1000000.00, null, true),
    ('Honorarios Sergio', 'honorarios', 'egreso', 1000000.00, null, true),
    ('Tinta/Papel', 'servicios', 'egreso', 25000.00, 25, true),
    ('Ganancias Anticipo', 'impuestos', 'egreso', 0, 22, true)
ON CONFLICT DO NOTHING;

-- Comentarios
COMMENT ON TABLE presupuesto_conceptos IS 'Conceptos fijos de presupuesto (gastos/ingresos recurrentes)';
COMMENT ON TABLE presupuesto_movimientos IS 'Movimientos mensuales del presupuesto';
