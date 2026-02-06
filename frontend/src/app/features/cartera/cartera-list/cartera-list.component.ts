import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarteraService, PacienteCartera } from '../../../core/services/cartera.service';
import { ObrasSocialesService } from '../../../core/services/catalogs.service';
import { ObraSocial } from '../../../shared/models/entities.model';

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
  obrasSocialesList = signal<ObraSocial[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = '';;
  selectedObraSocial = 'todos';
  selectedDependencia = 'todos';
  selectedEstado = 'activo';
  
  // Valores de km por dependencia
  valorKmSinDep = 617.62;
  valorKmConDep = 833.79;

  // Stats calculados
  totalPacientes = computed(() => this.filteredPacientes.length);
  kmTotales = computed(() => 
    this.filteredPacientes.reduce((sum, p) => sum + (p.total_km_mes || 0), 0)
  );
  facturacionEstimada = computed(() => 
    this.filteredPacientes.reduce((sum, p) => sum + (p.total_monto_mensual || 0), 0)
  );

  constructor(
    private carteraService: CarteraService,
    private obrasSocialesService: ObrasSocialesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadObrasSociales();
    this.loadCartera();
  }

  loadObrasSociales() {
    this.obrasSocialesService.getAll().subscribe({
      next: (response) => {
        this.obrasSocialesList.set(response.data || []);
      },
      error: (err) => console.error('Error loading obras sociales:', err)
    });
  }

  loadCartera() {
    this.loading.set(true);
    this.carteraService.getCartera().subscribe({
      next: (response) => {
        this.pacientes.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading cartera:', err);
        this.loading.set(false);
        this.error.set('Error al cargar la cartera de pacientes. Verifique su conexión.');
      }
    });
  }

  loadMockData() {
    // 🔶 MOCK: Datos de cartera basados en CARTERA.md - usando UUIDs para compatibilidad con BD
    const mockData: PacienteCartera[] = [
      { 
        paciente_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', numero_legajo: '2501',
        nombre: 'TOMAS SEBASTIAN', apellido: 'ALANIS', dni: '55284684', 
        telefono: '351-261 6249', tutor_responsable: 'PAMELA', direccion_particular: 'Pje Nicolás Levalle 3675', 
        localidad: 'Córdoba', numero_afiliado: '', tipo_dependencia: 'C/DEPEN', activo: true,
        obra_social_nombre: 'OSMATA', obra_social_codigo: 'OSMATA',
        servicios: [
          { id: 's1', tipo_servicio: 'C.E.T.', cantidad_mensual: 22, kilometros_diarios: 17.60, valor_por_km: 833.79, monto_mensual_estimado: 322842.33, activo: true },
          { id: 's2', tipo_servicio: 'TERAPIAS', destino_direccion: 'Tucumán 1195', cantidad_mensual: 22, kilometros_diarios: 13.70, valor_por_km: 833.79, monto_mensual_estimado: 251303.40, activo: true }
        ],
        total_km_mes: 688.60, total_monto_mensual: 574145.73, valor_km_default: 833.79
      },
      { 
        paciente_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', numero_legajo: '2503',
        nombre: 'GINO IGNACIO', apellido: 'SANCHEZ', dni: '56063453', 
        telefono: '351-528 4192', tutor_responsable: 'MARINA', direccion_particular: 'Bernardo Houssay 2235', 
        localidad: 'Córdoba', numero_afiliado: '', tipo_dependencia: 'C/DEPEN', activo: true,
        obra_social_nombre: 'OSMATA', obra_social_codigo: 'OSMATA',
        servicios: [
          { id: 's3', tipo_servicio: 'ESCUELA', destino_direccion: 'Vieytes 1568', cantidad_mensual: 22, kilometros_diarios: 12.00, valor_por_km: 833.79, monto_mensual_estimado: 220119.77, activo: true },
          { id: 's4', tipo_servicio: 'TERAPIAS', destino_direccion: 'Rio Negro 570', cantidad_mensual: 22, kilometros_diarios: 12.00, valor_por_km: 833.79, monto_mensual_estimado: 220119.77, activo: true }
        ],
        total_km_mes: 528.00, total_monto_mensual: 440239.54, valor_km_default: 833.79
      },
      { 
        paciente_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567807', numero_legajo: '2507',
        nombre: 'JAZMIN', apellido: 'LOPEZ ALCAZAR', dni: '51348296', 
        telefono: '351-270 0106', tutor_responsable: 'ROMINA', direccion_particular: 'Pje Mar del Plata 4346', 
        localidad: 'Córdoba', numero_afiliado: '29606/02', tipo_dependencia: 'S/DEPEN', activo: true,
        obra_social_nombre: 'OSCCPTAC', obra_social_codigo: 'OSCCPTAC',
        servicios: [
          { id: 's5', tipo_servicio: 'ESCUELA', destino_direccion: 'Sarmiento 1450', cantidad_mensual: 22, kilometros_diarios: 12.00, valor_por_km: 617.62, monto_mensual_estimado: 163051.68, activo: true },
          { id: 's6', tipo_servicio: 'TERAPIAS', destino_direccion: 'Rio Primero 1015', cantidad_mensual: 22, kilometros_diarios: 12.00, valor_por_km: 617.62, monto_mensual_estimado: 163051.68, activo: true }
        ],
        total_km_mes: 528.00, total_monto_mensual: 326103.36, valor_km_default: 617.62
      },
      { 
        paciente_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567867', numero_legajo: '2567',
        nombre: 'ABEL', apellido: 'CONSALVO ANTONINI', dni: '47352009', 
        telefono: '351-204 2705', tutor_responsable: 'ALEJANDRA', direccion_particular: 'Alcides Casatti 702 - Unquillo', 
        localidad: 'Córdoba', numero_afiliado: '', tipo_dependencia: 'C/DEPEN', activo: true,
        obra_social_nombre: 'OSECAC', obra_social_codigo: 'OSECAC',
        servicios: [
          { id: 's7', tipo_servicio: 'C.E.T.', destino_direccion: 'Bialet Massé 1735', numero_autorizacion: '1486843', cantidad_mensual: 16, kilometros_diarios: 35.00, valor_por_km: 833.79, monto_mensual_estimado: 466920.72, activo: true },
          { id: 's8', tipo_servicio: 'TRATAMIENTOS', destino_direccion: 'Av Colón 184', numero_autorizacion: '1486845', cantidad_mensual: 16, kilometros_diarios: 43.00, valor_por_km: 833.79, monto_mensual_estimado: 573645.46, activo: true }
        ],
        total_km_mes: 1496.00, total_monto_mensual: 1247345.35, valor_km_default: 833.79
      },
      { 
        paciente_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567866', numero_legajo: '2566',
        nombre: 'SOFIA', apellido: 'LOPEZ', dni: '40940749', 
        telefono: '351-642 6374', tutor_responsable: 'LORENA', direccion_particular: 'Calle Pública 2 N° 983', 
        localidad: 'Córdoba', numero_afiliado: '', tipo_dependencia: 'C/DEPEN', activo: true,
        obra_social_nombre: 'OSECAC', obra_social_codigo: 'OSECAC',
        servicios: [
          { id: 's9', tipo_servicio: 'C.E.T.', destino_direccion: 'Santa Rosa 3256', numero_autorizacion: '1487461', cantidad_mensual: 22, kilometros_diarios: 12.00, valor_por_km: 833.79, monto_mensual_estimado: 220119.77, activo: true },
          { id: 's10', tipo_servicio: 'TRATAMIENTOS', destino_direccion: 'Richieri 3182', numero_autorizacion: '1515029', cantidad_mensual: 22, kilometros_diarios: 33.70, valor_por_km: 833.79, monto_mensual_estimado: 618169.68, activo: true }
        ],
        total_km_mes: 1005.40, total_monto_mensual: 838289.45, valor_km_default: 833.79
      }
    ];
    this.pacientes.set(mockData);
  }

  get filteredPacientes(): PacienteCartera[] {
    return this.pacientes().filter(p => {
      const matchSearch = this.searchTerm === '' || 
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.apellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.dni.includes(this.searchTerm);
      
      const matchObraSocial = this.selectedObraSocial === 'todos' || 
        p.obra_social_codigo?.toLowerCase().includes(this.selectedObraSocial.toLowerCase());
      
      const matchDependencia = this.selectedDependencia === 'todos' ||
        (this.selectedDependencia === 'con' && p.tipo_dependencia === 'C/DEPEN') ||
        (this.selectedDependencia === 'sin' && p.tipo_dependencia === 'S/DEPEN');
      
      const matchEstado = this.selectedEstado === 'todos' ||
        (this.selectedEstado === 'activo' && p.activo) ||
        (this.selectedEstado === 'inactivo' && !p.activo);
      
      return matchSearch && matchObraSocial && matchDependencia && matchEstado;
    });
  }

  get obrasSociales(): string[] {
    const unique = new Set(this.pacientes().map(p => p.obra_social_nombre).filter(Boolean));
    return Array.from(unique) as string[];
  }

  openNewPacienteModal() {
    this.router.navigate(['/pacientes/nuevo']);
  }

  viewPaciente(paciente: PacienteCartera) {
    this.router.navigate(['/pacientes', paciente.paciente_id]);
  }

  editPaciente(paciente: PacienteCartera) {
    this.router.navigate(['/pacientes', paciente.paciente_id, 'editar']);
  }

  viewServicios(paciente: PacienteCartera) {
    this.router.navigate(['/pacientes', paciente.paciente_id, 'servicios']);
  }

  exportData() {
    // Exportar a CSV
    const headers = ['N°', 'Apellido', 'Nombre', 'DNI', 'Obra Social', 'Teléfono', 'Tutor', 'Dependencia', 'Km Total', 'Monto Total'];
    const rows = this.filteredPacientes.map(p => [
      p.paciente_id,
      p.apellido,
      p.nombre,
      p.dni,
      p.obra_social_nombre || '',
      p.telefono || '',
      p.tutor_responsable || '',
      p.tipo_dependencia,
      p.total_km_mes.toFixed(2),
      p.total_monto_mensual.toFixed(2)
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cartera_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }
}
