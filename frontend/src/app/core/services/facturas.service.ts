import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { Factura, FacturaDetalle } from '../../shared/models/entities.model';

@Injectable({
  providedIn: 'root'
})
export class FacturasService extends ApiService {
  private endpoint = 'facturas';

  getAll(filters?: any): Observable<ApiResponse<Factura[]>> {
    return this.get<Factura[]>(this.endpoint, filters);
  }

  getById(id: string): Observable<ApiResponse<Factura>> {
    return this.getById<Factura>(this.endpoint, id);
  }

  getDetalle(facturaId: string): Observable<ApiResponse<FacturaDetalle[]>> {
    return this.get<FacturaDetalle[]>(`facturas-detalle?factura_id=${facturaId}`);
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

  generarFacturas(periodoId: string, obraSocialId?: string): Observable<ApiResponse<any>> {
    return this.post<any>('facturas-generar', {
      periodo_id: periodoId,
      obra_social_id: obraSocialId
    });
  }
}
