import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { Destino } from '../../shared/models/entities.model';

export interface DestinosFilters {
  activo?: boolean;
  tipo?: string;
  ciudad?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DestinosService extends ApiService {
  private endpoint = 'destinos';

  getAll(filters?: DestinosFilters): Observable<ApiResponse<Destino[]>> {
    return this.get<Destino[]>(this.endpoint, filters);
  }

  getDestinoById(id: string): Observable<ApiResponse<Destino>> {
    return super.getById<Destino>(this.endpoint, id);
  }

  create(destino: Partial<Destino>): Observable<ApiResponse<Destino>> {
    return this.post<Destino>(this.endpoint, destino);
  }

  update(id: string, destino: Partial<Destino>): Observable<ApiResponse<Destino>> {
    return this.put<Destino>(this.endpoint, id, destino);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }

  getTipoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'hospital': 'Hospital',
      'clinica': 'Clínica',
      'centro_medico': 'Centro Médico',
      'domicilio': 'Domicilio',
      'laboratorio': 'Laboratorio',
      'consultorio': 'Consultorio'
    };
    return tipos[tipo] || tipo;
  }
}
