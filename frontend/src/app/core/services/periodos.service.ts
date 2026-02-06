import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { PeriodoFacturacion } from '../../shared/models/entities.model';

export interface PeriodosFilters {
  anio?: number;
  estado?: 'abierto' | 'cerrado' | 'facturado';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodosService extends ApiService {
  private endpoint = 'periodos-facturacion';

  private meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  getAll(filters?: PeriodosFilters): Observable<ApiResponse<PeriodoFacturacion[]>> {
    return this.get<PeriodoFacturacion[]>(this.endpoint, filters);
  }

  getPeriodoById(id: string): Observable<ApiResponse<PeriodoFacturacion>> {
    return super.getById<PeriodoFacturacion>(this.endpoint, id);
  }

  create(data: { mes: number; anio: number; observaciones?: string }): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.post<PeriodoFacturacion>(this.endpoint, data);
  }

  update(id: string, periodo: Partial<PeriodoFacturacion>): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.put<PeriodoFacturacion>(this.endpoint, id, periodo);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }

  // Extraer mes y año del formato YYYY-MM
  parsePeriodo(periodo: string): { mes: number; anio: number } {
    const [anio, mes] = periodo.split('-').map(Number);
    return { mes, anio };
  }

  // Método helper para obtener el nombre formateado del período
  formatPeriodo(periodo: PeriodoFacturacion): string {
    const { mes, anio } = this.parsePeriodo(periodo.periodo);
    return `${this.meses[mes - 1]} ${anio}`;
  }

  // Obtener nombre del mes desde el periodo
  getMesLabel(periodo: PeriodoFacturacion): string {
    const { mes } = this.parsePeriodo(periodo.periodo);
    return this.meses[mes - 1];
  }

  // Obtener año desde el periodo
  getAnio(periodo: PeriodoFacturacion): number {
    return this.parsePeriodo(periodo.periodo).anio;
  }

  // Cerrar un período
  cerrarPeriodo(id: string): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.put<PeriodoFacturacion>(this.endpoint, id, { estado: 'cerrado' });
  }

  // Abrir un período
  abrirPeriodo(id: string): Observable<ApiResponse<PeriodoFacturacion>> {
    return this.put<PeriodoFacturacion>(this.endpoint, id, { estado: 'abierto' });
  }
}
