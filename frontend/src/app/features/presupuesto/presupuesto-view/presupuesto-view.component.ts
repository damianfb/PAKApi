import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PresupuestoService, PresupuestoMovimiento, PresupuestoConcepto } from '../../../core/services/presupuesto.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-presupuesto-view',
    imports: [CommonModule, FormsModule],
    templateUrl: './presupuesto-view.component.html',
    styleUrl: './presupuesto-view.component.scss'
})
export class PresupuestoViewComponent implements OnInit {
  movimientos = signal<PresupuestoMovimiento[]>([]);
  conceptos = signal<PresupuestoConcepto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Filters
  selectedPeriodo = signal<string>(this.getCurrentPeriodo());
  selectedTipo = signal<string>('');
  selectedEstado = signal<string>('');
  searchTerm = signal<string>('');
  
  // Stats from API
  ingresosMes = signal(0);
  egresosMes = signal(0);
  pagadoMes = signal(0);
  pendienteMes = signal(0);
  
  // Computed
  resultadoMensual = computed(() => this.ingresosMes() - this.egresosMes());
  margenPorcentaje = computed(() => {
    const ingresos = this.ingresosMes();
    if (ingresos === 0) return 0;
    return Math.round((this.resultadoMensual() / ingresos) * 100);
  });
  
  // Modal state
  showMovimientoModal = signal(false);
  showPagoModal = signal(false);
  showConceptosModal = signal(false);
  selectedMovimiento = signal<PresupuestoMovimiento | null>(null);
  selectedConcepto = signal<PresupuestoConcepto | null>(null);
  isEditing = signal(false);
  isEditingConcepto = signal(false);
  
  // Form data
  nuevoMovimiento = {
    concepto_id: '',
    nombre: '',
    categoria: 'otros',
    tipo: 'egreso' as 'egreso' | 'ingreso',
    periodo: '',
    monto: 0,
    observaciones: ''
  };
  
  pagoMonto = 0;
  
  // Concepto form
  nuevoConcepto = {
    nombre: '',
    categoria: 'otros',
    tipo: 'egreso' as 'egreso' | 'ingreso',
    monto_base: 0,
    dia_vencimiento: undefined as number | undefined,
    es_recurrente: true,
    activo: true
  };
  
  // Options
  periodos: string[] = [];
  categorias = ['sueldos', 'autonomos', 'servicios', 'impuestos', 'prestamos', 'honorarios', 'combustible', 'mantenimiento', 'facturacion', 'otros'];
  
  // Filtered
  filteredMovimientos = computed(() => {
    let result = this.movimientos();
    
    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(m => {
        const nombre = m.nombre || m.concepto?.nombre || '';
        return nombre.toLowerCase().includes(search);
      });
    }
    
    return result;
  });
  
  // Resumen por categoría
  resumenEgresos = computed(() => {
    const egresos = this.movimientos().filter(m => {
      const tipo = m.tipo || m.concepto?.tipo;
      return tipo === 'egreso';
    });
    
    const porCategoria: { [key: string]: number } = {};
    egresos.forEach(e => {
      const cat = e.categoria || e.concepto?.categoria || 'otros';
      porCategoria[cat] = (porCategoria[cat] || 0) + (e.monto || 0);
    });
    
    const total = Object.values(porCategoria).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(porCategoria)
      .map(([categoria, monto]) => ({
        categoria: this.formatCategoria(categoria),
        monto,
        porcentaje: total > 0 ? Math.round((monto / total) * 100) : 0
      }))
      .sort((a, b) => b.monto - a.monto);
  });

  constructor(
    private presupuestoService: PresupuestoService,
    private snackBar: MatSnackBar
  ) {
    this.generatePeriodos();
  }

  ngOnInit() {
    this.loadData();
  }

  getCurrentPeriodo(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }
  
  generatePeriodos() {
    const periodos: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periodos.push(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
    }
    this.periodos = periodos;
  }
  
  formatCategoria(cat: string): string {
    const map: { [key: string]: string } = {
      'sueldos': 'Sueldos',
      'autonomos': 'Autónomos',
      'servicios': 'Servicios',
      'impuestos': 'Impuestos',
      'prestamos': 'Préstamos',
      'honorarios': 'Honorarios',
      'combustible': 'Combustible',
      'mantenimiento': 'Mantenimiento',
      'facturacion': 'Facturación',
      'otros': 'Otros'
    };
    return map[cat] || cat;
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);
    
    // Load conceptos
    this.presupuestoService.getConceptos({ activo: true }).subscribe({
      next: (res) => {
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : [];
          this.conceptos.set(data);
        }
      },
      error: (err) => console.error('Error cargando conceptos:', err)
    });
    
    this.loadMovimientos();
  }

  loadMovimientos() {
    const filters: any = {};
    if (this.selectedPeriodo()) filters.periodo = this.selectedPeriodo();
    if (this.selectedTipo()) filters.tipo = this.selectedTipo();
    if (this.selectedEstado()) filters.estado = this.selectedEstado();
    
    this.presupuestoService.getMovimientos(filters).subscribe({
      next: (res) => {
        console.log('Presupuesto response:', res);
        if (res.data) {
          let movimientosData: PresupuestoMovimiento[] = [];
          let totals = { ingresos: 0, egresos: 0, pagado: 0, pendiente: 0 };
          
          if (Array.isArray(res.data)) {
            movimientosData = res.data;
          } else if ((res.data as any).data) {
            movimientosData = (res.data as any).data || [];
            totals = (res.data as any).totals || totals;
          }
          
          this.movimientos.set(movimientosData);
          this.ingresosMes.set(totals.ingresos);
          this.egresosMes.set(totals.egresos);
          this.pagadoMes.set(totals.pagado);
          this.pendienteMes.set(totals.pendiente);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando movimientos:', err);
        this.error.set('Error al cargar los movimientos. Intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  onFilterChange() {
    this.loadMovimientos();
  }
  
  retry() {
    this.loadData();
  }

  // === Modal Movimiento ===
  openNewMovimientoModal() {
    this.isEditing.set(false);
    this.selectedMovimiento.set(null);
    this.nuevoMovimiento = {
      concepto_id: '',
      nombre: '',
      categoria: 'otros',
      tipo: 'egreso',
      periodo: this.selectedPeriodo(),
      monto: 0,
      observaciones: ''
    };
    this.showMovimientoModal.set(true);
  }
  
  editMovimiento(mov: PresupuestoMovimiento) {
    this.isEditing.set(true);
    this.selectedMovimiento.set(mov);
    this.nuevoMovimiento = {
      concepto_id: mov.concepto_id || '',
      nombre: mov.nombre || mov.concepto?.nombre || '',
      categoria: mov.categoria || mov.concepto?.categoria || 'otros',
      tipo: mov.tipo || mov.concepto?.tipo || 'egreso',
      periodo: mov.periodo,
      monto: mov.monto,
      observaciones: mov.observaciones || ''
    };
    this.showMovimientoModal.set(true);
  }
  
  closeMovimientoModal() {
    this.showMovimientoModal.set(false);
    this.selectedMovimiento.set(null);
  }
  
  saveMovimiento() {
    if (!this.nuevoMovimiento.monto || this.nuevoMovimiento.monto <= 0) {
      this.snackBar.open('Ingrese un monto válido', 'Cerrar', { duration: 3000 });
      return;
    }
    
    const data: any = {
      periodo: this.nuevoMovimiento.periodo,
      monto: Number(this.nuevoMovimiento.monto),
      observaciones: this.nuevoMovimiento.observaciones
    };
    
    if (this.nuevoMovimiento.concepto_id) {
      data.concepto_id = this.nuevoMovimiento.concepto_id;
    } else {
      if (!this.nuevoMovimiento.nombre) {
        this.snackBar.open('Ingrese un nombre para el movimiento', 'Cerrar', { duration: 3000 });
        return;
      }
      data.nombre = this.nuevoMovimiento.nombre;
      data.categoria = this.nuevoMovimiento.categoria;
      data.tipo = this.nuevoMovimiento.tipo;
    }
    
    if (this.isEditing() && this.selectedMovimiento()) {
      this.presupuestoService.updateMovimiento(this.selectedMovimiento()!.id, data).subscribe({
        next: () => {
          this.snackBar.open('Movimiento actualizado', 'Cerrar', { duration: 3000 });
          this.closeMovimientoModal();
          this.loadMovimientos();
        },
        error: (err) => {
          this.snackBar.open('Error al actualizar: ' + (err.error?.message || 'Error'), 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      this.presupuestoService.createMovimiento(data).subscribe({
        next: () => {
          this.snackBar.open('Movimiento creado', 'Cerrar', { duration: 3000 });
          this.closeMovimientoModal();
          this.loadMovimientos();
        },
        error: (err) => {
          this.snackBar.open('Error al crear: ' + (err.error?.message || 'Error'), 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  // === Modal Pago ===
  registrarPago(mov: PresupuestoMovimiento) {
    this.selectedMovimiento.set(mov);
    this.pagoMonto = mov.monto - (mov.monto_pagado || 0);
    this.showPagoModal.set(true);
  }
  
  closePagoModal() {
    this.showPagoModal.set(false);
    this.selectedMovimiento.set(null);
  }
  
  savePago() {
    const mov = this.selectedMovimiento();
    if (!mov) return;
    
    const monto = Number(this.pagoMonto);
    if (isNaN(monto) || monto <= 0) {
      this.snackBar.open('Ingrese un monto válido', 'Cerrar', { duration: 3000 });
      return;
    }
    
    const nuevoMontoPagado = (mov.monto_pagado || 0) + monto;
    
    this.presupuestoService.updateMovimiento(mov.id, { 
      monto_pagado: nuevoMontoPagado,
      monto: mov.monto,
      fecha_pago: new Date().toISOString().split('T')[0]
    }).subscribe({
      next: () => {
        this.snackBar.open('Pago registrado', 'Cerrar', { duration: 3000 });
        this.closePagoModal();
        this.loadMovimientos();
      },
      error: (err) => {
        this.snackBar.open('Error: ' + (err.error?.message || 'Error'), 'Cerrar', { duration: 5000 });
      }
    });
  }

  deleteMovimiento(mov: PresupuestoMovimiento) {
    if (!confirm('¿Está seguro de eliminar este movimiento?')) return;
    
    this.presupuestoService.deleteMovimiento(mov.id).subscribe({
      next: () => {
        this.snackBar.open('Movimiento eliminado', 'Cerrar', { duration: 3000 });
        this.loadMovimientos();
      },
      error: (err) => {
        this.snackBar.open('Error: ' + (err.error?.message || 'Error'), 'Cerrar', { duration: 5000 });
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'pagado': return 'badge badge-success';
      case 'pendiente': return 'badge badge-warning';
      case 'parcial': return 'badge badge-info';
      case 'cancelado': return 'badge badge-danger';
      default: return 'badge badge-secondary';
    }
  }

  exportData() {
    const headers = ['Periodo', 'Concepto', 'Categoría', 'Tipo', 'Monto', 'Pagado', 'Estado'];
    const rows = this.filteredMovimientos().map(m => [
      m.periodo,
      m.nombre || m.concepto?.nombre || '',
      m.categoria || m.concepto?.categoria || '',
      m.tipo || m.concepto?.tipo || '',
      m.monto,
      m.monto_pagado,
      m.estado
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presupuesto_${this.selectedPeriodo()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // === Modal Conceptos ===
  openConceptosModal() {
    this.loadConceptos();
    this.showConceptosModal.set(true);
  }

  closeConceptosModal() {
    this.showConceptosModal.set(false);
    this.selectedConcepto.set(null);
    this.isEditingConcepto.set(false);
  }

  loadConceptos() {
    this.presupuestoService.getConceptos({}).subscribe({
      next: (res) => {
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : [];
          this.conceptos.set(data);
        }
      },
      error: (err) => console.error('Error cargando conceptos:', err)
    });
  }

  openNewConceptoForm() {
    this.isEditingConcepto.set(false);
    this.selectedConcepto.set(null);
    this.nuevoConcepto = {
      nombre: '',
      categoria: 'otros',
      tipo: 'egreso',
      monto_base: 0,
      dia_vencimiento: undefined,
      es_recurrente: true,
      activo: true
    };
  }

  editConcepto(concepto: PresupuestoConcepto) {
    this.isEditingConcepto.set(true);
    this.selectedConcepto.set(concepto);
    this.nuevoConcepto = {
      nombre: concepto.nombre,
      categoria: concepto.categoria,
      tipo: concepto.tipo,
      monto_base: concepto.monto_base || 0,
      dia_vencimiento: concepto.dia_vencimiento,
      es_recurrente: concepto.es_recurrente ?? true,
      activo: concepto.activo ?? true
    };
  }

  saveConcepto() {
    if (!this.nuevoConcepto.nombre) {
      this.snackBar.open('Ingrese un nombre', 'Cerrar', { duration: 3000 });
      return;
    }

    const data = { ...this.nuevoConcepto };

    if (this.isEditingConcepto() && this.selectedConcepto()) {
      this.presupuestoService.updateConcepto(this.selectedConcepto()!.id, data).subscribe({
        next: () => {
          this.snackBar.open('Concepto actualizado', 'Cerrar', { duration: 3000 });
          this.loadConceptos();
          this.openNewConceptoForm();
        },
        error: (err) => this.snackBar.open('Error: ' + (err.error?.message || 'Error'), 'Cerrar', { duration: 5000 })
      });
    } else {
      this.presupuestoService.createConcepto(data).subscribe({
        next: () => {
          this.snackBar.open('Concepto creado', 'Cerrar', { duration: 3000 });
          this.loadConceptos();
          this.openNewConceptoForm();
        },
        error: (err) => this.snackBar.open('Error: ' + (err.error?.message || 'Error'), 'Cerrar', { duration: 5000 })
      });
    }
  }

  deleteConcepto(concepto: PresupuestoConcepto) {
    if (!confirm(`¿Eliminar concepto "${concepto.nombre}"?`)) return;

    this.presupuestoService.deleteConcepto(concepto.id).subscribe({
      next: () => {
        this.snackBar.open('Concepto eliminado', 'Cerrar', { duration: 3000 });
        this.loadConceptos();
      },
      error: (err) => this.snackBar.open('Error: ' + (err.error?.message || 'Error'), 'Cerrar', { duration: 5000 })
    });
  }

  toggleConceptoActivo(concepto: PresupuestoConcepto) {
    this.presupuestoService.updateConcepto(concepto.id, { activo: !concepto.activo }).subscribe({
      next: () => {
        this.loadConceptos();
      },
      error: (err) => this.snackBar.open('Error: ' + (err.error?.message || 'Error'), 'Cerrar', { duration: 5000 })
    });
  }
}

