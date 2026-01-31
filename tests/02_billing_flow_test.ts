// E2E Tests for Complete Billing Flow
// Tests the full billing workflow: patient → service → transports → invoice → payment

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  createTestObraSocial,
  createTestPaciente,
  createTestServicioPaciente,
  createTestPeriodoFacturacion,
  deleteTestObraSocial,
  deleteTestPaciente,
  deleteTestData,
  assertSuccessResponse,
  assertValidUUID,
  generateTestId,
} from './helpers.ts';
import { callEdgeFunction, createTestClient } from './config.ts';

Deno.test('Billing Flow: Complete workflow from patient to payment', async () => {
  const testIds: { [key: string]: string } = {};

  try {
    console.log('Step 1: Create obra social...');
    const obraSocial = await createTestObraSocial();
    testIds.obraSocialId = obraSocial.id;
    assertValidUUID(obraSocial.id);

    console.log('Step 2: Create patient...');
    const paciente = await createTestPaciente(testIds.obraSocialId);
    testIds.pacienteId = paciente.id;
    assertValidUUID(paciente.id);

    console.log('Step 3: Create patient service configuration...');
    const servicio = await createTestServicioPaciente(
      testIds.pacienteId,
      testIds.obraSocialId
    );
    testIds.servicioId = servicio.id;
    assertValidUUID(servicio.id);

    console.log('Step 4: Create billing period...');
    const periodo = await createTestPeriodoFacturacion('2026-02');
    testIds.periodoId = periodo.id;
    assertValidUUID(periodo.id);

    console.log('Step 5: Record monthly transports...');
    const trasladoResponse = await callEdgeFunction('traslados-mensuales', {
      method: 'POST',
      body: {
        paciente_id: testIds.pacienteId,
        periodo_id: testIds.periodoId,
        servicio_id: testIds.servicioId,
        cantidad_autorizada: 10,
        cantidad_realizada: 8,
        cantidad_excedida: 0,
        monto_obra_social: 4000.00,
        monto_paciente: 0.00,
        monto_total: 4000.00,
        facturado: false,
      },
    });
    const traslado = await assertSuccessResponse(trasladoResponse, 201);
    testIds.trasladoId = traslado.id;
    assertValidUUID(traslado.id);
    assertEquals(traslado.cantidad_realizada, 8);

    console.log('Step 6: Generate invoice...');
    const facturaNumber = `FAC-TEST-${generateTestId()}`;
    const facturaResponse = await callEdgeFunction('facturas', {
      method: 'POST',
      body: {
        numero_factura: facturaNumber,
        fecha_emision: '2026-02-28',
        fecha_vencimiento: '2026-03-31',
        periodo_id: testIds.periodoId,
        obra_social_id: testIds.obraSocialId,
        subtotal: 4000.00,
        impuestos: 840.00,
        monto_total: 4840.00,
        estado: 'emitida',
      },
    });
    const factura = await assertSuccessResponse(facturaResponse, 201);
    testIds.facturaId = factura.id;
    assertValidUUID(factura.id);
    assertEquals(factura.numero_factura, facturaNumber);

    console.log('Step 7: Add invoice details...');
    const client = createTestClient();
    const { data: detalle, error: detalleError } = await client
      .from('facturas_detalle')
      .insert([{
        factura_id: testIds.facturaId,
        traslado_mensual_id: testIds.trasladoId,
        paciente_id: testIds.pacienteId,
        descripcion: 'Traslados mensuales - Febrero 2026',
        cantidad: 8,
        precio_unitario: 500.00,
        subtotal: 4000.00,
      }])
      .select()
      .single();

    if (detalleError) throw detalleError;
    testIds.detalleId = detalle.id;
    assertValidUUID(detalle.id);

    console.log('Step 8: Create collection process...');
    const { data: cobranza, error: cobranzaError } = await client
      .from('cobranzas')
      .insert([{
        numero_cobranza: `COB-TEST-${generateTestId()}`,
        fecha_cobranza: '2026-03-01',
        fecha_vencimiento: '2026-03-31',
        obra_social_id: testIds.obraSocialId,
        periodo_id: testIds.periodoId,
        monto_total: 4840.00,
        monto_cobrado: 0.00,
        monto_pendiente: 4840.00,
        estado: 'pendiente',
      }])
      .select()
      .single();

    if (cobranzaError) throw cobranzaError;
    testIds.cobranzaId = cobranza.id;
    assertValidUUID(cobranza.id);

    console.log('Step 9: Process payment and create receipt...');
    const reciboNumber = `REC-TEST-${generateTestId()}`;
    const reciboResponse = await callEdgeFunction('recibos', {
      method: 'POST',
      body: {
        numero_recibo: reciboNumber,
        fecha_pago: '2026-03-15',
        cobranza_id: testIds.cobranzaId,
        obra_social_id: testIds.obraSocialId,
        monto_total: 4840.00,
        metodo_pago: 'transferencia',
        numero_transaccion: `TRX${Date.now()}`,
        estado: 'confirmado',
      },
    });
    const recibo = await assertSuccessResponse(reciboResponse, 201);
    testIds.reciboId = recibo.id;
    assertValidUUID(recibo.id);

    console.log('Step 10: Add receipt details...');
    const { data: reciboDetalle, error: reciboDetalleError } = await client
      .from('recibos_detalle')
      .insert([{
        recibo_id: testIds.reciboId,
        factura_id: testIds.facturaId,
        monto_aplicado: 4840.00,
      }])
      .select()
      .single();

    if (reciboDetalleError) throw reciboDetalleError;
    testIds.reciboDetalleId = reciboDetalle.id;

    console.log('Step 11: Update invoice as paid...');
    const updateFacturaResponse = await callEdgeFunction('facturas', {
      method: 'PUT',
      path: `/${testIds.facturaId}`,
      body: {
        estado: 'pagada',
        fecha_pago: '2026-03-15',
      },
    });
    const facturaUpdated = await assertSuccessResponse(updateFacturaResponse);
    assertEquals(facturaUpdated.estado, 'pagada');

    console.log('Step 12: Update monthly transport as invoiced...');
    const updateTrasladoResponse = await callEdgeFunction('traslados-mensuales', {
      method: 'PUT',
      path: `/${testIds.trasladoId}`,
      body: {
        facturado: true,
      },
    });
    const trasladoUpdated = await assertSuccessResponse(updateTrasladoResponse);
    assertEquals(trasladoUpdated.facturado, true);

    console.log('Step 13: Verify data integrity...');
    // Verify factura has correct totals
    const facturaCheck = await callEdgeFunction('facturas', {
      path: `/${testIds.facturaId}`,
    });
    const facturaData = await assertSuccessResponse(facturaCheck);
    assertEquals(facturaData.monto_total, '4840.00');
    assertEquals(facturaData.estado, 'pagada');

    // Verify recibo has correct amount
    const reciboCheck = await callEdgeFunction('recibos', {
      path: `/${testIds.reciboId}`,
    });
    const reciboData = await assertSuccessResponse(reciboCheck);
    assertEquals(reciboData.monto_total, '4840.00');

    console.log('✅ Complete billing flow successful!');
  } finally {
    // Cleanup in reverse order of creation
    console.log('Cleaning up test data...');
    if (testIds.reciboDetalleId) await deleteTestData('recibos_detalle', testIds.reciboDetalleId);
    if (testIds.reciboId) await deleteTestData('recibos', testIds.reciboId);
    if (testIds.cobranzaId) await deleteTestData('cobranzas', testIds.cobranzaId);
    if (testIds.detalleId) await deleteTestData('facturas_detalle', testIds.detalleId);
    if (testIds.facturaId) await deleteTestData('facturas', testIds.facturaId);
    if (testIds.trasladoId) await deleteTestData('traslados_mensuales', testIds.trasladoId);
    if (testIds.periodoId) await deleteTestData('periodos_facturacion', testIds.periodoId);
    if (testIds.servicioId) await deleteTestData('servicios_paciente', testIds.servicioId);
    if (testIds.pacienteId) await deleteTestPaciente(testIds.pacienteId);
    if (testIds.obraSocialId) await deleteTestObraSocial(testIds.obraSocialId);
  }
});

console.log('✅ Billing flow tests defined');
