import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasService, FacturasFilters } from '../../../core/services/facturas.service';
import { ObrasSocialesService } from '../../../core/services/catalogs.service';
import { PeriodosService } from '../../../core/services/periodos.service';
import { Factura, ObraSocial, PeriodoFacturacion } from '../../../shared/models/entities.model';

interface FacturaView extends Factura {
  obraSocialNombre?: string;
  periodoNombre?: string;
}

@Component({
    selector: 'app-facturacion-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './facturacion-list.component.html',
    styleUrl: './facturacion-list.component.scss'
})
export class FacturacionListComponent implements OnInit {
  facturas = signal<FacturaView[]>([]);
  obrasSociales = signal<ObraSocial[]>([]);
  periodos = signal<PeriodoFacturacion[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Filters
  selectedPeriodo = '';
  selectedObraSocial = 'todos';
  selectedEstado = 'todos';
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 50;
  totalItems = 0;
  totalPages = 0;
  
  // Stats
  totalFacturado = 0;
  facturasEmitidas = 0;
  facturasPendientes = 0;
  promedioFactura = 0;
  
  // Modal
  showModal = false;
  showDetalleModal = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedFactura: FacturaView | null = null;

  constructor(
    private facturasService: FacturasService,
    private obrasSocialesService: ObrasSocialesService,
    private periodosService: PeriodosService
  ) {}

  ngOnInit() {
    this.loadObrasSociales();
    this.loadPeriodos();
    this.loadFacturas();
  }

  loadObrasSociales() {
    this.obrasSocialesService.getAll({ activo: true }).subscribe({
      next: (response) => {
        this.obrasSociales.set(response.data);
      },
      error: (err) => {
        console.error('Error loading obras sociales:', err);
        // Mock data for development
        this.obrasSociales.set([
          { id: '1', nombre: 'OSECAC', codigo: 'OSECAC', activo: true, created_at: '', updated_at: '' },
          { id: '2', nombre: 'OSMATA', codigo: 'OSMATA', activo: true, created_at: '', updated_at: '' },
          { id: '3', nombre: 'OSPSA', codigo: 'OSPSA', activo: true, created_at: '', updated_at: '' },
          { id: '4', nombre: 'SWISS MEDICAL', codigo: 'SWISS', activo: true, created_at: '', updated_at: '' },
          { id: '5', nombre: 'PASTELEROS', codigo: 'PASTEL', activo: true, created_at: '', updated_at: '' }
        ]);
      }
    });
  }

  loadPeriodos() {
    this.periodosService.getAll({ limit: 12 }).subscribe({
      next: (response) => {
        this.periodos.set(response.data);
        if (response.data.length > 0) {
          // Seleccionar el primer período abierto, o el primero si todos están cerrados
          const periodoAbierto = response.data.find(p => p.estado === 'abierto');
          this.selectedPeriodo = periodoAbierto?.id || response.data[0].id;
        }
      },
      error: (err) => {
        console.error('Error loading periodos:', err);
        // 🔶 MOCK: Fallback - Datos de desarrollo cuando falla la API
        const mockPeriodos: PeriodoFacturacion[] = [
          { id: '1', periodo: '2026-01', fecha_inicio: '2026-01-01', fecha_fin: '2026-01-31', estado: 'abierto', created_at: '', updated_at: '' },
          { id: '2', periodo: '2025-12', fecha_inicio: '2025-12-01', fecha_fin: '2025-12-31', estado: 'cerrado', created_at: '', updated_at: '' },
          { id: '3', periodo: '2025-11', fecha_inicio: '2025-11-01', fecha_fin: '2025-11-30', estado: 'cerrado', created_at: '', updated_at: '' }
        ];
        this.periodos.set(mockPeriodos);
        this.selectedPeriodo = mockPeriodos[0].id;
      }
    });
  }

  loadFacturas() {
    this.loading.set(true);
    
    const filters: FacturasFilters = {
      page: this.currentPage,
      limit: this.pageSize
    };
    
    if (this.selectedPeriodo) {
      filters.periodo_id = this.selectedPeriodo;
    }
    
    if (this.selectedObraSocial !== 'todos') {
      filters.obra_social_id = this.selectedObraSocial;
    }
    
    if (this.selectedEstado !== 'todos') {
      filters.estado = this.selectedEstado;
    }
    
    this.facturasService.getAll(filters).subscribe({
      next: (response) => {
        const enrichedData: FacturaView[] = response.data.map(f => ({
          ...f,
          obraSocialNombre: f.obra_social?.nombre || 'Sin asignar',
          periodoNombre: f.periodo ? this.formatPeriodo(f.periodo) : 'N/A'
        }));
        this.facturas.set(enrichedData);
        
        if (response.pagination) {
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
        }
        
        this.updateStats(enrichedData);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading facturas:', err);
        this.loading.set(false);
        this.error.set('Error al cargar facturas. Verifique su conexión.');
      }
    });
  }

  loadMockData() {
    // 🔶 MOCK: Lista de facturas de desarrollo
    const mockData: FacturaView[] = [
      { id: '1', numero_factura: '0004-00001761', fecha_emision: '2026-01-20', fecha_vencimiento: '2026-02-20', periodo_id: '1', obra_social_id: '1', subtotal: 300000, impuestos: 22843, monto_total: 322843, estado: 'emitida', obraSocialNombre: 'OSECAC', periodoNombre: 'Enero 2026', created_at: '', updated_at: '' },
      { id: '2', numero_factura: '0004-00001760', fecha_emision: '2026-01-18', fecha_vencimiento: '2026-02-18', periodo_id: '1', obra_social_id: '2', subtotal: 200000, impuestos: 15000, monto_total: 215000, estado: 'emitida', obraSocialNombre: 'OSMATA', periodoNombre: 'Enero 2026', created_at: '', updated_at: '' },
      { id: '3', numero_factura: '0004-00001759', fecha_emision: '2026-01-15', fecha_vencimiento: '2026-02-15', periodo_id: '1', obra_social_id: '3', subtotal: 165000, impuestos: 13450, monto_total: 178450, estado: 'borrador', obraSocialNombre: 'OSPSA', periodoNombre: 'Enero 2026', created_at: '', updated_at: '' },
      { id: '4', numero_factura: '0004-00001758', fecha_emision: '2026-01-12', fecha_vencimiento: '2026-02-12', periodo_id: '1', obra_social_id: '1', subtotal: 250000, impuestos: 17890, monto_total: 267890, estado: 'emitida', obraSocialNombre: 'OSECAC', periodoNombre: 'Enero 2026', created_at: '', updated_at: '' },
      { id: '5', numero_factura: '0004-00001757', fecha_emision: '2026-01-10', fecha_vencimiento: '2026-02-10', periodo_id: '1', obra_social_id: '4', subtotal: 125000, impuestos: 8590, monto_total: 133590, estado: 'pagada', obraSocialNombre: 'SWISS MEDICAL', periodoNombre: 'Enero 2026', created_at: '', updated_at: '' },
      { id: '6', numero_factura: '0004-00001756', fecha_emision: '2026-01-08', fecha_vencimiento: '2026-02-08', periodo_id: '1', obra_social_id: '5', subtotal: 82000, impuestos: 7120, monto_total: 89120, estado: 'borrador', obraSocialNombre: 'PASTELEROS', periodoNombre: 'Enero 2026', created_at: '', updated_at: '' },
      { id: '7', numero_factura: '0004-00001755', fecha_emision: '2026-01-05', fecha_vencimiento: '2026-02-05', periodo_id: '1', obra_social_id: '2', subtotal: 290000, impuestos: 22450, monto_total: 312450, estado: 'emitida', obraSocialNombre: 'OSMATA', periodoNombre: 'Enero 2026', created_at: '', updated_at: '' },
      { id: '8', numero_factura: '0004-00001754', fecha_emision: '2026-01-03', fecha_vencimiento: '2026-02-03', periodo_id: '1', obra_social_id: '1', subtotal: 165000, impuestos: 13977, monto_total: 178977, estado: 'borrador', obraSocialNombre: 'OSECAC', periodoNombre: 'Enero 2026', created_at: '', updated_at: '' }
    ];
    this.facturas.set(mockData);
    this.updateStats(mockData);
    this.loading.set(false);
  }

  updateStats(data: FacturaView[]) {
    this.totalFacturado = data.reduce((sum, f) => sum + f.monto_total, 0);
    this.facturasEmitidas = data.filter(f => f.estado === 'emitida' || f.estado === 'pagada').length;
    this.facturasPendientes = data.filter(f => f.estado === 'borrador').length;
    this.promedioFactura = data.length > 0 ? Math.round(this.totalFacturado / data.length) : 0;
  }

  formatPeriodo(periodo: PeriodoFacturacion): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [anio, mes] = periodo.periodo.split('-').map(Number);
    return `${meses[mes - 1]} ${anio}`;
  }

  getPeriodoLabel(periodoId: string): string {
    const periodo = this.periodos().find(p => p.id === periodoId);
    return periodo ? this.formatPeriodo(periodo) : 'Todos';
  }

  get filteredFacturas(): FacturaView[] {
    return this.facturas().filter(f => {
      const matchSearch = this.searchTerm === '' || 
        f.numero_factura.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (f.obraSocialNombre && f.obraSocialNombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchSearch;
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'emitida': return 'badge badge-success';
      case 'borrador': return 'badge badge-warning';
      case 'pagada': return 'badge badge-info';
      case 'anulada': return 'badge badge-danger';
      case 'enviada': return 'badge badge-primary';
      default: return 'badge badge-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'emitida': return 'Emitida';
      case 'borrador': return 'Borrador';
      case 'pagada': return 'Pagada';
      case 'anulada': return 'Anulada';
      case 'enviada': return 'Enviada';
      default: return estado;
    }
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadFacturas();
  }

  openNewFacturaModal() {
    this.modalMode = 'create';
    this.selectedFactura = null;
    this.showModal = true;
  }

  viewFactura(factura: FacturaView) {
    this.selectedFactura = factura;
    this.showDetalleModal = true;
  }

  editFactura(factura: FacturaView) {
    this.modalMode = 'edit';
    this.selectedFactura = factura;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFactura = null;
  }

  closeDetalleModal() {
    this.showDetalleModal = false;
    this.selectedFactura = null;
  }

  onModalSave(data: Partial<Factura>) {
    if (this.modalMode === 'create') {
      this.facturasService.create(data).subscribe({
        next: () => {
          this.closeModal();
          this.loadFacturas();
        },
        error: (err) => {
          console.error('Error creating factura:', err);
          alert('Error al crear la factura');
        }
      });
    } else if (this.modalMode === 'edit' && this.selectedFactura) {
      this.facturasService.update(this.selectedFactura.id, data).subscribe({
        next: () => {
          this.closeModal();
          this.loadFacturas();
        },
        error: (err) => {
          console.error('Error updating factura:', err);
          alert('Error al actualizar la factura');
        }
      });
    }
  }

  anularFactura(factura: FacturaView) {
    if (confirm(`¿Está seguro de anular la factura ${factura.numero_factura}?`)) {
      this.facturasService.cambiarEstado(factura.id, 'anulada').subscribe({
        next: () => {
          this.loadFacturas();
        },
        error: (err) => {
          console.error('Error anulando factura:', err);
          alert('Error al anular la factura');
        }
      });
    }
  }

  emitirFactura(factura: FacturaView) {
    if (confirm(`¿Está seguro de emitir la factura ${factura.numero_factura}?`)) {
      this.facturasService.cambiarEstado(factura.id, 'emitida').subscribe({
        next: () => {
          this.loadFacturas();
        },
        error: (err) => {
          console.error('Error emitiendo factura:', err);
          alert('Error al emitir la factura');
        }
      });
    }
  }

  marcarComoPagada(factura: FacturaView) {
    const fechaPago = new Date().toISOString();
    this.facturasService.cambiarEstado(factura.id, 'pagada', fechaPago).subscribe({
      next: () => {
        this.loadFacturas();
      },
      error: (err) => {
        console.error('Error marcando como pagada:', err);
        alert('Error al marcar como pagada');
      }
    });
  }

  downloadPdf(factura: FacturaView) {
    console.log('Download PDF', factura);
    alert('Funcionalidad de descarga de PDF en desarrollo');
  }

  exportData() {
    console.log('Export data');
    alert('Funcionalidad de exportación en desarrollo');
  }

  // Método para guardar desde el modal simple
  saveFromModal(
    numeroFactura: string,
    periodoId: string,
    fechaEmision: string,
    fechaVencimiento: string,
    obraSocialId: string,
    estado: string,
    subtotal: string,
    impuestos: string,
    montoTotal: string,
    observaciones: string
  ) {
    const data: Partial<Factura> = {
      numero_factura: numeroFactura,
      periodo_id: periodoId,
      fecha_emision: fechaEmision,
      fecha_vencimiento: fechaVencimiento || undefined,
      obra_social_id: obraSocialId || undefined,
      estado: estado as Factura['estado'],
      subtotal: parseFloat(subtotal) || 0,
      impuestos: parseFloat(impuestos) || 0,
      monto_total: parseFloat(montoTotal) || 0,
      observaciones: observaciones || undefined
    };
    this.onModalSave(data);
  }

  // Pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadFacturas();
    }
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }
}

