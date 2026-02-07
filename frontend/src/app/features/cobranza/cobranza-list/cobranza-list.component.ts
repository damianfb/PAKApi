import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobranzasService, CobranzasResponse } from '../../../core/services/cobranzas.service';
import { ObrasSocialesService } from '../../../core/services/obras-sociales.service';
import { PeriodosService } from '../../../core/services/periodos.service';
import { Cobranza, ObraSocial, PeriodoFacturacion } from '../../../shared/models/entities.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-cobranza-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './cobranza-list.component.html',
    styleUrl: './cobranza-list.component.scss'
})
export class CobranzaListComponent implements OnInit {
  cobranzas = signal<Cobranza[]>([]);
  obrasSociales = signal<ObraSocial[]>([]);
  periodos = signal<PeriodoFacturacion[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Filters
  selectedPeriodo = signal<string>('');
  selectedObraSocial = signal<string>('');
  selectedEstado = signal<string>('');
  searchTerm = signal<string>('');
  
  // Stats from API
  totalACobrar = signal(0);
  cobradoMes = signal(0);
  pendienteCobro = signal(0);
  
  // Modal state
  showPagoModal = signal(false);
  showCobranzaModal = signal(false);
  showDetalleModal = signal(false);
  selectedCobranza = signal<Cobranza | null>(null);
  pagoMonto = 0;
  pagoMetodo = 'transferencia';
  pagoObservaciones = '';
  
  // Form para nueva cobranza
  nuevaCobranza = {
    numero_cobranza: '',
    fecha_cobranza: new Date().toISOString().split('T')[0],
    obra_social_id: '',
    periodo_id: '',
    monto_total: 0,
    fecha_vencimiento: '',
    observaciones: ''
  };

  // Comisión del 3%
  comisionesGeneradas = computed(() => Math.round(this.cobradoMes() * 0.03));
  
  // Filtered cobranzas
  filteredCobranzas = computed(() => {
    let result = this.cobranzas();
    
    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(c => 
        c.numero_cobranza?.toLowerCase().includes(search) ||
        c.obra_social?.nombre?.toLowerCase().includes(search)
      );
    }
    
    return result;
  });

  // Alert for overdue
  overdueCount = computed(() => {
    const today = new Date();
    return this.cobranzas().filter(c => {
      if (c.estado === 'cobrado' || c.estado === 'anulado') return false;
      if (!c.fecha_vencimiento) return false;
      const venc = new Date(c.fecha_vencimiento);
      const diffDays = Math.floor((today.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 60;
    }).length;
  });

  constructor(
    private cobranzasService: CobranzasService,
    private obrasSocialesService: ObrasSocialesService,
    private periodosService: PeriodosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);
    
    // Load obras sociales for filter
    this.obrasSocialesService.getAll({ activo: true }).subscribe({
      next: (res) => {
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          this.obrasSociales.set(data);
        }
      },
      error: (err) => console.error('Error cargando obras sociales:', err)
    });
    
    // Load periodos for filter
    this.periodosService.getAll().subscribe({
      next: (res) => {
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          this.periodos.set(data);
        }
      },
      error: (err) => console.error('Error cargando períodos:', err)
    });
    
    this.loadCobranzas();
  }

  loadCobranzas() {
    const filters: any = { limit: 100 };
    
    if (this.selectedObraSocial()) {
      filters.obra_social_id = this.selectedObraSocial();
    }
    if (this.selectedPeriodo()) {
      filters.periodo_id = this.selectedPeriodo();
    }
    if (this.selectedEstado()) {
      filters.estado = this.selectedEstado();
    }
    
    this.cobranzasService.getAll(filters).subscribe({
      next: (res) => {
        console.log('Response from cobranzas API:', res);
        if (res.data) {
          // La respuesta puede venir como { data: { data: [...], totals: {...} } }
          // o como { data: [...] } directamente
          let cobranzasData: Cobranza[] = [];
          let totals = { total_a_cobrar: 0, total_cobrado: 0, total_pendiente: 0 };
          
          if (Array.isArray(res.data)) {
            // Respuesta directa: { data: [...] }
            cobranzasData = res.data;
          } else if ((res.data as any).data) {
            // Respuesta anidada: { data: { data: [...], totals: {...} } }
            cobranzasData = (res.data as any).data || [];
            totals = (res.data as any).totals || totals;
          }
          
          console.log('Cobranzas parseadas:', cobranzasData);
          this.cobranzas.set(cobranzasData);
          
          // Set totals from API
          this.totalACobrar.set(totals.total_a_cobrar);
          this.cobradoMes.set(totals.total_cobrado);
          this.pendienteCobro.set(totals.total_pendiente);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando cobranzas:', err);
        this.error.set('Error al cargar las cobranzas. Intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  onFilterChange() {
    this.loadCobranzas();
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'cobrado': return 'badge badge-success';
      case 'pendiente': return 'badge badge-warning';
      case 'parcial': return 'badge badge-info';
      case 'anulado': return 'badge badge-danger';
      default: return 'badge badge-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'cobrado': return 'Cobrado';
      case 'pendiente': return 'Pendiente';
      case 'parcial': return 'Pago Parcial';
      case 'anulado': return 'Anulado';
      default: return estado;
    }
  }

  isOverdue(cobranza: Cobranza): boolean {
    if (cobranza.estado === 'cobrado' || cobranza.estado === 'anulado') return false;
    if (!cobranza.fecha_vencimiento) return false;
    return new Date(cobranza.fecha_vencimiento) < new Date();
  }

  // === Modal Nueva Cobranza ===
  openNuevaCobranzaModal() {
    this.nuevaCobranza = {
      numero_cobranza: this.generarNumeroCobranza(),
      fecha_cobranza: new Date().toISOString().split('T')[0],
      obra_social_id: '',
      periodo_id: '',
      monto_total: 0,
      fecha_vencimiento: this.calcularFechaVencimiento(30),
      observaciones: ''
    };
    this.showCobranzaModal.set(true);
  }
  
  generarNumeroCobranza(): string {
    const year = new Date().getFullYear();
    const count = this.cobranzas().length + 1;
    return `COB-${year}-${count.toString().padStart(4, '0')}`;
  }
  
  calcularFechaVencimiento(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }
  
  closeCobranzaModal() {
    this.showCobranzaModal.set(false);
  }
  
  saveCobranza() {
    if (!this.nuevaCobranza.numero_cobranza || !this.nuevaCobranza.monto_total) {
      this.snackBar.open('Complete los campos requeridos (número y monto)', 'Cerrar', { duration: 3000 });
      return;
    }
    
    const data: Partial<Cobranza> = {
      numero_cobranza: this.nuevaCobranza.numero_cobranza,
      fecha_cobranza: this.nuevaCobranza.fecha_cobranza,
      obra_social_id: this.nuevaCobranza.obra_social_id || undefined,
      periodo_id: this.nuevaCobranza.periodo_id || undefined,
      monto_total: Number(this.nuevaCobranza.monto_total),
      fecha_vencimiento: this.nuevaCobranza.fecha_vencimiento || undefined,
      observaciones: this.nuevaCobranza.observaciones || undefined,
      estado: 'pendiente',
      monto_cobrado: 0
    };
    
    this.cobranzasService.create(data).subscribe({
      next: () => {
        this.snackBar.open('Cobranza creada correctamente', 'Cerrar', { duration: 3000 });
        this.closeCobranzaModal();
        this.loadCobranzas();
      },
      error: (err) => {
        this.snackBar.open('Error al crear cobranza: ' + (err.error?.message || 'Error desconocido'), 'Cerrar', { duration: 5000 });
      }
    });
  }

  // === Modal Registrar Pago ===
  openNewPagoModal() {
    this.selectedCobranza.set(null);
    this.pagoMonto = 0;
    this.pagoMetodo = 'transferencia';
    this.pagoObservaciones = '';
    this.showPagoModal.set(true);
  }

  registrarPago(cobranza: Cobranza) {
    this.selectedCobranza.set(cobranza);
    this.pagoMonto = cobranza.monto_pendiente || 0;
    this.pagoMetodo = 'transferencia';
    this.pagoObservaciones = '';
    this.showPagoModal.set(true);
    console.log('Registrar pago modal abierto:', { cobranza, pagoMonto: this.pagoMonto });
  }

  closePagoModal() {
    this.showPagoModal.set(false);
    this.selectedCobranza.set(null);
  }

  savePago() {
    const cobranza = this.selectedCobranza();
    console.log('savePago called:', { cobranza, pagoMonto: this.pagoMonto });
    
    if (!cobranza) {
      this.snackBar.open('Seleccione una cobranza', 'Cerrar', { duration: 3000 });
      return;
    }
    
    // Parsear como número por si viene como string del input
    const monto = Number(this.pagoMonto);
    if (isNaN(monto) || monto <= 0) {
      this.snackBar.open('Ingrese un monto válido mayor a 0', 'Cerrar', { duration: 3000 });
      return;
    }

    const nuevoMontoCobrado = (cobranza.monto_cobrado || 0) + monto;
    console.log('Actualizando cobranza:', { id: cobranza.id, nuevoMontoCobrado });
    
    this.cobranzasService.update(cobranza.id, { monto_cobrado: nuevoMontoCobrado }).subscribe({
      next: () => {
        this.snackBar.open('Pago registrado correctamente', 'Cerrar', { duration: 3000 });
        this.closePagoModal();
        this.loadCobranzas();
      },
      error: (err) => {
        this.snackBar.open('Error al registrar el pago: ' + (err.error?.message || 'Error desconocido'), 'Cerrar', { duration: 3000 });
      }
    });
  }

  viewCobranza(cobranza: Cobranza) {
    this.selectedCobranza.set(cobranza);
    this.showDetalleModal.set(true);
  }
  
  closeDetalleModal() {
    this.showDetalleModal.set(false);
    this.selectedCobranza.set(null);
  }

  exportData() {
    // Simple CSV export
    const headers = ['Número', 'Obra Social', 'Fecha', 'Vencimiento', 'Monto Total', 'Cobrado', 'Pendiente', 'Estado'];
    const rows = this.filteredCobranzas().map(c => [
      c.numero_cobranza,
      c.obra_social?.nombre || '',
      c.fecha_cobranza,
      c.fecha_vencimiento || '',
      c.monto_total,
      c.monto_cobrado,
      c.monto_pendiente,
      c.estado
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cobranzas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  retry() {
    this.loadData();
  }
}

