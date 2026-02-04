import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportesService } from '../../core/services/reportes.service';
import { DashboardKPI } from '../../shared/models/api.model';

interface ObraSocial {
  nombre: string;
  pacientes: number;
  porcentaje: number;
  facturacion: number;
}

interface TopPaciente {
  id: number;
  nombre: string;
  obraSocial: string;
  kmDia: number;
  dias: number;
  conDependencia: boolean;
  montoMensual: number;
}

interface Actividad {
  titulo: string;
  detalle: string;
}

@Component({
    selector: 'app-dashboard',
    imports: [
        CommonModule,
        RouterModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  kpis = signal<DashboardKPI | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  facturasPendientes = 8;
  kmRecorridos = 2847;
  alertas: string[] = ['Hay 3 facturas próximas a vencer en los próximos 7 días.'];
  
  obrasSociales: ObraSocial[] = [
    { nombre: 'OSECAC', pacientes: 15, porcentaje: 36, facturacion: 668450 },
    { nombre: 'OSMATA', pacientes: 10, porcentaje: 24, facturacion: 445230 },
    { nombre: 'OSPSA', pacientes: 7, porcentaje: 17, facturacion: 311890 },
    { nombre: 'PASTELEROS', pacientes: 4, porcentaje: 10, facturacion: 178120 },
    { nombre: 'SWISS MEDICAL', pacientes: 3, porcentaje: 7, facturacion: 133590 },
    { nombre: 'Otros', pacientes: 3, porcentaje: 7, facturacion: 108040 }
  ];
  
  topPacientes: TopPaciente[] = [
    { id: 1, nombre: 'ALANIS TOMAS SEBASTIAN', obraSocial: 'OSMATA', kmDia: 28, dias: 20, conDependencia: true, montoMensual: 467163 },
    { id: 2, nombre: 'CONSALVO ANTONINI ABEL', obraSocial: 'OSECAC', kmDia: 25, dias: 20, conDependencia: true, montoMensual: 416895 },
    { id: 3, nombre: 'RODRIGUEZ MARIA SOL', obraSocial: 'OSPSA', kmDia: 22, dias: 20, conDependencia: false, montoMensual: 271753 },
    { id: 4, nombre: 'MARTINEZ JUAN PABLO', obraSocial: 'OSECAC', kmDia: 20, dias: 20, conDependencia: true, montoMensual: 333516 },
    { id: 5, nombre: 'FERNANDEZ LUCAS GABRIEL', obraSocial: 'OSMATA', kmDia: 18, dias: 20, conDependencia: false, montoMensual: 222344 },
    { id: 6, nombre: 'GOMEZ ANA LAURA', obraSocial: 'SWISS MEDICAL', kmDia: 15, dias: 20, conDependencia: true, montoMensual: 250137 },
    { id: 7, nombre: 'LOPEZ DIEGO MARTIN', obraSocial: 'PASTELEROS', kmDia: 14, dias: 20, conDependencia: false, montoMensual: 172933 },
    { id: 8, nombre: 'SANCHEZ CARLA BEATRIZ', obraSocial: 'OSECAC', kmDia: 12, dias: 18, conDependencia: true, montoMensual: 180097 },
    { id: 9, nombre: 'DIAZ MATIAS EZEQUIEL', obraSocial: 'OSMATA', kmDia: 11, dias: 20, conDependencia: false, montoMensual: 135876 },
    { id: 10, nombre: 'TORRES SOFIA VALENTINA', obraSocial: 'OSPSA', kmDia: 10, dias: 20, conDependencia: true, montoMensual: 166758 }
  ];
  
  actividadReciente: Actividad[] = [
    { titulo: 'Factura 0004-00001761', detalle: 'OSECAC - $322.843 - Hace 2 horas' },
    { titulo: 'Pago recibido', detalle: 'OSMATA - $156.220 - Hace 5 horas' },
    { titulo: 'Nuevo paciente', detalle: 'CONSALVO ANTONINI - Ayer' }
  ];

  constructor(private reportesService: ReportesService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.reportesService.getDashboard().subscribe({
      next: (response) => {
        this.kpis.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error cargando dashboard');
        this.loading.set(false);
        console.error('Error loading dashboard:', err);
        
        // Mock data for development
        this.kpis.set({
          totalFacturado: 1845320,
          pendienteCobro: 523480,
          viajesHoy: 45,
          pacientesActivos: 42,
          conductoresActivos: 5
        });
      }
    });
  }
}
