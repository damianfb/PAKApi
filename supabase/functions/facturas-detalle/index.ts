import { createSupabaseClient } from '../_shared/supabase.ts';
import { successResponse, errorResponse } from '../_shared/response.ts';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = pathParts[pathParts.length - 1] !== 'facturas-detalle' ? pathParts[pathParts.length - 1] : null;

    // GET single detalle by ID
    if (req.method === 'GET' && id && !url.searchParams.has('factura_id')) {
      const { data, error } = await supabase
        .from('facturas_detalle')
        .select('*, paciente:pacientes(*), traslado_mensual:traslados_mensuales(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Detalle de factura no encontrado', 404, error);
      }

      return successResponse(data);
    }

    // GET all detalles (with required factura_id filter)
    if (req.method === 'GET') {
      const factura_id = url.searchParams.get('factura_id');
      const paciente_id = url.searchParams.get('paciente_id');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = (page - 1) * limit;

      if (!factura_id && !paciente_id) {
        return errorResponse('Se requiere factura_id o paciente_id como filtro', 400);
      }

      let query = supabase
        .from('facturas_detalle')
        .select('*, paciente:pacientes(id, nombre, apellido, dni), traslado_mensual:traslados_mensuales(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (factura_id) {
        query = query.eq('factura_id', factura_id);
      }

      if (paciente_id) {
        query = query.eq('paciente_id', paciente_id);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener detalles de factura', 500, error);
      }

      return successResponse({
        data,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // POST create new detalle
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.factura_id || !body.descripcion) {
        return errorResponse('Los campos "factura_id" y "descripcion" son requeridos', 400);
      }

      // Calcular subtotal si no viene
      const cantidad = body.cantidad || 0;
      const precioUnitario = body.precio_unitario || 0;
      const subtotal = body.subtotal || (cantidad * precioUnitario);

      const { data, error } = await supabase
        .from('facturas_detalle')
        .insert([
          {
            factura_id: body.factura_id,
            traslado_mensual_id: body.traslado_mensual_id || null,
            paciente_id: body.paciente_id || null,
            descripcion: body.descripcion,
            cantidad: cantidad,
            precio_unitario: precioUnitario,
            subtotal: subtotal,
            observaciones: body.observaciones || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear detalle de factura', 400, error);
      }

      // Actualizar totales de la factura
      await updateFacturaTotals(supabase, body.factura_id);

      return successResponse(data, 201);
    }

    // PUT update detalle by ID
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      // Calcular subtotal si corresponde
      let updateData: any = {};
      
      if (body.descripcion !== undefined) updateData.descripcion = body.descripcion;
      if (body.cantidad !== undefined) updateData.cantidad = body.cantidad;
      if (body.precio_unitario !== undefined) updateData.precio_unitario = body.precio_unitario;
      if (body.paciente_id !== undefined) updateData.paciente_id = body.paciente_id;
      if (body.traslado_mensual_id !== undefined) updateData.traslado_mensual_id = body.traslado_mensual_id;
      if (body.observaciones !== undefined) updateData.observaciones = body.observaciones;

      // Calcular subtotal si se actualizan cantidad o precio
      if (body.cantidad !== undefined || body.precio_unitario !== undefined) {
        const cantidad = body.cantidad ?? 0;
        const precioUnitario = body.precio_unitario ?? 0;
        updateData.subtotal = cantidad * precioUnitario;
      }

      const { data, error } = await supabase
        .from('facturas_detalle')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar detalle de factura', 400, error);
      }

      // Actualizar totales de la factura
      if (data.factura_id) {
        await updateFacturaTotals(supabase, data.factura_id);
      }

      return successResponse(data);
    }

    // DELETE detalle by ID
    if (req.method === 'DELETE' && id) {
      // Primero obtener el factura_id para actualizar totales después
      const { data: detalle, error: fetchError } = await supabase
        .from('facturas_detalle')
        .select('factura_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        return errorResponse('Detalle no encontrado', 404, fetchError);
      }

      const facturaId = detalle.factura_id;

      const { error } = await supabase
        .from('facturas_detalle')
        .delete()
        .eq('id', id);

      if (error) {
        return errorResponse('Error al eliminar detalle de factura', 400, error);
      }

      // Actualizar totales de la factura
      await updateFacturaTotals(supabase, facturaId);

      return successResponse({ message: 'Detalle eliminado exitosamente' });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});

// Función auxiliar para actualizar los totales de una factura
async function updateFacturaTotals(supabase: any, facturaId: string) {
  try {
    // Obtener la suma de todos los detalles
    const { data: detalles, error: detallesError } = await supabase
      .from('facturas_detalle')
      .select('subtotal')
      .eq('factura_id', facturaId);

    if (detallesError) {
      console.error('Error al obtener detalles para actualizar totales:', detallesError);
      return;
    }

    const subtotal = detalles.reduce((sum: number, d: any) => sum + (d.subtotal || 0), 0);
    
    // Calcular IVA (21%)
    const impuestos = Math.round(subtotal * 0.21 * 100) / 100;
    const montoTotal = subtotal + impuestos;

    // Actualizar la factura
    const { error: updateError } = await supabase
      .from('facturas')
      .update({
        subtotal,
        impuestos,
        monto_total: montoTotal
      })
      .eq('id', facturaId);

    if (updateError) {
      console.error('Error al actualizar totales de factura:', updateError);
    }
  } catch (err) {
    console.error('Error en updateFacturaTotals:', err);
  }
}
