import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PacientesService } from '../../../core/services/pacientes.service';
import { Paciente } from '../../../shared/models/entities.model';

interface PacienteView {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  direccion_particular: string;
  localidad: string;
  provincia: string;
  activo: boolean;
  obraSocial?: string;
  tipo_dependencia?: string;
}

@Component({
    selector: 'app-pacientes-list',
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ],
    templateUrl: './pacientes-list.component.html',
    styleUrl: './pacientes-list.component.scss'
})
export class PacientesListComponent implements OnInit {
  pacientes = signal<PacienteView[]>([]);
  loading = signal(true);
  searchTerm = '';
  selectedObraSocial = 'todos';
  selectedEstado = 'todos';
  
  // Stats
  totalPacientes = 0;
  pacientesActivos = 0;
  pacientesConDependencia = 0;
  obrasSocialesCount = 0;

  // Filtros
  obrasSociales = ['OSECAC', 'OSMATA', 'OSPSA', 'PASTELEROS', 'SWISS MEDICAL', 'Otros'];
  
  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedPaciente: PacienteView | null = null;

  constructor(
    private pacientesService: PacientesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPacientes();
  }

  loadPacientes() {
    this.loading.set(true);
    this.pacientesService.getAll({}).subscribe({
      next: (response) => {
        const enrichedData = response.data.map((p, index) => ({
          id: p.id,
          nombre: p.nombre,
          apellido: p.apellido,
          dni: p.dni,
          telefono: p.telefono,
          direccion_particular: p.direccion_particular,
          localidad: p.localidad,
          provincia: p.provincia,
          activo: p.activo,
          obraSocial: this.obrasSociales[index % this.obrasSociales.length],
          tipo_dependencia: p.tipo_dependencia || (index % 2 === 0 ? 'C/DEPEN' : 'S/DEPEN')
        }));
        this.pacientes.set(enrichedData);
        this.updateStats(enrichedData);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pacientes:', err);
        this.loading.set(false);
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const mockData: PacienteView[] = [
      { id: '1', nombre: 'TOMAS SEBASTIAN', apellido: 'ALANIS', dni: '55284684', telefono: '(351) 555-1234', direccion_particular: 'Av. Colón 1234', localidad: 'Córdoba', provincia: 'Córdoba', activo: true, obraSocial: 'OSMATA', tipo_dependencia: 'C/DEPEN' },
      { id: '2', nombre: 'ABEL', apellido: 'CONSALVO ANTONINI', dni: '45789123', telefono: '(351) 555-2345', direccion_particular: 'Bv. San Juan 567', localidad: 'Córdoba', provincia: 'Córdoba', activo: true, obraSocial: 'OSECAC', tipo_dependencia: 'C/DEPEN' },
      { id: '3', nombre: 'MARIA SOL', apellido: 'RODRIGUEZ', dni: '38456789', telefono: '(351) 555-3456', direccion_particular: 'Av. Vélez Sarsfield 890', localidad: 'Córdoba', provincia: 'Córdoba', activo: true, obraSocial: 'OSPSA', tipo_dependencia: 'S/DEPEN' },
      { id: '4', nombre: 'JUAN PABLO', apellido: 'MARTINEZ', dni: '42567890', telefono: '(351) 555-4567', direccion_particular: 'Calle Dean Funes 123', localidad: 'Córdoba', provincia: 'Córdoba', activo: true, obraSocial: 'OSECAC', tipo_dependencia: 'C/DEPEN' },
      { id: '5', nombre: 'LUCAS GABRIEL', apellido: 'FERNANDEZ', dni: '39678901', telefono: '(351) 555-5678', direccion_particular: 'Av. Hipólito Yrigoyen 456', localidad: 'Córdoba', provincia: 'Córdoba', activo: true, obraSocial: 'OSMATA', tipo_dependencia: 'S/DEPEN' },
      { id: '6', nombre: 'ANA LAURA', apellido: 'GOMEZ', dni: '44789012', telefono: '(351) 555-6789', direccion_particular: 'Bv. Chacabuco 789', localidad: 'Córdoba', provincia: 'Córdoba', activo: true, obraSocial: 'SWISS MEDICAL', tipo_dependencia: 'C/DEPEN' },
      { id: '7', nombre: 'DIEGO MARTIN', apellido: 'LOPEZ', dni: '41890123', telefono: '(351) 555-7890', direccion_particular: 'Av. Poeta Lugones 101', localidad: 'Córdoba', provincia: 'Córdoba', activo: false, obraSocial: 'PASTELEROS', tipo_dependencia: 'S/DEPEN' },
      { id: '8', nombre: 'CARLA BEATRIZ', apellido: 'SANCHEZ', dni: '46901234', telefono: '(351) 555-8901', direccion_particular: 'Calle 27 de Abril 234', localidad: 'Córdoba', provincia: 'Córdoba', activo: true, obraSocial: 'OSECAC', tipo_dependencia: 'C/DEPEN' },
      { id: '9', nombre: 'MATIAS EZEQUIEL', apellido: 'DIAZ', dni: '40012345', telefono: '(351) 555-9012', direccion_particular: 'Av. General Paz 567', localidad: 'Córdoba', provincia: 'Córdoba', activo: true, obraSocial: 'OSMATA', tipo_dependencia: 'S/DEPEN' },
      { id: '10', nombre: 'SOFIA VALENTINA', apellido: 'TORRES', dni: '47123456', telefono: '(351) 555-0123', direccion_particular: 'Bv. Los Granaderos 890', localidad: 'Córdoba', provincia: 'Córdoba', activo: true, obraSocial: 'OSPSA', tipo_dependencia: 'C/DEPEN' }
    ];
    this.pacientes.set(mockData);
    this.updateStats(mockData);
    this.loading.set(false);
  }

  updateStats(data: PacienteView[]) {
    this.totalPacientes = data.length;
    this.pacientesActivos = data.filter(p => p.activo).length;
    this.pacientesConDependencia = data.filter(p => p.tipo_dependencia === 'C/DEPEN').length;
    const uniqueOS = new Set(data.map(p => p.obraSocial));
    this.obrasSocialesCount = uniqueOS.size;
  }

  get filteredPacientes(): PacienteView[] {
    return this.pacientes().filter(p => {
      const matchSearch = this.searchTerm === '' || 
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.apellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.dni.includes(this.searchTerm);
      
      const matchObraSocial = this.selectedObraSocial === 'todos' || 
        p.obraSocial?.toLowerCase().includes(this.selectedObraSocial.toLowerCase());
      
      const matchEstado = this.selectedEstado === 'todos' ||
        (this.selectedEstado === 'activo' && p.activo) ||
        (this.selectedEstado === 'inactivo' && !p.activo);

      return matchSearch && matchObraSocial && matchEstado;
    });
  }

  openNewPacienteModal() {
    this.modalMode = 'create';
    this.selectedPaciente = null;
    this.showModal = true;
  }

  viewPaciente(paciente: PacienteView) {
    this.modalMode = 'view';
    this.selectedPaciente = paciente;
    this.showModal = true;
  }

  editPaciente(paciente: PacienteView) {
    this.modalMode = 'edit';
    this.selectedPaciente = paciente;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPaciente = null;
  }

  onModalSave(data: any) {
    console.log('Saving paciente:', data);
    this.closeModal();
    this.loadPacientes();
  }
}
