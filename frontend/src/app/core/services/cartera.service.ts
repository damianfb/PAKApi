import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../../shared/models/api.model';
import { ServicioPaciente } from '../../shared/models/entities.model';

export interface PacienteCartera {
  paciente_id: string;
  numero_legajo?: string; // Número de cartera/legajo del Excel
  apellido: string;
  nombre: string;
  dni: string;
  telefono?: string;
  tutor_responsable?: string;
  direccion_particular?: string;
  localidad?: string;
  numero_afiliado?: string;
  tipo_dependencia: 'C/DEPEN' | 'S/DEPEN';
  activo: boolean;
  obra_social_id?: string;
  obra_social_nombre?: string;
  obra_social_codigo?: string;
  servicios: ServicioCartera[];
  total_km_mes: number;
  total_monto_mensual: number;
  valor_km_default: number;
}

export interface ServicioCartera {
  id: string;
  tipo_servicio: string;
  destino_nombre?: string;
  destino_direccion?: string;
  dias_semana?: string;
  cantidad_mensual: number;
  kilometros_diarios: number;
  valor_por_km: number;
  numero_autorizacion?: string;
  monto_mensual_estimado: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CarteraService extends ApiService {
  private endpoint = 'cartera';

  /**
   * Get all patients with their services as a cartera view
   */
  getCartera(filters?: {
    obra_social_id?: string;
    tipo_dependencia?: string;
    activo?: boolean;
  }): Observable<ApiResponse<PacienteCartera[]>> {
    return this.get<PacienteCartera[]>(this.endpoint, filters);
  }

  /**
   * Get a single patient's cartera data
   */
  getCarteraByPaciente(pacienteId: string): Observable<ApiResponse<PacienteCartera>> {
    return this.get<PacienteCartera>(`${this.endpoint}/${pacienteId}`);
  }

  /**
   * Get services for a specific patient
   */
  getServiciosPaciente(pacienteId: string): Observable<ApiResponse<ServicioPaciente[]>> {
    return this.get<ServicioPaciente[]>(`servicios-paciente`, { paciente_id: pacienteId });
  }

  /**
   * Create a new service for a patient
   */
  createServicio(servicio: Partial<ServicioPaciente>): Observable<ApiResponse<ServicioPaciente>> {
    return this.post<ServicioPaciente>('servicios-paciente', servicio);
  }

  /**
   * Update a service
   */
  updateServicio(id: string, servicio: Partial<ServicioPaciente>): Observable<ApiResponse<ServicioPaciente>> {
    return this.put<ServicioPaciente>('servicios-paciente', id, servicio);
  }

  /**
   * Delete (deactivate) a service
   */
  deleteServicio(id: string): Observable<ApiResponse<any>> {
    return this.delete('servicios-paciente', id);
  }

  /**
   * Get current km values from configuration
   */
  getValoresKm(): Observable<ApiResponse<{ sin_dependencia: number; con_dependencia: number }>> {
    return this.get<{ sin_dependencia: number; con_dependencia: number }>('configuracion/valores-km');
  }
}
