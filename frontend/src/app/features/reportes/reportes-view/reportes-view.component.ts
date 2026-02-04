import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReporteDisponible {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: string;
  ultimaGeneracion?: Date;
}

interface ReporteReciente {
  id: string;
  nombre: string;
  fechaGeneracion: Date;
  usuario: string;
  formato: string;
  tamanio: string;
}

@Component({
    selector: 'app-reportes-view',
    imports: [CommonModule, FormsModule],
    templateUrl: './reportes-view.component.html',
    styleUrl: './reportes-view.component.scss'
})
export class ReportesViewComponent implements OnInit {
  // Stats
  reportesGenerados = 45;
  reportesPendientes = 3;
  reportesProgramados = 8;
  
  // Filtros
  selectedCategoria = 'todos';
  searchText = '';
  
  categorias = ['Facturación', 'Cobranza', 'Operaciones', 'Conductores', 'Pacientes'];
  
  // Reportes disponibles
  reportesDisponibles: ReporteDisponible[] = [
    {
      id: '1',
      nombre: 'Facturación Mensual por Obra Social',
      descripcion: 'Resumen de facturación agrupado por obra social con totales y comparativas',
      icono: 'fa-file-invoice-dollar',
      categoria: 'Facturación',
      ultimaGeneracion: new Date('2025-01-30')
    },
    {
      id: '2',
      nombre: 'Estado de Cuenta de Cobranza',
      descripcion: 'Detalle de pagos pendientes, parciales y completados por obra social',
      icono: 'fa-credit-card',
      categoria: 'Cobranza',
      ultimaGeneracion: new Date('2025-01-29')
    },
    {
      id: '3',
      nombre: 'Kilómetros Recorridos por Conductor',
      descripcion: 'Reporte de distancias, tiempos y eficiencia por conductor',
      icono: 'fa-route',
      categoria: 'Conductores',
      ultimaGeneracion: new Date('2025-01-28')
    },
    {
      id: '4',
      nombre: 'Rentabilidad por Paciente',
      descripcion: 'Análisis de ingresos vs costos por paciente activo',
      icono: 'fa-chart-line',
      categoria: 'Pacientes'
    },
    {
      id: '5',
      nombre: 'Traslados del Período',
      descripcion: 'Listado completo de traslados con estados y novedades',
      icono: 'fa-ambulance',
      categoria: 'Operaciones',
      ultimaGeneracion: new Date('2025-01-31')
    },
    {
      id: '6',
      nombre: 'Liquidación de Conductores',
      descripcion: 'Cálculo de pagos a conductores con detalle de servicios',
      icono: 'fa-money-check-alt',
      categoria: 'Conductores'
    },
    {
      id: '7',
      nombre: 'Análisis de Demanda',
      descripcion: 'Patrones de demanda de traslados por zona y horario',
      icono: 'fa-chart-area',
      categoria: 'Operaciones'
    },
    {
      id: '8',
      nombre: 'Antigüedad de Saldos',
      descripcion: 'Desglose de deuda por antigüedad (30, 60, 90+ días)',
      icono: 'fa-clock',
      categoria: 'Cobranza'
    }
  ];
  
  // Reportes recientes
  reportesRecientes: ReporteReciente[] = [
    {
      id: '1',
      nombre: 'Facturación Enero 2025',
      fechaGeneracion: new Date('2025-01-31T10:30:00'),
      usuario: 'admin',
      formato: 'PDF',
      tamanio: '2.4 MB'
    },
    {
      id: '2',
      nombre: 'Traslados Enero 2025',
      fechaGeneracion: new Date('2025-01-31T09:15:00'),
      usuario: 'admin',
      formato: 'Excel',
      tamanio: '1.8 MB'
    },
    {
      id: '3',
      nombre: 'Liquidación Conductores Enero',
      fechaGeneracion: new Date('2025-01-30T16:45:00'),
      usuario: 'admin',
      formato: 'PDF',
      tamanio: '856 KB'
    },
    {
      id: '4',
      nombre: 'Estado de Cobranza Q1',
      fechaGeneracion: new Date('2025-01-30T14:20:00'),
      usuario: 'admin',
      formato: 'Excel',
      tamanio: '1.2 MB'
    }
  ];
  
  filteredReportes: ReporteDisponible[] = [];
  
  ngOnInit(): void {
    this.filterReportes();
  }
  
  filterReportes(): void {
    this.filteredReportes = this.reportesDisponibles.filter(reporte => {
      const matchCategoria = this.selectedCategoria === 'todos' || 
                            reporte.categoria.toLowerCase() === this.selectedCategoria.toLowerCase();
      const matchSearch = !this.searchText || 
                         reporte.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
                         reporte.descripcion.toLowerCase().includes(this.searchText.toLowerCase());
      return matchCategoria && matchSearch;
    });
  }
  
  generarReporte(reporte: ReporteDisponible, formato: string): void {
    console.log(`Generando reporte: ${reporte.nombre} en formato ${formato}`);
    // Implementar generación de reporte
  }
  
  descargarReporte(reporte: ReporteReciente): void {
    console.log(`Descargando reporte: ${reporte.nombre}`);
    // Implementar descarga
  }
  
  programarReporte(reporte: ReporteDisponible): void {
    console.log(`Programando reporte: ${reporte.nombre}`);
    // Implementar programación
  }
  
  verHistorial(): void {
    console.log('Ver historial completo');
    // Implementar navegación
  }
}
