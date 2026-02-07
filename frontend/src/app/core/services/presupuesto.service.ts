import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';

export interface PresupuestoConcepto {
  id: string;
  nombre: string;
  categoria: string;
  tipo: 'egreso' | 'ingreso';
  monto_base: number;
  dia_vencimiento?: number;
  es_recurrente: boolean;
  activo: boolean;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface PresupuestoMovimiento {
  id: string;
  concepto_id?: string;
  concepto?: PresupuestoConcepto;
  periodo: string;
  monto: number;
  monto_pagado: number;
  fecha_pago?: string;
  estado: 'pendiente' | 'pagado' | 'parcial' | 'cancelado';
  observaciones?: string;
  nombre?: string;
  categoria?: string;
  tipo?: 'egreso' | 'ingreso';
  created_at: string;
  updated_at: string;
}

export interface PresupuestoTotals {
  ingresos: number;
  egresos: number;
  pagado: number;
  pendiente: number;
  resultado: number;
}

export interface PresupuestoResponse {
  data: PresupuestoMovimiento[];
  totals: PresupuestoTotals;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PresupuestoFilters {
  periodo?: string;
  tipo?: string;
  estado?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService extends ApiService {
  private endpoint = 'presupuesto';
  private conceptosEndpoint = 'presupuesto-conceptos';

  // === Movimientos ===
  getMovimientos(filters?: PresupuestoFilters): Observable<ApiResponse<PresupuestoResponse>> {
    return this.get<PresupuestoResponse>(this.endpoint, filters);
  }

  getMovimientoById(id: string): Observable<ApiResponse<PresupuestoMovimiento>> {
    return super.getById<PresupuestoMovimiento>(this.endpoint, id);
  }

  createMovimiento(data: Partial<PresupuestoMovimiento>): Observable<ApiResponse<PresupuestoMovimiento>> {
    return this.post<PresupuestoMovimiento>(this.endpoint, data);
  }

  updateMovimiento(id: string, data: Partial<PresupuestoMovimiento>): Observable<ApiResponse<PresupuestoMovimiento>> {
    return this.put<PresupuestoMovimiento>(this.endpoint, id, data);
  }

  deleteMovimiento(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }

  // === Conceptos ===
  getConceptos(filters?: { activo?: boolean; tipo?: string; categoria?: string }): Observable<ApiResponse<PresupuestoConcepto[]>> {
    return this.get<PresupuestoConcepto[]>(this.conceptosEndpoint, filters);
  }

  getConceptoById(id: string): Observable<ApiResponse<PresupuestoConcepto>> {
    return super.getById<PresupuestoConcepto>(this.conceptosEndpoint, id);
  }

  createConcepto(data: Partial<PresupuestoConcepto>): Observable<ApiResponse<PresupuestoConcepto>> {
    return this.post<PresupuestoConcepto>(this.conceptosEndpoint, data);
  }

  updateConcepto(id: string, data: Partial<PresupuestoConcepto>): Observable<ApiResponse<PresupuestoConcepto>> {
    return this.put<PresupuestoConcepto>(this.conceptosEndpoint, id, data);
  }

  deleteConcepto(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.conceptosEndpoint, id);
  }
}
