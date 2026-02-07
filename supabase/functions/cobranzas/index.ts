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
    const id = pathParts[pathParts.length - 1] !== 'cobranzas' ? pathParts[pathParts.length - 1] : null;

    // GET single cobranza by ID
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase
        .from('cobranzas')
        .select('*, obra_social:obras_sociales(*), periodo:periodos_facturacion(*), recibos:recibos(*)')
        .eq('id', id)
        .single();

      if (error) {
        return errorResponse('Cobranza no encontrada', 404, error);
      }

      return successResponse(data);
    }

    // GET all cobranzas (with optional filters)
    if (req.method === 'GET') {
      const obra_social_id = url.searchParams.get('obra_social_id');
      const periodo_id = url.searchParams.get('periodo_id');
      const estado = url.searchParams.get('estado');
      const fecha_desde = url.searchParams.get('fecha_desde');
      const fecha_hasta = url.searchParams.get('fecha_hasta');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('cobranzas')
        .select('*, obra_social:obras_sociales(*), periodo:periodos_facturacion(*)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('fecha_cobranza', { ascending: false });

      if (obra_social_id) {
        query = query.eq('obra_social_id', obra_social_id);
      }

      if (periodo_id) {
        query = query.eq('periodo_id', periodo_id);
      }

      if (estado) {
        query = query.eq('estado', estado);
      }

      if (fecha_desde) {
        query = query.gte('fecha_cobranza', fecha_desde);
      }

      if (fecha_hasta) {
        query = query.lte('fecha_cobranza', fecha_hasta);
      }

      const { data, error, count } = await query;

      if (error) {
        return errorResponse('Error al obtener cobranzas', 500, error);
      }

      // Calculate totals
      const totals = {
        total_a_cobrar: 0,
        total_cobrado: 0,
        total_pendiente: 0
      };
      
      if (data) {
        data.forEach((c: any) => {
          totals.total_a_cobrar += parseFloat(c.monto_total) || 0;
          totals.total_cobrado += parseFloat(c.monto_cobrado) || 0;
          totals.total_pendiente += parseFloat(c.monto_pendiente) || 0;
        });
      }

      return successResponse({
        data,
        totals,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // POST create new cobranza
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate required fields
      if (!body.numero_cobranza || !body.fecha_cobranza) {
        return errorResponse('Los campos "numero_cobranza" y "fecha_cobranza" son requeridos', 400);
      }

      const monto_total = body.monto_total || 0;
      const monto_cobrado = body.monto_cobrado || 0;
      const monto_pendiente = monto_total - monto_cobrado;

      const { data, error } = await supabase
        .from('cobranzas')
        .insert([
          {
            numero_cobranza: body.numero_cobranza,
            fecha_cobranza: body.fecha_cobranza,
            obra_social_id: body.obra_social_id || null,
            periodo_id: body.periodo_id || null,
            monto_total: monto_total,
            monto_cobrado: monto_cobrado,
            monto_pendiente: monto_pendiente,
            estado: body.estado || 'pendiente',
            fecha_vencimiento: body.fecha_vencimiento || null,
            observaciones: body.observaciones || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return errorResponse('Error al crear cobranza', 400, error);
      }

      return successResponse(data, 201);
    }

    // PUT update cobranza by ID
    if (req.method === 'PUT' && id) {
      const body = await req.json();

      const updateData: any = {};
      
      if (body.fecha_cobranza !== undefined) updateData.fecha_cobranza = body.fecha_cobranza;
      if (body.obra_social_id !== undefined) updateData.obra_social_id = body.obra_social_id;
      if (body.periodo_id !== undefined) updateData.periodo_id = body.periodo_id;
      if (body.fecha_vencimiento !== undefined) updateData.fecha_vencimiento = body.fecha_vencimiento;
      if (body.observaciones !== undefined) updateData.observaciones = body.observaciones;
      if (body.estado !== undefined) updateData.estado = body.estado;
      
      // Handle monto updates
      if (body.monto_total !== undefined || body.monto_cobrado !== undefined) {
        // Get current values
        const { data: current } = await supabase
          .from('cobranzas')
          .select('monto_total, monto_cobrado')
          .eq('id', id)
          .single();
        
        const newTotal = body.monto_total ?? (current?.monto_total || 0);
        const newCobrado = body.monto_cobrado ?? (current?.monto_cobrado || 0);
        
        updateData.monto_total = newTotal;
        updateData.monto_cobrado = newCobrado;
        updateData.monto_pendiente = newTotal - newCobrado;
        
        // Auto-update estado based on payments
        if (newCobrado === 0) {
          updateData.estado = 'pendiente';
        } else if (newCobrado >= newTotal) {
          updateData.estado = 'cobrado';
        } else {
          updateData.estado = 'parcial';
        }
      }

      const { data, error } = await supabase
        .from('cobranzas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al actualizar cobranza', 400, error);
      }

      return successResponse(data);
    }

    // DELETE cobranza by ID (soft delete by setting estado to 'anulado')
    if (req.method === 'DELETE' && id) {
      const { data, error } = await supabase
        .from('cobranzas')
        .update({ estado: 'anulado' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return errorResponse('Error al anular cobranza', 400, error);
      }

      return successResponse({ message: 'Cobranza anulada exitosamente', data });
    }

    return errorResponse('Método no permitido', 405);
  } catch (error) {
    return errorResponse('Error interno del servidor', 500, error.message);
  }
});
