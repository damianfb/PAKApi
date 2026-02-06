import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObrasSocialesService } from '../../../core/services/obras-sociales.service';
import { ObraSocial } from '../../../shared/models/entities.model';

@Component({
  selector: 'app-obras-sociales-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './obras-sociales-list.component.html',
  styleUrl: './obras-sociales-list.component.scss'
})
export class ObrasSocialesListComponent implements OnInit {
  obrasSociales = signal<ObraSocial[]>([]);
  loading = signal(false);
  
  // Filters
  searchTerm = '';
  selectedEstado = 'todos';
  
  // Stats
  totalObrasSociales = 0;
  obrasSocialesActivas = 0;
  obrasSocialesInactivas = 0;
  
  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedObraSocial: ObraSocial | null = null;
  
  // Form data
  formData: Partial<ObraSocial> = this.getEmptyForm();

  constructor(private obrasSocialesService: ObrasSocialesService) {}

  ngOnInit() {
    this.loadObrasSociales();
  }

  getEmptyForm(): Partial<ObraSocial> {
    return {
      nombre: '',
      codigo: '',
      telefono: '',
      email: '',
      direccion: '',
      activo: true
    };
  }

  loadObrasSociales() {
    this.loading.set(true);
    
    const filters: any = {};
    
    if (this.selectedEstado !== 'todos') {
      filters.activo = this.selectedEstado === 'activo';
    }
    
    this.obrasSocialesService.getAll(filters).subscribe({
      next: (response) => {
        let data = response.data;
        
        // Filtrar por término de búsqueda
        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          data = data.filter(os => 
            os.nombre.toLowerCase().includes(term) ||
            os.codigo?.toLowerCase().includes(term)
          );
        }
        
        this.obrasSociales.set(data);
        this.updateStats(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading obras sociales:', err);
        this.loading.set(false);
      }
    });
  }

  updateStats(data: ObraSocial[]) {
    this.totalObrasSociales = data.length;
    this.obrasSocialesActivas = data.filter(os => os.activo).length;
    this.obrasSocialesInactivas = data.filter(os => !os.activo).length;
  }

  onFilterChange() {
    this.loadObrasSociales();
  }

  openNewModal() {
    this.modalMode = 'create';
    this.selectedObraSocial = null;
    this.formData = this.getEmptyForm();
    this.showModal = true;
  }

  editObraSocial(obraSocial: ObraSocial) {
    this.modalMode = 'edit';
    this.selectedObraSocial = obraSocial;
    this.formData = { ...obraSocial };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedObraSocial = null;
    this.formData = this.getEmptyForm();
  }

  saveObraSocial() {
    if (!this.formData.nombre) {
      alert('El nombre es requerido');
      return;
    }

    if (this.modalMode === 'create') {
      this.obrasSocialesService.create(this.formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadObrasSociales();
        },
        error: (err) => {
          console.error('Error creating obra social:', err);
          alert(err.error?.error || 'Error al crear la obra social');
        }
      });
    } else if (this.selectedObraSocial) {
      this.obrasSocialesService.update(this.selectedObraSocial.id, this.formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadObrasSociales();
        },
        error: (err) => {
          console.error('Error updating obra social:', err);
          alert('Error al actualizar la obra social');
        }
      });
    }
  }

  deleteObraSocial(obraSocial: ObraSocial) {
    if (confirm(`¿Está seguro de eliminar la obra social "${obraSocial.nombre}"?`)) {
      this.obrasSocialesService.remove(obraSocial.id).subscribe({
        next: () => {
          this.loadObrasSociales();
        },
        error: (err) => {
          console.error('Error eliminando obra social:', err);
          alert(err.error?.error || 'Error al eliminar la obra social');
        }
      });
    }
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge badge-success' : 'badge badge-secondary';
  }
}
