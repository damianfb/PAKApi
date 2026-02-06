import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConductoresService } from '../../../core/services/conductores.service';
import { Conductor } from '../../../shared/models/entities.model';

@Component({
  selector: 'app-conductores-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conductores-list.component.html',
  styleUrl: './conductores-list.component.scss'
})
export class ConductoresListComponent implements OnInit {
  conductores = signal<Conductor[]>([]);
  loading = signal(false);
  
  // Filters
  searchTerm = '';
  selectedEstado = 'todos';
  
  // Stats
  totalConductores = 0;
  conductoresActivos = 0;
  conductoresInactivos = 0;
  
  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedConductor: Conductor | null = null;
  
  // Form data
  formData: Partial<Conductor> = this.getEmptyForm();

  constructor(private conductoresService: ConductoresService) {}

  ngOnInit() {
    this.loadConductores();
  }

  getEmptyForm(): Partial<Conductor> {
    return {
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
      email: '',
      licencia_conducir: '',
      licencia_vencimiento: '',
      activo: true
    };
  }

  loadConductores() {
    this.loading.set(true);
    
    const filters: any = {};
    
    if (this.selectedEstado !== 'todos') {
      filters.activo = this.selectedEstado === 'activo';
    }
    
    this.conductoresService.getAll(filters).subscribe({
      next: (response) => {
        let data = response.data;
        
        // Filtrar por término de búsqueda
        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          data = data.filter(c => 
            c.nombre.toLowerCase().includes(term) ||
            c.apellido.toLowerCase().includes(term) ||
            c.dni.toLowerCase().includes(term)
          );
        }
        
        this.conductores.set(data);
        this.updateStats(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading conductores:', err);
        this.loading.set(false);
      }
    });
  }

  updateStats(data: Conductor[]) {
    this.totalConductores = data.length;
    this.conductoresActivos = data.filter(c => c.activo).length;
    this.conductoresInactivos = data.filter(c => !c.activo).length;
  }

  onFilterChange() {
    this.loadConductores();
  }

  openNewModal() {
    this.modalMode = 'create';
    this.selectedConductor = null;
    this.formData = this.getEmptyForm();
    this.showModal = true;
  }

  editConductor(conductor: Conductor) {
    this.modalMode = 'edit';
    this.selectedConductor = conductor;
    this.formData = { ...conductor };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedConductor = null;
    this.formData = this.getEmptyForm();
  }

  saveConductor() {
    if (!this.formData.nombre || !this.formData.apellido || !this.formData.dni) {
      alert('Los campos Nombre, Apellido y DNI son requeridos');
      return;
    }

    if (this.modalMode === 'create') {
      this.conductoresService.create(this.formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadConductores();
        },
        error: (err) => {
          console.error('Error creating conductor:', err);
          alert(err.error?.error || 'Error al crear el conductor');
        }
      });
    } else if (this.selectedConductor) {
      this.conductoresService.update(this.selectedConductor.id, this.formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadConductores();
        },
        error: (err) => {
          console.error('Error updating conductor:', err);
          alert('Error al actualizar el conductor');
        }
      });
    }
  }

  deleteConductor(conductor: Conductor) {
    const nombre = this.conductoresService.getNombreCompleto(conductor);
    if (confirm(`¿Está seguro de eliminar al conductor "${nombre}"?`)) {
      this.conductoresService.remove(conductor.id).subscribe({
        next: () => {
          this.loadConductores();
        },
        error: (err) => {
          console.error('Error eliminando conductor:', err);
          alert(err.error?.error || 'Error al eliminar el conductor');
        }
      });
    }
  }

  getNombreCompleto(conductor: Conductor): string {
    return this.conductoresService.getNombreCompleto(conductor);
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge badge-success' : 'badge badge-secondary';
  }

  isLicenciaVencida(fecha: string | undefined): boolean {
    if (!fecha) return false;
    return new Date(fecha) < new Date();
  }

  isLicenciaPorVencer(fecha: string | undefined): boolean {
    if (!fecha) return false;
    const fechaVenc = new Date(fecha);
    const hoy = new Date();
    const tresMeses = new Date();
    tresMeses.setMonth(tresMeses.getMonth() + 3);
    return fechaVenc >= hoy && fechaVenc <= tresMeses;
  }
}
