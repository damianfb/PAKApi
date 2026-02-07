-- Migration: Add RLS to presupuesto tables
-- Date: 2026-02-07

-- Enable RLS on presupuesto_conceptos
ALTER TABLE presupuesto_conceptos ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON presupuesto_conceptos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Enable RLS on presupuesto_movimientos
ALTER TABLE presupuesto_movimientos ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Usuarios autenticados tienen acceso completo"
    ON presupuesto_movimientos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
