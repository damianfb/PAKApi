import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DestinosService } from '../../../core/services/destinos.service';
import { Destino } from '../../../shared/models/entities.model';

@Component({
  selector: 'app-destinos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './destinos-list.component.html',
  styleUrl: './destinos-list.component.scss'
})
export class DestinosListComponent implements OnInit {
  destinos = signal<Destino[]>([]);
  loading = signal(false);
  
  // Filters
  searchTerm = '';
  selectedEstado = 'todos';
  selectedTipo = 'todos';
  
  // Stats
  totalDestinos = 0;
  destinosActivos = 0;
  destinosInactivos = 0;
  
  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedDestino: Destino | null = null;
  
  // Form data
  formData: Partial<Destino> = this.getEmptyForm();

  // Tipos de destino
  tiposDestino = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinica', label: 'Clínica' },
    { value: 'centro_medico', label: 'Centro Médico' },
    { value: 'domicilio', label: 'Domicilio' },
    { value: 'laboratorio', label: 'Laboratorio' },
    { value: 'consultorio', label: 'Consultorio' }
  ];

  constructor(private destinosService: DestinosService) {}

  ngOnInit() {
    this.loadDestinos();
  }

  getEmptyForm(): Partial<Destino> {
    return {
      nombre: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      codigo_postal: '',
      telefono: '',
      tipo: 'hospital',
      coordenadas_lat: undefined,
      coordenadas_lng: undefined,
      activo: true
    };
  }

  loadDestinos() {
    this.loading.set(true);
    
    const filters: any = {};
    
    if (this.selectedEstado !== 'todos') {
      filters.activo = this.selectedEstado === 'activo';
    }

    if (this.selectedTipo !== 'todos') {
      filters.tipo = this.selectedTipo;
    }
    
    this.destinosService.getAll(filters).subscribe({
      next: (response) => {
        let data = response.data;
        
        // Filtrar por término de búsqueda
        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          data = data.filter(d => 
            d.nombre.toLowerCase().includes(term) ||
            d.direccion?.toLowerCase().includes(term) ||
            d.ciudad?.toLowerCase().includes(term)
          );
        }
        
        this.destinos.set(data);
        this.updateStats(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading destinos:', err);
        this.loading.set(false);
      }
    });
  }

  updateStats(data: Destino[]) {
    this.totalDestinos = data.length;
    this.destinosActivos = data.filter(d => d.activo).length;
    this.destinosInactivos = data.filter(d => !d.activo).length;
  }

  onFilterChange() {
    this.loadDestinos();
  }

  openNewModal() {
    this.modalMode = 'create';
    this.selectedDestino = null;
    this.formData = this.getEmptyForm();
    this.showModal = true;
  }

  editDestino(destino: Destino) {
    this.modalMode = 'edit';
    this.selectedDestino = destino;
    this.formData = { ...destino };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedDestino = null;
    this.formData = this.getEmptyForm();
  }

  saveDestino() {
    if (!this.formData.nombre || !this.formData.direccion) {
      alert('Los campos Nombre y Dirección son requeridos');
      return;
    }

    if (this.modalMode === 'create') {
      this.destinosService.create(this.formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadDestinos();
        },
        error: (err) => {
          console.error('Error creating destino:', err);
          alert(err.error?.error || 'Error al crear el destino');
        }
      });
    } else if (this.selectedDestino) {
      this.destinosService.update(this.selectedDestino.id, this.formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadDestinos();
        },
        error: (err) => {
          console.error('Error updating destino:', err);
          alert('Error al actualizar el destino');
        }
      });
    }
  }

  deleteDestino(destino: Destino) {
    if (confirm(`¿Está seguro de eliminar el destino "${destino.nombre}"?`)) {
      this.destinosService.remove(destino.id).subscribe({
        next: () => {
          this.loadDestinos();
        },
        error: (err) => {
          console.error('Error eliminando destino:', err);
          alert(err.error?.error || 'Error al eliminar el destino');
        }
      });
    }
  }

  getTipoLabel(tipo: string): string {
    return this.destinosService.getTipoLabel(tipo);
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge badge-success' : 'badge badge-secondary';
  }

  getTipoBadgeClass(tipo: string): string {
    const clases: { [key: string]: string } = {
      'hospital': 'badge badge-primary',
      'clinica': 'badge badge-info',
      'centro_medico': 'badge badge-warning',
      'domicilio': 'badge badge-secondary',
      'laboratorio': 'badge badge-success',
      'consultorio': 'badge badge-light'
    };
    return clases[tipo] || 'badge';
  }
}
