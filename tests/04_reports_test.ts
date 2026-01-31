// E2E Tests for Reporting Endpoints
// Tests all reporting endpoints and dashboard metrics

import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { assertSuccessResponse } from './helpers.ts';
import { callEdgeFunction } from './config.ts';

Deno.test('Reports: Annual Billing Report (facturacion-anual)', async () => {
  console.log('Testing annual billing report endpoint...');
  
  const response = await callEdgeFunction('reportes', {
    path: '/facturacion-anual?anio=2026',
  });

  const data = await assertSuccessResponse(response);
  assertExists(data, 'Report data should exist');
  assertEquals(Array.isArray(data), true, 'Report data should be an array');
  
  if (data.length > 0) {
    const firstRow = data[0];
    assertExists(firstRow.anio, 'Report should have year');
    assertExists(firstRow.obra_social, 'Report should have obra social name');
    assertExists(firstRow.total_facturas, 'Report should have total invoices count');
    console.log(`✅ Found ${data.length} billing records for 2026`);
  } else {
    console.log('⚠️  No billing data for 2026 (expected in empty database)');
  }
});

Deno.test('Reports: Pending Collections Report (cobranzas-pendientes)', async () => {
  console.log('Testing pending collections report endpoint...');
  
  const response = await callEdgeFunction('reportes', {
    path: '/cobranzas-pendientes',
  });

  const data = await assertSuccessResponse(response);
  assertExists(data, 'Report data should exist');
  assertEquals(Array.isArray(data), true, 'Report data should be an array');
  
  if (data.length > 0) {
    const firstRow = data[0];
    assertExists(firstRow.numero_cobranza, 'Report should have collection number');
    assertExists(firstRow.obra_social, 'Report should have obra social name');
    assertExists(firstRow.monto_pendiente, 'Report should have pending amount');
    assertExists(firstRow.categoria_vencimiento, 'Report should have aging category');
    console.log(`✅ Found ${data.length} pending collections`);
  } else {
    console.log('⚠️  No pending collections (expected in empty database)');
  }
});

Deno.test('Reports: Patients by Health Insurance (pacientes-obra-social)', async () => {
  console.log('Testing patients by health insurance report...');
  
  const response = await callEdgeFunction('reportes', {
    path: '/pacientes-obra-social',
  });

  const data = await assertSuccessResponse(response);
  assertExists(data, 'Report data should exist');
  assertEquals(Array.isArray(data), true, 'Report data should be an array');
  
  if (data.length > 0) {
    const firstRow = data[0];
    assertExists(firstRow.obra_social, 'Report should have obra social name');
    assertExists(firstRow.total_pacientes, 'Report should have total patients count');
    assertExists(firstRow.pacientes_activos, 'Report should have active patients count');
    console.log(`✅ Found ${data.length} health insurance records`);
  } else {
    console.log('⚠️  No patient data (expected in empty database)');
  }
});

Deno.test('Reports: Monthly Profitability (rentabilidad-mensual)', async () => {
  console.log('Testing monthly profitability report...');
  
  const response = await callEdgeFunction('reportes', {
    path: '/rentabilidad-mensual?anio=2026',
  });

  const data = await assertSuccessResponse(response);
  assertExists(data, 'Report data should exist');
  assertEquals(Array.isArray(data), true, 'Report data should be an array');
  
  if (data.length > 0) {
    const firstRow = data[0];
    assertExists(firstRow.periodo, 'Report should have period');
    assertExists(firstRow.facturacion_total, 'Report should have total billing');
    assertExists(firstRow.egresos_totales, 'Report should have total expenses');
    assertExists(firstRow.utilidad_bruta, 'Report should have gross profit');
    console.log(`✅ Found ${data.length} profitability records for 2026`);
  } else {
    console.log('⚠️  No profitability data for 2026 (expected in empty database)');
  }
});

Deno.test('Reports: Annual Summary (resumen-anual)', async () => {
  console.log('Testing annual summary report...');
  
  const response = await callEdgeFunction('reportes', {
    path: '/resumen-anual?anio=2026',
  });

  const data = await assertSuccessResponse(response);
  assertExists(data, 'Report data should exist');
  assertEquals(Array.isArray(data), true, 'Report data should be an array');
  
  if (data.length > 0) {
    const firstRow = data[0];
    assertExists(firstRow.anio, 'Report should have year');
    assertExists(firstRow.total_facturas, 'Report should have total invoices');
    assertExists(firstRow.total_traslados, 'Report should have total transports');
    assertExists(firstRow.total_conductores, 'Report should have total drivers');
    console.log(`✅ Found annual summary for year ${firstRow.anio}`);
  } else {
    console.log('⚠️  No annual summary for 2026 (expected in empty database)');
  }
});

Deno.test('Reports: General Dashboard (dashboard)', async () => {
  console.log('Testing general dashboard endpoint...');
  
  const response = await callEdgeFunction('reportes', {
    path: '/dashboard',
  });

  const data = await assertSuccessResponse(response);
  assertExists(data, 'Dashboard data should exist');
  assertEquals(Array.isArray(data), true, 'Dashboard data should be an array');
  
  if (data.length > 0) {
    const dashboard = data[0];
    assertExists(dashboard.total_pacientes, 'Dashboard should have total patients');
    assertExists(dashboard.total_conductores, 'Dashboard should have total drivers');
    assertExists(dashboard.total_obras_sociales, 'Dashboard should have total health insurance');
    assertExists(dashboard.total_destinos, 'Dashboard should have total destinations');
    console.log('✅ Dashboard data structure validated');
    console.log(`   - Patients: ${dashboard.total_pacientes}`);
    console.log(`   - Drivers: ${dashboard.total_conductores}`);
    console.log(`   - Health Insurance: ${dashboard.total_obras_sociales}`);
    console.log(`   - Destinations: ${dashboard.total_destinos}`);
  } else {
    console.log('⚠️  No dashboard data (expected in empty database)');
  }
});

Deno.test('Reports: Error handling - Invalid year format', async () => {
  console.log('Testing error handling for invalid year...');
  
  const response = await callEdgeFunction('reportes', {
    path: '/facturacion-anual?anio=invalid',
  });

  // Should still return 200 but with empty or filtered results
  // The endpoint doesn't enforce strict validation, just filters
  assertExists(response, 'Response should exist');
  assertEquals(response.ok, true, 'Should handle invalid year gracefully');
});

Deno.test('Reports: Filtering by obra_social_id', async () => {
  console.log('Testing filtering by obra social ID...');
  
  // Use a UUID that likely doesn't exist
  const nonExistentId = '00000000-0000-0000-0000-000000000000';
  const response = await callEdgeFunction('reportes', {
    path: `/facturacion-anual?anio=2026&obra_social_id=${nonExistentId}`,
  });

  const data = await assertSuccessResponse(response);
  assertEquals(Array.isArray(data), true, 'Should return empty array for non-existent ID');
  assertEquals(data.length, 0, 'Should have no results for non-existent ID');
  console.log('✅ Filtering works correctly');
});

console.log('✅ All reporting tests defined');
