import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { Conductor } from '../../shared/models/entities.model';

export interface ConductoresFilters {
  activo?: boolean;
  dni?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConductoresService extends ApiService {
  private endpoint = 'conductores';

  getAll(filters?: ConductoresFilters): Observable<ApiResponse<Conductor[]>> {
    return this.get<Conductor[]>(this.endpoint, filters);
  }

  getConductorById(id: string): Observable<ApiResponse<Conductor>> {
    return super.getById<Conductor>(this.endpoint, id);
  }

  create(conductor: Partial<Conductor>): Observable<ApiResponse<Conductor>> {
    return this.post<Conductor>(this.endpoint, conductor);
  }

  update(id: string, conductor: Partial<Conductor>): Observable<ApiResponse<Conductor>> {
    return this.put<Conductor>(this.endpoint, id, conductor);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }

  getNombreCompleto(conductor: Conductor): string {
    return `${conductor.apellido}, ${conductor.nombre}`;
  }
}
