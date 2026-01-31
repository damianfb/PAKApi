// E2E Tests for Driver Liquidation Flow
// Tests the complete driver liquidation workflow: schedule → expenses → settlement → payment

import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  createTestObraSocial,
  createTestPaciente,
  createTestConductor,
  createTestDestino,
  createTestServicioPaciente,
  createTestPeriodoFacturacion,
  deleteTestObraSocial,
  deleteTestPaciente,
  deleteTestConductor,
  deleteTestDestino,
  deleteTestData,
  assertSuccessResponse,
  assertValidUUID,
  generateTestId,
} from './helpers.ts';
import { callEdgeFunction } from './config.ts';

Deno.test('Liquidation Flow: Complete driver settlement workflow', async () => {
  const testIds: { [key: string]: string } = {};

  try {
    console.log('Step 1: Create conductor (driver)...');
    const conductor = await createTestConductor();
    testIds.conductorId = conductor.id;
    assertValidUUID(conductor.id);

    console.log('Step 2: Create supporting entities...');
    const obraSocial = await createTestObraSocial();
    testIds.obraSocialId = obraSocial.id;

    const paciente = await createTestPaciente(testIds.obraSocialId);
    testIds.pacienteId = paciente.id;

    const destino = await createTestDestino();
    testIds.destinoId = destino.id;

    const servicio = await createTestServicioPaciente(
      testIds.pacienteId,
      testIds.obraSocialId,
      testIds.destinoId
    );
    testIds.servicioId = servicio.id;

    const periodo = await createTestPeriodoFacturacion('2026-03');
    testIds.periodoId = periodo.id;

    console.log('Step 3: Schedule transport appointments...');
    const horarios = [];
    for (let i = 1; i <= 5; i++) {
      const horarioResponse = await callEdgeFunction('horarios-traslados', {
        method: 'POST',
        body: {
          paciente_id: testIds.pacienteId,
          servicio_id: testIds.servicioId,
          conductor_id: testIds.conductorId,
          destino_id: testIds.destinoId,
          fecha: `2026-03-${String(i).padStart(2, '0')}`,
          hora_programada: '10:00:00',
          tipo_traslado: 'ida_vuelta',
          estado: 'completado',
          distancia_km: 30,
        },
      });
      const horario = await assertSuccessResponse(horarioResponse, 201);
      horarios.push(horario.id);
    }
    testIds.horarios = horarios;
    console.log(`Created ${horarios.length} transport schedules`);

    console.log('Step 4: Record operational expenses...');
    const gastos = [];
    
    // Fuel expense
    const gastoFuelResponse = await callEdgeFunction('gastos-operativos', {
      method: 'POST',
      body: {
        numero_gasto: `GAS-FUEL-${generateTestId()}`,
        fecha: '2026-03-05',
        tipo_gasto: 'combustible',
        monto: 500.00,
        conductor_id: testIds.conductorId,
        periodo_id: testIds.periodoId,
        descripcion: 'Combustible - Semana 1',
        estado: 'aprobado',
      },
    });
    const gastoFuel = await assertSuccessResponse(gastoFuelResponse, 201);
    gastos.push(gastoFuel.id);

    // Toll expense
    const gastoPeajeResponse = await callEdgeFunction('gastos-operativos', {
      method: 'POST',
      body: {
        numero_gasto: `GAS-TOLL-${generateTestId()}`,
        fecha: '2026-03-10',
        tipo_gasto: 'peaje',
        monto: 150.00,
        conductor_id: testIds.conductorId,
        periodo_id: testIds.periodoId,
        descripcion: 'Peajes varios',
        estado: 'aprobado',
      },
    });
    const gastoPeaje = await assertSuccessResponse(gastoPeajeResponse, 201);
    gastos.push(gastoPeaje.id);

    testIds.gastos = gastos;
    console.log(`Created ${gastos.length} operational expenses`);

    console.log('Step 5: Calculate liquidation amounts...');
    const cantidadTraslados = horarios.length;
    const montoTraslados = cantidadTraslados * 600.00; // 600 per transport
    const montoGastos = 500.00 + 150.00; // Total expenses
    const montoBonificaciones = 200.00; // Bonus
    const montoDeducciones = 0.00;
    const montoNeto = montoTraslados - montoGastos + montoBonificaciones - montoDeducciones;

    console.log('Step 6: Generate driver liquidation...');
    const liquidacionResponse = await callEdgeFunction('liquidaciones-conductores', {
      method: 'POST',
      body: {
        numero_liquidacion: `LIQ-TEST-${generateTestId()}`,
        conductor_id: testIds.conductorId,
        periodo_id: testIds.periodoId,
        fecha_generacion: '2026-03-31',
        cantidad_traslados: cantidadTraslados,
        monto_traslados: montoTraslados,
        monto_gastos: montoGastos,
        monto_bonificaciones: montoBonificaciones,
        monto_deducciones: montoDeducciones,
        monto_neto: montoNeto,
        metodo_pago: 'transferencia',
        estado: 'pendiente',
      },
    });
    const liquidacion = await assertSuccessResponse(liquidacionResponse, 201);
    testIds.liquidacionId = liquidacion.id;
    assertValidUUID(liquidacion.id);

    console.log('Step 7: Verify liquidation calculations...');
    assertEquals(liquidacion.cantidad_traslados, cantidadTraslados);
    assertEquals(liquidacion.monto_traslados, String(montoTraslados.toFixed(2)));
    assertEquals(liquidacion.monto_gastos, String(montoGastos.toFixed(2)));
    assertEquals(liquidacion.monto_neto, String(montoNeto.toFixed(2)));

    console.log('Step 8: Approve and process payment...');
    const updateLiquidacionResponse = await callEdgeFunction('liquidaciones-conductores', {
      method: 'PUT',
      path: `/${testIds.liquidacionId}`,
      body: {
        estado: 'pagada',
        fecha_pago: '2026-04-05',
        numero_comprobante: `COMP-${Date.now()}`,
      },
    });
    const liquidacionUpdated = await assertSuccessResponse(updateLiquidacionResponse);
    assertEquals(liquidacionUpdated.estado, 'pagada');

    console.log('Step 9: Verify data integrity...');
    // Verify liquidation
    const liquidacionCheck = await callEdgeFunction('liquidaciones-conductores', {
      path: `/${testIds.liquidacionId}`,
    });
    const liquidacionData = await assertSuccessResponse(liquidacionCheck);
    assertEquals(liquidacionData.estado, 'pagada');
    assertEquals(liquidacionData.cantidad_traslados, cantidadTraslados);

    // Verify expenses are associated with conductor
    const gastosCheck = await callEdgeFunction('gastos-operativos', {
      path: `?conductor_id=${testIds.conductorId}&periodo_id=${testIds.periodoId}`,
    });
    const gastosData = await assertSuccessResponse(gastosCheck);
    assertEquals(gastosData.data.length >= 2, true, 'Should have at least 2 expenses');

    console.log('✅ Complete liquidation flow successful!');
  } finally {
    // Cleanup in reverse order
    console.log('Cleaning up test data...');
    if (testIds.liquidacionId) await deleteTestData('liquidaciones_conductores', testIds.liquidacionId);
    if (testIds.gastos) {
      for (const gastoId of testIds.gastos) {
        await deleteTestData('gastos_operativos', gastoId);
      }
    }
    if (testIds.horarios) {
      for (const horarioId of testIds.horarios) {
        await deleteTestData('horarios_traslados', horarioId);
      }
    }
    if (testIds.servicioId) await deleteTestData('servicios_paciente', testIds.servicioId);
    if (testIds.periodoId) await deleteTestData('periodos_facturacion', testIds.periodoId);
    if (testIds.destinoId) await deleteTestDestino(testIds.destinoId);
    if (testIds.pacienteId) await deleteTestPaciente(testIds.pacienteId);
    if (testIds.obraSocialId) await deleteTestObraSocial(testIds.obraSocialId);
    if (testIds.conductorId) await deleteTestConductor(testIds.conductorId);
  }
});

console.log('✅ Liquidation flow tests defined');
