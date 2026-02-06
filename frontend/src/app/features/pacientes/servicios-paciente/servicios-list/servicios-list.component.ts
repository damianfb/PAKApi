import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CarteraService } from '../../../../core/services/cartera.service';
import { PacientesService } from '../../../../core/services/pacientes.service';
import { DestinosService } from '../../../../core/services/destinos.service';
import { ServicioPaciente, Paciente, Destino } from '../../../../shared/models/entities.model';
import { ServicioFormComponent, ServicioFormDialogData } from '../servicio-form/servicio-form.component';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './servicios-list.component.html',
  styleUrl: './servicios-list.component.scss'
})
export class ServiciosListComponent implements OnInit {
  pacienteId = signal<string>('');
  paciente = signal<Paciente | null>(null);
  servicios = signal<ServicioPaciente[]>([]);
  destinos = signal<Destino[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Valores de km
  valorKmSinDep = 617.62;
  valorKmConDep = 833.79;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private carteraService: CarteraService,
    private pacientesService: PacientesService,
    private destinosService: DestinosService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.pacienteId.set(params['id']);
        this.loadData();
      }
    });
  }

  loadData() {
    this.loading.set(true);
    
    // Cargar paciente
    this.pacientesService.getPacienteById(this.pacienteId()).subscribe({
      next: (response) => {
        this.paciente.set(response.data);
      },
      error: (err) => console.error('Error loading paciente:', err)
    });

    // Cargar destinos para el formulario
    this.destinosService.getAll().subscribe({
      next: (response) => {
        this.destinos.set(response.data || []);
      },
      error: (err) => console.error('Error loading destinos:', err)
    });

    // Cargar servicios
    this.loadServicios();
  }

  loadServicios() {
    this.carteraService.getServiciosPaciente(this.pacienteId()).subscribe({
      next: (response) => {
        this.servicios.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading servicios:', err);
        this.loading.set(false);
        this.error.set('Error al cargar servicios. Verifique su conexión.');
      }
    });
  }

  loadMockServicios() {
    // 🔶 MOCK: Servicios de paciente de desarrollo
    const mockServicios: ServicioPaciente[] = [
      {
        id: '1',
        paciente_id: this.pacienteId(),
        destino_id: 'd1',
        tipo_servicio: 'escuela',
        dias_semana: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
        hora_ida: '07:30',
        hora_vuelta: '12:30',
        kilometros_diarios: 12,
        valor_por_km: this.getValorKm(),
        monto_mensual_estimado: this.calcularMontoMensual(22, 12),
        fecha_inicio: '2025-03-01',
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        paciente_id: this.pacienteId(),
        destino_id: 'd2',
        tipo_servicio: 'terapia',
        dias_semana: ['lunes', 'miercoles', 'viernes'],
        hora_ida: '14:00',
        hora_vuelta: '16:00',
        kilometros_diarios: 15,
        valor_por_km: this.getValorKm(),
        monto_mensual_estimado: this.calcularMontoMensual(13, 15),
        fecha_inicio: '2025-03-01',
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.servicios.set(mockServicios);
  }

  getValorKm(): number {
    return this.paciente()?.tipo_dependencia === 'C/DEPEN' 
      ? this.valorKmConDep 
      : this.valorKmSinDep;
  }

  calcularMontoMensual(diasMes: number, kmDiarios: number): number {
    return diasMes * kmDiarios * this.getValorKm();
  }

  getTotalKmMes(): number {
    return this.servicios()
      .filter(s => s.activo)
      .reduce((sum, s) => {
        const diasMes = this.getDiasMes(s.dias_semana);
        return sum + (s.kilometros_diarios * diasMes);
      }, 0);
  }

  getTotalMontoMes(): number {
    return this.servicios()
      .filter(s => s.activo)
      .reduce((sum, s) => sum + (s.monto_mensual_estimado || 0), 0);
  }

  getDiasMes(diasSemana: string[]): number {
    // Aproximado: 4.33 semanas por mes
    return Math.round(diasSemana.length * 4.33);
  }

  formatDiasSemana(dias: string[] | string | null | undefined): string {
    if (!dias) return '-';
    
    // Si es string, intentar parsear como JSON o convertir a array
    let diasArray: string[];
    if (typeof dias === 'string') {
      try {
        diasArray = JSON.parse(dias);
      } catch {
        diasArray = dias.split(',').map(d => d.trim());
      }
    } else if (Array.isArray(dias)) {
      diasArray = dias;
    } else {
      return '-';
    }
    
    if (diasArray.length === 0) return '-';
    if (diasArray.length === 5) return 'L a V';
    if (diasArray.length === 7) return 'Todos';
    
    const abrev: Record<string, string> = {
      'lunes': 'L', 'martes': 'Ma', 'miercoles': 'Mi', 
      'jueves': 'J', 'viernes': 'V', 'sabado': 'S', 'domingo': 'D'
    };
    return diasArray.map(d => abrev[d.toLowerCase()] || d).join(', ');
  }

  getTipoServicioLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'escuela': 'Escuela',
      'terapia': 'Terapias',
      'cet': 'C.E.T.',
      'hidroterapia': 'Hidroterapia',
      'otro': 'Otro'
    };
    return labels[tipo] || tipo;
  }

  openNewServicioDialog() {
    const dialogData: ServicioFormDialogData = {
      mode: 'create',
      paciente_id: this.pacienteId(),
      paciente: this.paciente() || undefined,
      destinos: this.destinos(),
      valorKmDefault: this.getValorKm()
    };

    const dialogRef = this.dialog.open(ServicioFormComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServicios();
        this.snackBar.open('Servicio creado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  editServicio(servicio: ServicioPaciente) {
    const dialogData: ServicioFormDialogData = {
      mode: 'edit',
      servicio,
      paciente_id: this.pacienteId(),
      paciente: this.paciente() || undefined,
      destinos: this.destinos(),
      valorKmDefault: this.getValorKm()
    };

    const dialogRef = this.dialog.open(ServicioFormComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServicios();
        this.snackBar.open('Servicio actualizado exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  viewServicio(servicio: ServicioPaciente) {
    const dialogData: ServicioFormDialogData = {
      mode: 'view',
      servicio,
      paciente_id: this.pacienteId(),
      paciente: this.paciente() || undefined,
      destinos: this.destinos(),
      valorKmDefault: this.getValorKm()
    };

    this.dialog.open(ServicioFormComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: dialogData
    });
  }

  deleteServicio(servicio: ServicioPaciente) {
    if (confirm(`¿Está seguro que desea desactivar el servicio de ${this.getTipoServicioLabel(servicio.tipo_servicio)}?`)) {
      this.carteraService.deleteServicio(servicio.id).subscribe({
        next: () => {
          this.loadServicios();
          this.snackBar.open('Servicio desactivado', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error deleting servicio:', err);
          this.snackBar.open('Error al desactivar servicio', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/pacientes']);
  }

  goToCartera() {
    this.router.navigate(['/cartera']);
  }
}
