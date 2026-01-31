// E2E Tests for CRUD Operations
// Tests basic Create, Read, Update, Delete operations for all Edge Functions

import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  createTestObraSocial,
  createTestPaciente,
  createTestConductor,
  createTestDestino,
  createTestServicioPaciente,
  deleteTestObraSocial,
  deleteTestPaciente,
  deleteTestConductor,
  deleteTestDestino,
  assertSuccessResponse,
  assertValidPagination,
  assertValidUUID,
  generateTestId,
} from './helpers.ts';
import { callEdgeFunction } from './config.ts';

Deno.test('CRUD: Obras Sociales - Full lifecycle', async () => {
  let testObraSocialId: string;

  try {
    // CREATE
    const created = await createTestObraSocial();
    testObraSocialId = created.id;
    assertValidUUID(created.id);
    assertEquals(created.activo, true);

    // READ - Get by ID
    const readResponse = await callEdgeFunction('obras-sociales', {
      path: `/${testObraSocialId}`,
    });
    const readData = await assertSuccessResponse(readResponse);
    assertEquals(readData.id, testObraSocialId);

    // READ - List all
    const listResponse = await callEdgeFunction('obras-sociales', {
      path: '?page=1&limit=10',
    });
    const listData = await assertSuccessResponse(listResponse);
    assertValidPagination(listData);

    // UPDATE
    const updateResponse = await callEdgeFunction('obras-sociales', {
      method: 'PUT',
      path: `/${testObraSocialId}`,
      body: {
        nombre: 'Updated Obra Social Name',
        telefono: '9876543210',
      },
    });
    const updatedData = await assertSuccessResponse(updateResponse);
    assertEquals(updatedData.nombre, 'Updated Obra Social Name');
    assertEquals(updatedData.telefono, '9876543210');

    // DELETE (soft delete - sets activo to false)
    const deleteResponse = await callEdgeFunction('obras-sociales', {
      method: 'DELETE',
      path: `/${testObraSocialId}`,
    });
    await assertSuccessResponse(deleteResponse);

    // Verify soft delete
    const verifyResponse = await callEdgeFunction('obras-sociales', {
      path: `/${testObraSocialId}`,
    });
    const verifyData = await assertSuccessResponse(verifyResponse);
    assertEquals(verifyData.activo, false);
  } finally {
    // Cleanup
    if (testObraSocialId) {
      await deleteTestObraSocial(testObraSocialId);
    }
  }
});

Deno.test('CRUD: Pacientes - Full lifecycle', async () => {
  let testPacienteId: string;
  let testObraSocialId: string;

  try {
    // Setup
    const obraSocial = await createTestObraSocial();
    testObraSocialId = obraSocial.id;

    // CREATE
    const created = await createTestPaciente(testObraSocialId);
    testPacienteId = created.id;
    assertValidUUID(created.id);
    assertEquals(created.activo, true);

    // READ - Get by ID
    const readResponse = await callEdgeFunction('pacientes', {
      path: `/${testPacienteId}`,
    });
    const readData = await assertSuccessResponse(readResponse);
    assertEquals(readData.id, testPacienteId);

    // READ - List with filter
    const listResponse = await callEdgeFunction('pacientes', {
      path: `?obra_social_id=${testObraSocialId}&page=1&limit=10`,
    });
    const listData = await assertSuccessResponse(listResponse);
    assertValidPagination(listData);

    // UPDATE
    const updateResponse = await callEdgeFunction('pacientes', {
      method: 'PUT',
      path: `/${testPacienteId}`,
      body: {
        nombre: 'Updated Paciente Name',
        telefono: '9876543210',
      },
    });
    const updatedData = await assertSuccessResponse(updateResponse);
    assertEquals(updatedData.nombre, 'Updated Paciente Name');

    // DELETE
    const deleteResponse = await callEdgeFunction('pacientes', {
      method: 'DELETE',
      path: `/${testPacienteId}`,
    });
    await assertSuccessResponse(deleteResponse);
  } finally {
    // Cleanup
    if (testPacienteId) await deleteTestPaciente(testPacienteId);
    if (testObraSocialId) await deleteTestObraSocial(testObraSocialId);
  }
});

Deno.test('CRUD: Conductores - Full lifecycle', async () => {
  let testConductorId: string;

  try {
    // CREATE
    const created = await createTestConductor();
    testConductorId = created.id;
    assertValidUUID(created.id);
    assertEquals(created.activo, true);

    // READ - Get by ID
    const readResponse = await callEdgeFunction('conductores', {
      path: `/${testConductorId}`,
    });
    const readData = await assertSuccessResponse(readResponse);
    assertEquals(readData.id, testConductorId);

    // UPDATE
    const updateResponse = await callEdgeFunction('conductores', {
      method: 'PUT',
      path: `/${testConductorId}`,
      body: {
        nombre: 'Updated Conductor Name',
        telefono: '9876543210',
      },
    });
    const updatedData = await assertSuccessResponse(updateResponse);
    assertEquals(updatedData.nombre, 'Updated Conductor Name');

    // DELETE
    const deleteResponse = await callEdgeFunction('conductores', {
      method: 'DELETE',
      path: `/${testConductorId}`,
    });
    await assertSuccessResponse(deleteResponse);
  } finally {
    // Cleanup
    if (testConductorId) await deleteTestConductor(testConductorId);
  }
});

Deno.test('CRUD: Facturas - Full lifecycle', async () => {
  let testFacturaId: string;
  let testObraSocialId: string;
  let testPeriodoId: string;

  try {
    // Setup dependencies
    const obraSocial = await createTestObraSocial();
    testObraSocialId = obraSocial.id;

    // Create periodo using direct database call
    const { createTestPeriodoFacturacion } = await import('./helpers.ts');
    const periodo = await createTestPeriodoFacturacion();
    testPeriodoId = periodo.id;

    const testId = generateTestId();

    // CREATE
    const createResponse = await callEdgeFunction('facturas', {
      method: 'POST',
      body: {
        numero_factura: `FAC-TEST-${testId}`,
        fecha_emision: '2026-01-15',
        fecha_vencimiento: '2026-02-15',
        periodo_id: testPeriodoId,
        obra_social_id: testObraSocialId,
        subtotal: 1000.00,
        impuestos: 210.00,
        monto_total: 1210.00,
        estado: 'emitida',
      },
    });
    const created = await assertSuccessResponse(createResponse, 201);
    testFacturaId = created.id;
    assertValidUUID(created.id);

    // READ - Get by ID
    const readResponse = await callEdgeFunction('facturas', {
      path: `/${testFacturaId}`,
    });
    const readData = await assertSuccessResponse(readResponse);
    assertEquals(readData.id, testFacturaId);
    assertEquals(readData.monto_total, '1210.00');

    // UPDATE
    const updateResponse = await callEdgeFunction('facturas', {
      method: 'PUT',
      path: `/${testFacturaId}`,
      body: {
        estado: 'pagada',
        fecha_pago: '2026-02-10',
      },
    });
    const updatedData = await assertSuccessResponse(updateResponse);
    assertEquals(updatedData.estado, 'pagada');

    // DELETE (soft delete - sets estado to 'anulada')
    const deleteResponse = await callEdgeFunction('facturas', {
      method: 'DELETE',
      path: `/${testFacturaId}`,
    });
    await assertSuccessResponse(deleteResponse);
  } finally {
    // Cleanup
    const { deleteTestData } = await import('./helpers.ts');
    if (testFacturaId) await deleteTestData('facturas', testFacturaId);
    if (testPeriodoId) await deleteTestData('periodos_facturacion', testPeriodoId);
    if (testObraSocialId) await deleteTestObraSocial(testObraSocialId);
  }
});

Deno.test('CRUD: Horarios Traslados - Full lifecycle', async () => {
  let testHorarioId: string;
  let testPacienteId: string;
  let testServicioId: string;
  let testConductorId: string;
  let testDestinoId: string;
  let testObraSocialId: string;

  try {
    // Setup dependencies
    const obraSocial = await createTestObraSocial();
    testObraSocialId = obraSocial.id;

    const paciente = await createTestPaciente(testObraSocialId);
    testPacienteId = paciente.id;

    const conductor = await createTestConductor();
    testConductorId = conductor.id;

    const destino = await createTestDestino();
    testDestinoId = destino.id;

    const servicio = await createTestServicioPaciente(testPacienteId, testObraSocialId, testDestinoId);
    testServicioId = servicio.id;

    // CREATE
    const createResponse = await callEdgeFunction('horarios-traslados', {
      method: 'POST',
      body: {
        paciente_id: testPacienteId,
        servicio_id: testServicioId,
        conductor_id: testConductorId,
        destino_id: testDestinoId,
        fecha: '2026-02-01',
        hora_programada: '10:00:00',
        tipo_traslado: 'ida_vuelta',
        estado: 'programado',
      },
    });
    const created = await assertSuccessResponse(createResponse, 201);
    testHorarioId = created.id;
    assertValidUUID(created.id);

    // READ - Get by ID
    const readResponse = await callEdgeFunction('horarios-traslados', {
      path: `/${testHorarioId}`,
    });
    const readData = await assertSuccessResponse(readResponse);
    assertEquals(readData.id, testHorarioId);

    // UPDATE
    const updateResponse = await callEdgeFunction('horarios-traslados', {
      method: 'PUT',
      path: `/${testHorarioId}`,
      body: {
        estado: 'completado',
        hora_real: '10:15:00',
        distancia_km: 25.5,
      },
    });
    const updatedData = await assertSuccessResponse(updateResponse);
    assertEquals(updatedData.estado, 'completado');

    // DELETE (soft delete - sets estado to 'cancelado')
    const deleteResponse = await callEdgeFunction('horarios-traslados', {
      method: 'DELETE',
      path: `/${testHorarioId}`,
    });
    await assertSuccessResponse(deleteResponse);
  } finally {
    // Cleanup
    const { deleteTestData } = await import('./helpers.ts');
    if (testHorarioId) await deleteTestData('horarios_traslados', testHorarioId);
    if (testServicioId) await deleteTestData('servicios_paciente', testServicioId);
    if (testPacienteId) await deleteTestPaciente(testPacienteId);
    if (testConductorId) await deleteTestConductor(testConductorId);
    if (testDestinoId) await deleteTestDestino(testDestinoId);
    if (testObraSocialId) await deleteTestObraSocial(testObraSocialId);
  }
});

console.log('✅ All CRUD operations tests defined');
