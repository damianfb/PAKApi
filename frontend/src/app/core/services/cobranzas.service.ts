import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { Cobranza } from '../../shared/models/entities.model';

export interface CobranzasFilters {
  obra_social_id?: string;
  periodo_id?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

export interface CobranzasResponse {
  data: Cobranza[];
  totals: {
    total_a_cobrar: number;
    total_cobrado: number;
    total_pendiente: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CobranzasService extends ApiService {
  private endpoint = 'cobranzas';

  getAll(filters?: CobranzasFilters): Observable<ApiResponse<CobranzasResponse>> {
    return this.get<CobranzasResponse>(this.endpoint, filters);
  }

  getCobranzaById(id: string): Observable<ApiResponse<Cobranza>> {
    return super.getById<Cobranza>(this.endpoint, id);
  }

  create(cobranza: Partial<Cobranza>): Observable<ApiResponse<Cobranza>> {
    return this.post<Cobranza>(this.endpoint, cobranza);
  }

  update(id: string, cobranza: Partial<Cobranza>): Observable<ApiResponse<Cobranza>> {
    return this.put<Cobranza>(this.endpoint, id, cobranza);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }

  registrarPago(id: string, monto: number): Observable<ApiResponse<Cobranza>> {
    return this.put<Cobranza>(this.endpoint, id, { monto_cobrado: monto });
  }
}
