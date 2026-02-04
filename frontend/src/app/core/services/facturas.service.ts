import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { Factura, FacturaDetalle } from '../../shared/models/entities.model';

export interface FacturasFilters {
  periodo_id?: string;
  obra_social_id?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

export interface FacturaDetalleFilters {
  factura_id?: string;
  paciente_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FacturasService extends ApiService {
  private endpoint = 'facturas';

  getAll(filters?: FacturasFilters): Observable<ApiResponse<Factura[]>> {
    return this.get<Factura[]>(this.endpoint, filters);
  }

  getFacturaById(id: string): Observable<ApiResponse<Factura>> {
    return super.getById<Factura>(this.endpoint, id);
  }

  create(factura: Partial<Factura>): Observable<ApiResponse<Factura>> {
    return this.post<Factura>(this.endpoint, factura);
  }

  update(id: string, factura: Partial<Factura>): Observable<ApiResponse<Factura>> {
    return this.put<Factura>(this.endpoint, id, factura);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }

  // Métodos para detalles de factura
  getDetalles(facturaId: string): Observable<ApiResponse<FacturaDetalle[]>> {
    return this.get<FacturaDetalle[]>('facturas-detalle', { factura_id: facturaId });
  }

  createDetalle(detalle: Partial<FacturaDetalle>): Observable<ApiResponse<FacturaDetalle>> {
    return this.post<FacturaDetalle>('facturas-detalle', detalle);
  }

  updateDetalle(id: string, detalle: Partial<FacturaDetalle>): Observable<ApiResponse<FacturaDetalle>> {
    return this.put<FacturaDetalle>('facturas-detalle', id, detalle);
  }

  removeDetalle(id: string): Observable<ApiResponse<any>> {
    return this.delete('facturas-detalle', id);
  }

  // Método para generar facturas automáticas
  generarFacturas(periodoId: string, obraSocialId?: string): Observable<ApiResponse<any>> {
    return this.post<any>('facturas-generar', {
      periodo_id: periodoId,
      obra_social_id: obraSocialId
    });
  }

  // Método para cambiar estado de factura
  cambiarEstado(id: string, nuevoEstado: string, fechaPago?: string): Observable<ApiResponse<Factura>> {
    const body: any = { estado: nuevoEstado };
    if (fechaPago) {
      body.fecha_pago = fechaPago;
    }
    return this.put<Factura>(this.endpoint, id, body);
  }

  // Método para recalcular totales de una factura
  recalcularTotales(id: string): Observable<ApiResponse<Factura>> {
    return this.post<Factura>(`${this.endpoint}/${id}/recalcular`, {});
  }
}
