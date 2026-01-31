import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { Paciente, ServicioPaciente } from '../../shared/models/entities.model';

@Injectable({
  providedIn: 'root'
})
export class PacientesService extends ApiService {
  private endpoint = 'pacientes';

  getAll(filters?: any): Observable<ApiResponse<Paciente[]>> {
    return this.get<Paciente[]>(this.endpoint, filters);
  }

  getPacienteById(id: string): Observable<ApiResponse<Paciente>> {
    return super.getById<Paciente>(this.endpoint, id);
  }

  getServicios(pacienteId: string): Observable<ApiResponse<ServicioPaciente[]>> {
    return this.get<ServicioPaciente[]>(`${this.endpoint}/${pacienteId}/servicios`);
  }

  create(paciente: Partial<Paciente>): Observable<ApiResponse<Paciente>> {
    return this.post<Paciente>(this.endpoint, paciente);
  }

  update(id: string, paciente: Partial<Paciente>): Observable<ApiResponse<Paciente>> {
    return this.put<Paciente>(this.endpoint, id, paciente);
  }

  remove(id: string): Observable<ApiResponse<any>> {
    return this.delete(this.endpoint, id);
  }
}
