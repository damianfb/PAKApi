import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PacientesService } from '../../../core/services/pacientes.service';

interface PacienteCartera {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  direccion_particular?: string;
  localidad?: string;
  activo: boolean;
  obraSocial?: string;
  kmDia?: number;
  conDependencia?: boolean;
  montoMensual?: number;
}

@Component({
    selector: 'app-cartera-list',
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ],
    templateUrl: './cartera-list.component.html',
    styleUrl: './cartera-list.component.scss'
})
export class CarteraListComponent implements OnInit {
  pacientes = signal<PacienteCartera[]>([]);
  loading = signal(true);
  searchTerm = '';
  selectedObraSocial = 'todos';
  selectedDependencia = 'todos';
  selectedEstado = 'activo';
  
  // Stats
  totalPacientes = 42;
  kmTotales = 784;
  facturacionEstimada = 1800000;

  // Mock data
  obrasSociales = ['OSECAC', 'OSMATA', 'OSPSA', 'PASTELEROS', 'SWISS MEDICAL', 'Otros'];

  constructor(private pacientesService: PacientesService) {}

  ngOnInit() {
    this.loadPacientes();
  }

  loadPacientes() {
    this.loading.set(true);
    this.pacientesService.getAll({}).subscribe({
      next: (response) => {
        // Enrich data with mock values for demo
        const enrichedData = response.data.map((p, index) => ({
          ...p,
          obraSocial: this.obrasSociales[index % this.obrasSociales.length],
          kmDia: Math.floor(Math.random() * 25) + 5,
          conDependencia: index % 2 === 0,
          montoMensual: Math.floor(Math.random() * 300000) + 100000
        }));
        this.pacientes.set(enrichedData);
        this.totalPacientes = enrichedData.length;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pacientes:', err);
        this.loading.set(false);
        // Load mock data
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const mockData: PacienteCartera[] = [
      { id: '1', nombre: 'TOMAS SEBASTIAN', apellido: 'ALANIS', dni: '55284684', telefono: '(351) 555-1234', direccion_particular: 'Av. Colón 1234', localidad: 'Córdoba', activo: true, obraSocial: 'OSMATA', kmDia: 28, conDependencia: true, montoMensual: 467163 },
      { id: '2', nombre: 'ABEL', apellido: 'CONSALVO ANTONINI', dni: '45789123', telefono: '(351) 555-2345', direccion_particular: 'Bv. San Juan 567', localidad: 'Córdoba', activo: true, obraSocial: 'OSECAC', kmDia: 25, conDependencia: true, montoMensual: 416895 },
      { id: '3', nombre: 'MARIA SOL', apellido: 'RODRIGUEZ', dni: '38456789', telefono: '(351) 555-3456', direccion_particular: 'Av. Vélez Sarsfield 890', localidad: 'Córdoba', activo: true, obraSocial: 'OSPSA', kmDia: 22, conDependencia: false, montoMensual: 271753 },
      { id: '4', nombre: 'JUAN PABLO', apellido: 'MARTINEZ', dni: '42567890', telefono: '(351) 555-4567', direccion_particular: 'Calle Dean Funes 123', localidad: 'Córdoba', activo: true, obraSocial: 'OSECAC', kmDia: 20, conDependencia: true, montoMensual: 333516 },
      { id: '5', nombre: 'LUCAS GABRIEL', apellido: 'FERNANDEZ', dni: '39678901', telefono: '(351) 555-5678', direccion_particular: 'Av. Hipólito Yrigoyen 456', localidad: 'Córdoba', activo: true, obraSocial: 'OSMATA', kmDia: 18, conDependencia: false, montoMensual: 222344 },
      { id: '6', nombre: 'ANA LAURA', apellido: 'GOMEZ', dni: '44789012', telefono: '(351) 555-6789', direccion_particular: 'Bv. Chacabuco 789', localidad: 'Córdoba', activo: true, obraSocial: 'SWISS MEDICAL', kmDia: 15, conDependencia: true, montoMensual: 250137 },
      { id: '7', nombre: 'DIEGO MARTIN', apellido: 'LOPEZ', dni: '41890123', telefono: '(351) 555-7890', direccion_particular: 'Av. Poeta Lugones 101', localidad: 'Córdoba', activo: true, obraSocial: 'PASTELEROS', kmDia: 14, conDependencia: false, montoMensual: 172933 },
      { id: '8', nombre: 'CARLA BEATRIZ', apellido: 'SANCHEZ', dni: '46901234', telefono: '(351) 555-8901', direccion_particular: 'Calle 27 de Abril 234', localidad: 'Córdoba', activo: true, obraSocial: 'OSECAC', kmDia: 12, conDependencia: true, montoMensual: 180097 },
      { id: '9', nombre: 'MATIAS EZEQUIEL', apellido: 'DIAZ', dni: '40012345', telefono: '(351) 555-9012', direccion_particular: 'Av. General Paz 567', localidad: 'Córdoba', activo: true, obraSocial: 'OSMATA', kmDia: 11, conDependencia: false, montoMensual: 135876 },
      { id: '10', nombre: 'SOFIA VALENTINA', apellido: 'TORRES', dni: '47123456', telefono: '(351) 555-0123', direccion_particular: 'Bv. Los Granaderos 890', localidad: 'Córdoba', activo: true, obraSocial: 'OSPSA', kmDia: 10, conDependencia: true, montoMensual: 166758 }
    ];
    this.pacientes.set(mockData);
    this.totalPacientes = mockData.length;
    this.loading.set(false);
  }

  get filteredPacientes(): PacienteCartera[] {
    return this.pacientes().filter(p => {
      const matchSearch = this.searchTerm === '' || 
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.apellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.dni.includes(this.searchTerm);
      
      const matchObraSocial = this.selectedObraSocial === 'todos' || 
        p.obraSocial?.toLowerCase().includes(this.selectedObraSocial.toLowerCase());
      
      const matchDependencia = this.selectedDependencia === 'todos' ||
        (this.selectedDependencia === 'con' && p.conDependencia) ||
        (this.selectedDependencia === 'sin' && !p.conDependencia);
      
      const matchEstado = this.selectedEstado === 'todos' ||
        (this.selectedEstado === 'activo' && p.activo) ||
        (this.selectedEstado === 'inactivo' && !p.activo);
      
      return matchSearch && matchObraSocial && matchDependencia && matchEstado;
    });
  }

  openNewPacienteModal() {
    // TODO: Implement modal
    console.log('Open new paciente modal');
  }

  viewPaciente(paciente: PacienteCartera) {
    // TODO: Implement view
    console.log('View paciente', paciente);
  }

  editPaciente(paciente: PacienteCartera) {
    // TODO: Implement edit
    console.log('Edit paciente', paciente);
  }

  exportData() {
    // TODO: Implement export
    console.log('Export data');
  }
}
