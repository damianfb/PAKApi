import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeriodosService } from '../../../core/services/periodos.service';
import { PeriodoFacturacion } from '../../../shared/models/entities.model';

@Component({
    selector: 'app-periodos-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './periodos-list.component.html',
    styleUrl: './periodos-list.component.scss'
})
export class PeriodosListComponent implements OnInit {
  periodos = signal<PeriodoFacturacion[]>([]);
  loading = signal(false);
  
  // Filters
  selectedAnio = new Date().getFullYear();
  selectedEstado = 'todos';
  
  // Stats
  totalPeriodos = 0;
  periodosAbiertos = 0;
  periodosCerrados = 0;
  
  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedPeriodo: PeriodoFacturacion | null = null;
  
  // Form data
  formMes = 1;
  formAnio = new Date().getFullYear();
  formObservaciones = '';

  // Lists
  anios: number[] = [];
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

  constructor(private periodosService: PeriodosService) {
    // Generar lista de años (5 años atrás hasta 2 años adelante)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      this.anios.push(i);
    }
  }

  ngOnInit() {
    this.loadPeriodos();
  }

  loadPeriodos() {
    this.loading.set(true);
    
    const filters: any = {};
    
    if (this.selectedAnio) {
      filters.anio = this.selectedAnio;
    }
    
    if (this.selectedEstado !== 'todos') {
      filters.cerrado = this.selectedEstado === 'cerrado';
    }
    
    this.periodosService.getAll(filters).subscribe({
      next: (response) => {
        this.periodos.set(response.data);
        this.updateStats(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading periodos:', err);
        this.loading.set(false);
        // Cargar datos mock para desarrollo
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const currentYear = new Date().getFullYear();
    const mockData: PeriodoFacturacion[] = [];
    
    for (let mes = 1; mes <= 12; mes++) {
      mockData.push({
        id: `${currentYear}-${mes}`,
        mes: mes,
        anio: currentYear,
        fecha_inicio: `${currentYear}-${mes.toString().padStart(2, '0')}-01`,
        fecha_fin: new Date(currentYear, mes, 0).toISOString().split('T')[0],
        cerrado: mes < new Date().getMonth() + 1,
        created_at: '',
        updated_at: ''
      });
    }
    
    this.periodos.set(mockData);
    this.updateStats(mockData);
  }

  updateStats(data: PeriodoFacturacion[]) {
    this.totalPeriodos = data.length;
    this.periodosAbiertos = data.filter(p => !p.cerrado).length;
    this.periodosCerrados = data.filter(p => p.cerrado).length;
  }

  formatPeriodo(periodo: PeriodoFacturacion): string {
    return this.periodosService.formatPeriodo(periodo);
  }

  getMesLabel(mes: number): string {
    const mesObj = this.meses.find(m => m.value === mes);
    return mesObj ? mesObj.label : '';
  }

  onFilterChange() {
    this.loadPeriodos();
  }

  openNewPeriodoModal() {
    this.modalMode = 'create';
    this.selectedPeriodo = null;
    this.formMes = new Date().getMonth() + 1;
    this.formAnio = new Date().getFullYear();
    this.formObservaciones = '';
    this.showModal = true;
  }

  editPeriodo(periodo: PeriodoFacturacion) {
    this.modalMode = 'edit';
    this.selectedPeriodo = periodo;
    this.formMes = periodo.mes;
    this.formAnio = periodo.anio;
    this.formObservaciones = periodo.observaciones || '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPeriodo = null;
  }

  savePeriodo() {
    if (this.modalMode === 'create') {
      this.periodosService.create({
        mes: this.formMes,
        anio: this.formAnio,
        observaciones: this.formObservaciones || undefined
      }).subscribe({
        next: () => {
          this.closeModal();
          this.loadPeriodos();
        },
        error: (err) => {
          console.error('Error creating periodo:', err);
          alert(err.error?.error || 'Error al crear el período');
        }
      });
    } else if (this.selectedPeriodo) {
      this.periodosService.update(this.selectedPeriodo.id, {
        observaciones: this.formObservaciones || undefined
      }).subscribe({
        next: () => {
          this.closeModal();
          this.loadPeriodos();
        },
        error: (err) => {
          console.error('Error updating periodo:', err);
          alert('Error al actualizar el período');
        }
      });
    }
  }

  cerrarPeriodo(periodo: PeriodoFacturacion) {
    if (confirm(`¿Está seguro de cerrar el período ${this.formatPeriodo(periodo)}?`)) {
      this.periodosService.cerrarPeriodo(periodo.id).subscribe({
        next: () => {
          this.loadPeriodos();
        },
        error: (err) => {
          console.error('Error cerrando periodo:', err);
          alert('Error al cerrar el período');
        }
      });
    }
  }

  abrirPeriodo(periodo: PeriodoFacturacion) {
    if (confirm(`¿Está seguro de reabrir el período ${this.formatPeriodo(periodo)}?`)) {
      this.periodosService.abrirPeriodo(periodo.id).subscribe({
        next: () => {
          this.loadPeriodos();
        },
        error: (err) => {
          console.error('Error abriendo periodo:', err);
          alert('Error al abrir el período');
        }
      });
    }
  }

  deletePeriodo(periodo: PeriodoFacturacion) {
    if (confirm(`¿Está seguro de eliminar el período ${this.formatPeriodo(periodo)}?\n\nEsta acción no se puede deshacer.`)) {
      this.periodosService.remove(periodo.id).subscribe({
        next: () => {
          this.loadPeriodos();
        },
        error: (err) => {
          console.error('Error eliminando periodo:', err);
          alert(err.error?.error || 'Error al eliminar el período. Puede que tenga facturas asociadas.');
        }
      });
    }
  }

  getEstadoBadgeClass(cerrado: boolean): string {
    return cerrado ? 'badge badge-secondary' : 'badge badge-success';
  }

  getEstadoLabel(cerrado: boolean): string {
    return cerrado ? 'Cerrado' : 'Abierto';
  }
}
