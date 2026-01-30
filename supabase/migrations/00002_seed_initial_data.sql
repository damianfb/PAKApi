-- FASE 1: Seed initial data
-- Migration: 00002_seed_initial_data.sql

-- ============================================
-- 1. Seed obras_sociales (Health Insurance Companies)
-- ============================================
INSERT INTO obras_sociales (nombre, codigo, telefono, email, activo) VALUES
    ('OSDE', 'OSDE001', '0800-555-6733', 'contacto@osde.com.ar', true),
    ('Swiss Medical', 'SWISS001', '0810-333-7947', 'info@swissmedical.com.ar', true),
    ('Galeno', 'GALENO001', '0800-444-4253', 'atencion@galeno.com.ar', true),
    ('IOMA', 'IOMA001', '0221-429-6800', 'consultas@ioma.gba.gob.ar', true),
    ('PAMI', 'PAMI001', '138', 'atencion@pami.org.ar', true),
    ('Medifé', 'MEDIFE001', '0810-122-6334', 'socios@medife.com.ar', true),
    ('Sancor Salud', 'SANCOR001', '0800-555-0101', 'atencion@sancorsalud.com.ar', true),
    ('Accord Salud', 'ACCORD001', '0810-122-2267', 'info@accordsalud.com.ar', true),
    ('Prevención Salud', 'PREV001', '0810-333-7738', 'contacto@prevencion.com.ar', true),
    ('Omint', 'OMINT001', '0810-122-6646', 'socios@omint.com.ar', true),
    ('Obra Social Unión Personal', 'OSUP001', '0800-122-6787', 'info@osup.com.ar', true),
    ('Luis Pasteur', 'PASTEUR001', '0810-888-7278', 'atencion@luispasteur.com.ar', true),
    ('Hospital Británico', 'BRITANIC001', '011-4309-6400', 'info@hospitalbritanico.org.ar', true),
    ('Hospital Alemán', 'ALEMAN001', '011-4827-7000', 'informes@hospitalaleman.org.ar', true),
    ('Particular', 'PARTICULAR', NULL, NULL, true)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- 2. Seed conductores (Drivers)
-- ============================================
INSERT INTO conductores (nombre, apellido, dni, telefono, email, licencia_conducir, licencia_vencimiento, activo) VALUES
    ('Juan', 'Pérez', '20123456', '11-2345-6789', 'juan.perez@pakapi.com', 'B00123456', '2026-12-31', true),
    ('María', 'González', '27234567', '11-3456-7890', 'maria.gonzalez@pakapi.com', 'B00234567', '2027-06-30', true),
    ('Carlos', 'Rodríguez', '25345678', '11-4567-8901', 'carlos.rodriguez@pakapi.com', 'B00345678', '2026-09-15', true),
    ('Ana', 'Martínez', '30456789', '11-5678-9012', 'ana.martinez@pakapi.com', 'B00456789', '2027-03-20', true),
    ('Roberto', 'López', '22567890', '11-6789-0123', 'roberto.lopez@pakapi.com', 'B00567890', '2026-11-10', true),
    ('Laura', 'Fernández', '28678901', '11-7890-1234', 'laura.fernandez@pakapi.com', 'B00678901', '2027-08-05', true),
    ('Diego', 'Sánchez', '24789012', '11-8901-2345', 'diego.sanchez@pakapi.com', 'B00789012', '2026-10-25', true),
    ('Sofía', 'García', '31890123', '11-9012-3456', 'sofia.garcia@pakapi.com', 'B00890123', '2027-04-18', true),
    ('Martín', 'Romero', '26901234', '11-0123-4567', 'martin.romero@pakapi.com', 'B00901234', '2026-12-08', true),
    ('Lucía', 'Torres', '29012345', '11-1234-5678', 'lucia.torres@pakapi.com', 'B01012345', '2027-07-22', true)
ON CONFLICT (dni) DO NOTHING;

-- ============================================
-- 3. Add sample destinos (Destinations)
-- ============================================
INSERT INTO destinos (nombre, direccion, ciudad, provincia, tipo, telefono, activo) VALUES
    ('Hospital Italiano', 'Av. Juan de Garay 492', 'Buenos Aires', 'CABA', 'hospital', '011-4959-0200', true),
    ('Sanatorio Güemes', 'Av. Córdoba 3933', 'Buenos Aires', 'CABA', 'clinica', '011-4862-9200', true),
    ('Hospital de Clínicas', 'Av. Córdoba 2351', 'Buenos Aires', 'CABA', 'hospital', '011-5950-8000', true),
    ('Centro Médico Recoleta', 'Av. Callao 1441', 'Buenos Aires', 'CABA', 'centro_medico', '011-4801-8000', true),
    ('Sanatorio de Los Arcos', 'Av. Directorio 3052', 'Buenos Aires', 'CABA', 'clinica', '011-4631-8200', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. Add verification comments
-- ============================================
COMMENT ON TABLE obras_sociales IS 'Initial seed includes major Argentinian health insurance companies';
COMMENT ON TABLE conductores IS 'Initial seed includes 10 active drivers with valid licenses';
COMMENT ON TABLE destinos IS 'Initial seed includes major hospitals and clinics in Buenos Aires';
