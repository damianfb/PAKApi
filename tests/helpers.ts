// Helper functions for PAKApi E2E tests
// Provides utility functions for test data creation, cleanup, and assertions

import { createTestClient, callEdgeFunction } from './config.ts';
import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';

// Generate unique test identifier
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Generate unique DNI for test patients/drivers
export function generateTestDNI(): string {
  return `9${Date.now().toString().substring(3, 10)}`;
}

// Create test obra social
export async function createTestObraSocial(codigo?: string) {
  const testId = generateTestId();
  const response = await callEdgeFunction('obras-sociales', {
    method: 'POST',
    body: {
      nombre: `Test Obra Social ${testId}`,
      codigo: codigo || `TEST${testId.substring(0, 6)}`,
      telefono: '1234567890',
      email: `test${testId}@test.com`,
      activo: true,
    },
  });

  const data = await response.json();
  assertEquals(response.status, 201, 'Failed to create test obra social');
  assertExists(data.id, 'Obra social ID not returned');
  return data;
}

// Create test paciente
export async function createTestPaciente(obraSocialId?: string) {
  const testId = generateTestId();
  const dni = generateTestDNI();
  
  const response = await callEdgeFunction('pacientes', {
    method: 'POST',
    body: {
      nombre: `Test Paciente ${testId}`,
      apellido: 'Test',
      dni,
      fecha_nacimiento: '1990-01-01',
      telefono: '1234567890',
      email: `paciente${testId}@test.com`,
      direccion: 'Calle Test 123',
      ciudad: 'Test City',
      provincia: 'Test Province',
      obra_social_id: obraSocialId,
      activo: true,
    },
  });

  const data = await response.json();
  assertEquals(response.status, 201, 'Failed to create test paciente');
  assertExists(data.id, 'Paciente ID not returned');
  return data;
}

// Create test conductor
export async function createTestConductor() {
  const testId = generateTestId();
  const dni = generateTestDNI();
  
  const response = await callEdgeFunction('conductores', {
    method: 'POST',
    body: {
      nombre: `Test Conductor ${testId}`,
      apellido: 'Test',
      dni,
      telefono: '1234567890',
      email: `conductor${testId}@test.com`,
      fecha_ingreso: '2026-01-01',
      numero_licencia: `LIC${testId}`,
      vencimiento_licencia: '2030-12-31',
      activo: true,
    },
  });

  const data = await response.json();
  assertEquals(response.status, 201, 'Failed to create test conductor');
  assertExists(data.id, 'Conductor ID not returned');
  return data;
}

// Create test destino
export async function createTestDestino() {
  const testId = generateTestId();
  
  const response = await callEdgeFunction('destinos', {
    method: 'POST',
    body: {
      nombre: `Test Hospital ${testId}`,
      tipo: 'hospital',
      direccion: 'Calle Hospital 123',
      ciudad: 'Test City',
      provincia: 'Test Province',
      telefono: '1234567890',
      activo: true,
    },
  });

  const data = await response.json();
  assertEquals(response.status, 201, 'Failed to create test destino');
  assertExists(data.id, 'Destino ID not returned');
  return data;
}

// Create test servicio paciente
export async function createTestServicioPaciente(pacienteId: string, obraSocialId?: string, destinoId?: string) {
  const response = await callEdgeFunction('servicios-paciente', {
    method: 'POST',
    body: {
      paciente_id: pacienteId,
      obra_social_id: obraSocialId,
      destino_id: destinoId,
      tipo_servicio: 'ambulancia',
      frecuencia: 'mensual',
      cantidad_mensual: 10,
      fecha_inicio: '2026-01-01',
      activo: true,
    },
  });

  const data = await response.json();
  assertEquals(response.status, 201, 'Failed to create test servicio paciente');
  assertExists(data.id, 'Servicio paciente ID not returned');
  return data;
}

// Create test periodo facturacion
export async function createTestPeriodoFacturacion(periodo?: string) {
  const client = createTestClient();
  const testPeriodo = periodo || '2026-01';
  
  const { data, error } = await client
    .from('periodos_facturacion')
    .insert([{
      periodo: testPeriodo,
      fecha_inicio: `${testPeriodo}-01`,
      fecha_fin: `${testPeriodo}-31`,
      estado: 'abierto',
    }])
    .select()
    .single();

  if (error) {
    // Period might already exist, try to fetch it
    const { data: existing } = await client
      .from('periodos_facturacion')
      .select()
      .eq('periodo', testPeriodo)
      .single();
    
    if (existing) return existing;
    throw error;
  }

  assertExists(data.id, 'Periodo facturacion ID not returned');
  return data;
}

// Cleanup functions
export async function deleteTestData(table: string, id: string) {
  const client = createTestClient();
  await client.from(table).delete().eq('id', id);
}

export async function deleteTestObraSocial(id: string) {
  await callEdgeFunction('obras-sociales', {
    method: 'DELETE',
    path: `/${id}`,
  });
}

export async function deleteTestPaciente(id: string) {
  await callEdgeFunction('pacientes', {
    method: 'DELETE',
    path: `/${id}`,
  });
}

export async function deleteTestConductor(id: string) {
  await callEdgeFunction('conductores', {
    method: 'DELETE',
    path: `/${id}`,
  });
}

export async function deleteTestDestino(id: string) {
  await callEdgeFunction('destinos', {
    method: 'DELETE',
    path: `/${id}`,
  });
}

// Wait helper for async operations
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Assertion helpers
export function assertValidUUID(value: unknown, message?: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  assertEquals(typeof value, 'string', message || 'Value is not a string');
  assertEquals(uuidRegex.test(value as string), true, message || 'Value is not a valid UUID');
}

export function assertValidDate(value: unknown, message?: string): void {
  assertExists(value, message || 'Date value is null or undefined');
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof value === 'string') {
    assertEquals(dateRegex.test(value) || !isNaN(Date.parse(value)), true, message || 'Value is not a valid date');
  }
}

export function assertValidTimestamp(value: unknown, message?: string): void {
  assertExists(value, message || 'Timestamp value is null or undefined');
  if (typeof value === 'string') {
    assertEquals(!isNaN(Date.parse(value)), true, message || 'Value is not a valid timestamp');
  }
}

// Response validation helpers
export async function assertSuccessResponse(response: Response, expectedStatus = 200) {
  assertEquals(response.ok, true, `Expected successful response, got ${response.status}`);
  assertEquals(response.status, expectedStatus, `Expected status ${expectedStatus}, got ${response.status}`);
  
  const data = await response.json();
  assertExists(data, 'Response data is empty');
  return data;
}

export async function assertErrorResponse(response: Response, expectedStatus = 400) {
  assertEquals(response.ok, false, `Expected error response, got ${response.status}`);
  assertEquals(response.status, expectedStatus, `Expected status ${expectedStatus}, got ${response.status}`);
  
  const data = await response.json();
  assertExists(data.error, 'Error message not found in response');
  return data;
}

// Pagination validation
export function assertValidPagination(data: any) {
  assertExists(data.pagination, 'Pagination info not found');
  assertExists(data.pagination.total, 'Total count not found');
  assertExists(data.pagination.page, 'Page number not found');
  assertExists(data.pagination.limit, 'Limit not found');
  assertExists(data.pagination.totalPages, 'Total pages not found');
  assertExists(data.data, 'Data array not found');
  assertEquals(Array.isArray(data.data), true, 'Data is not an array');
}
