import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface TipoReporte {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  endpoint: string;
  requiereFiltros: boolean;
  filtros?: { tipo: string; label: string }[];
}

@Component({
    selector: 'app-reportes-view',
    imports: [CommonModule, FormsModule],
    templateUrl: './reportes-view.component.html',
    styleUrl: './reportes-view.component.scss'
})
export class ReportesViewComponent implements OnInit {
  // State
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Dashboard stats from API
  dashboardStats = signal<any>(null);
  
  // Report result
  reporteActual = signal<any>(null);
  showResultModal = signal(false);
  selectedReporteName = signal('');
  
  // Filters
  selectedAnio = signal(new Date().getFullYear());
  selectedMes = signal(new Date().getMonth() + 1);
  selectedObraSocial = signal<string>('');
  searchText = signal('');
  selectedCategoria = signal('todos');
  
  // Options
  anios = [2024, 2025, 2026];
  meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];
  
  categorias = ['Facturación', 'Cobranza', 'Análisis', 'Operaciones'];
  
  // Available reports
  tiposReportes: TipoReporte[] = [
    {
      id: 'facturacion-anual',
      nombre: 'Facturación Anual',
      descripcion: 'Resumen de facturación agrupado por obra social con totales anuales',
      icono: 'fa-file-invoice-dollar',
      endpoint: 'facturacion-anual',
      requiereFiltros: true,
      filtros: [{ tipo: 'anio', label: 'Año' }]
    },
    {
      id: 'cobranzas-pendientes',
      nombre: 'Cobranzas Pendientes',
      descripcion: 'Detalle de pagos pendientes con antigüedad y vencimientos',
      icono: 'fa-credit-card',
      endpoint: 'cobranzas-pendientes',
      requiereFiltros: false
    },
    {
      id: 'pacientes-obra-social',
      nombre: 'Pacientes por Obra Social',
      descripcion: 'Distribución de pacientes y servicios por obra social',
      icono: 'fa-users',
      endpoint: 'pacientes-obra-social',
      requiereFiltros: false
    },
    {
      id: 'rentabilidad-mensual',
      nombre: 'Rentabilidad Mensual',
      descripcion: 'Análisis de ingresos vs egresos con márgenes por período',
      icono: 'fa-chart-line',
      endpoint: 'rentabilidad-mensual',
      requiereFiltros: true,
      filtros: [{ tipo: 'anio', label: 'Año' }]
    },
    {
      id: 'resumen-anual',
      nombre: 'Resumen Anual',
      descripcion: 'Resumen ejecutivo con métricas clave del año',
      icono: 'fa-chart-pie',
      endpoint: 'resumen-anual',
      requiereFiltros: true,
      filtros: [{ tipo: 'anio', label: 'Año' }]
    },
    {
      id: 'dashboard',
      nombre: 'Dashboard General',
      descripcion: 'KPIs y métricas principales del sistema',
      icono: 'fa-tachometer-alt',
      endpoint: 'dashboard',
      requiereFiltros: false
    }
  ];
  
  // Computed
  totalPacientes = computed(() => this.dashboardStats()?.total_pacientes || 0);
  totalFacturado = computed(() => this.dashboardStats()?.total_facturado || 0);
  totalPendiente = computed(() => this.dashboardStats()?.total_pendiente || 0);
  
  filteredReportes = computed(() => {
    let result = this.tiposReportes;
    const search = this.searchText().toLowerCase();
    const categoria = this.selectedCategoria();
    
    if (search) {
      result = result.filter(r => 
        r.nombre.toLowerCase().includes(search) || 
        r.descripcion.toLowerCase().includes(search)
      );
    }
    
    if (categoria !== 'todos') {
      // Map categoria to endpoint prefixes
      const categoriaMap: { [key: string]: string[] } = {
        'facturación': ['facturacion'],
        'cobranza': ['cobranzas'],
        'análisis': ['rentabilidad', 'resumen'],
        'operaciones': ['pacientes', 'dashboard']
      };
      const endpoints = categoriaMap[categoria.toLowerCase()] || [];
      result = result.filter(r => endpoints.some(e => r.endpoint.includes(e)));
    }
    
    return result;
  });
  
  constructor(
    private reportesService: ReportesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }
  
  loadDashboard() {
    this.reportesService.getDashboard().subscribe({
      next: (res) => {
        if (res.data) {
          const data = (res.data as any).datos || res.data;
          this.dashboardStats.set(data);
        }
      },
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  generarReporte(tipo: TipoReporte) {
    this.loading.set(true);
    this.error.set(null);
    this.selectedReporteName.set(tipo.nombre);
    
    let observable;
    
    switch (tipo.endpoint) {
      case 'facturacion-anual':
        observable = this.reportesService.getFacturacionAnual(this.selectedAnio());
        break;
      case 'cobranzas-pendientes':
        observable = this.reportesService.getCobranzasPendientes(this.selectedObraSocial() || undefined);
        break;
      case 'pacientes-obra-social':
        observable = this.reportesService.getPacientesPorObraSocial();
        break;
      case 'rentabilidad-mensual':
        observable = this.reportesService.getRentabilidadMensual(this.selectedAnio());
        break;
      case 'resumen-anual':
        observable = this.reportesService.getResumenAnual(this.selectedAnio());
        break;
      case 'dashboard':
        observable = this.reportesService.getDashboard();
        break;
      default:
        this.snackBar.open('Tipo de reporte no soportado', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
        return;
    }
    
    observable.subscribe({
      next: (res) => {
        console.log('Reporte response:', res);
        if (res.data) {
          this.reporteActual.set(res.data);
          this.showResultModal.set(true);
        } else {
          this.snackBar.open('No hay datos para mostrar', 'Cerrar', { duration: 3000 });
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error generating report:', err);
        this.snackBar.open('Error al generar reporte: ' + (err.error?.message || err.message), 'Cerrar', { duration: 5000 });
        this.loading.set(false);
      }
    });
  }
  
  closeResultModal() {
    this.showResultModal.set(false);
    this.reporteActual.set(null);
  }
  
  exportarCSV() {
    const data = this.reporteActual();
    if (!data) return;
    
    let rows: any[] = [];
    
    // Extract data array from response
    if (data.datos) {
      rows = Array.isArray(data.datos) ? data.datos : [data.datos];
    } else if (Array.isArray(data)) {
      rows = data;
    } else {
      rows = [data];
    }
    
    if (rows.length === 0) {
      this.snackBar.open('No hay datos para exportar', 'Cerrar', { duration: 3000 });
      return;
    }
    
    // Get headers from first row
    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(','),
      ...rows.map(row => headers.map(h => {
        const val = row[h];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? '';
      }).join(','))
    ];
    
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${this.selectedReporteName().toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.snackBar.open('Reporte exportado', 'Cerrar', { duration: 3000 });
  }
  
  exportarJSON() {
    const data = this.reporteActual();
    if (!data) return;
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${this.selectedReporteName().toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.snackBar.open('Reporte exportado', 'Cerrar', { duration: 3000 });
  }
  
  getReporteDataArray(): any[] {
    const data = this.reporteActual();
    if (!data) return [];
    
    if (data.datos) {
      return Array.isArray(data.datos) ? data.datos : [data.datos];
    } else if (Array.isArray(data)) {
      return data;
    }
    return [data];
  }
  
  getReporteHeaders(): string[] {
    const rows = this.getReporteDataArray();
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).filter(k => !k.endsWith('_id') && k !== 'created_at' && k !== 'updated_at');
  }
  
  getResumenData(): { label: string; value: any }[] {
    const data = this.reporteActual();
    if (!data?.resumen) return [];
    
    const resumen = data.resumen;
    return Object.entries(resumen).map(([key, value]) => ({
      label: this.formatLabel(key),
      value: this.formatValue(value)
    }));
  }
  
  formatLabel(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  formatValue(value: any): string {
    if (typeof value === 'number') {
      if (value > 10000) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
      }
      return value.toLocaleString('es-AR');
    }
    return String(value);
  }
  
  formatCellValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      if (value > 1000) {
        return value.toLocaleString('es-AR');
      }
      return String(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return String(value);
  }
  
  retry() {
    this.loadDashboard();
  }
}
