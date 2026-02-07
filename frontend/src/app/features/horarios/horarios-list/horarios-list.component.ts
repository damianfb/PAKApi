import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorariosService } from '../../../core/services/horarios.service';
import { ConductoresService } from '../../../core/services/conductores.service';
import { PacientesService } from '../../../core/services/pacientes.service';
import { HorarioTraslado, Conductor, Paciente } from '../../../shared/models/entities.model';
import { MatSnackBar } from '@angular/material/snack-bar';

interface TrasladoView {
  id: string;
  paciente: string;
  paciente_id: string;
  hora: string;
  destino: string;
  conductor: string;
  conductor_id: string;
  estado: string;
  tipo_traslado: string;
}

interface ConductorStats {
  id: string;
  nombre: string;
  viajesHoy: number;
  kmHoy: number;
}

@Component({
    selector: 'app-horarios-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './horarios-list.component.html',
    styleUrl: './horarios-list.component.scss'
})
export class HorariosListComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  
  horarios = signal<HorarioTraslado[]>([]);
  conductores = signal<Conductor[]>([]);
  pacientes = signal<Paciente[]>([]);
  
  selectedConductor = signal<string>('todos');
  currentWeekStart = signal<Date>(this.getMonday(new Date()));
  
  // Modal state
  showModal = signal(false);
  editingHorario = signal<HorarioTraslado | null>(null);
  formData = {
    paciente_id: '',
    conductor_id: '',
    fecha: '',
    hora_inicio: '',
    tipo_traslado: 'ida' as 'ida' | 'vuelta' | 'ida_vuelta',
    observaciones: ''
  };
  
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  horasDelDia = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  
  // Computed stats
  totalViajes = computed(() => this.horarios().length);
  totalKm = computed(() => this.horarios().reduce((sum, h) => sum + (h.kilometros_recorridos || 0), 0));
  pacientesAtendidos = computed(() => new Set(this.horarios().map(h => h.paciente_id)).size);
  conductoresActivos = computed(() => new Set(this.horarios().filter(h => h.conductor_id).map(h => h.conductor_id)).size);
  
  // Week date range
  weekDateRange = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    return `${this.formatDate(start)} - ${this.formatDate(end)}`;
  });

  constructor(
    private horariosService: HorariosService,
    private conductoresService: ConductoresService,
    private pacientesService: PacientesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);
    
    // Load conductores
    this.conductoresService.getAll({ activo: true }).subscribe({
      next: (res) => {
        if (res.data) {
          this.conductores.set(Array.isArray(res.data) ? res.data : (res.data as any).data || []);
        }
      },
      error: (err) => console.error('Error cargando conductores:', err)
    });
    
    // Load pacientes for modal
    this.pacientesService.getAll({ activo: true }).subscribe({
      next: (res) => {
        if (res.data) {
          this.pacientes.set(Array.isArray(res.data) ? res.data : (res.data as any).data || []);
        }
      },
      error: (err) => console.error('Error cargando pacientes:', err)
    });
    
    this.loadHorarios();
  }

  loadHorarios() {
    const weekStart = this.currentWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4);
    
    const filters: any = {
      fecha_desde: this.formatDateISO(weekStart),
      fecha_hasta: this.formatDateISO(weekEnd),
      limit: 500
    };
    
    if (this.selectedConductor() !== 'todos') {
      filters.conductor_id = this.selectedConductor();
    }
    
    this.horariosService.getAll(filters).subscribe({
      next: (res) => {
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          this.horarios.set(data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando horarios:', err);
        this.error.set('Error al cargar los horarios. Intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  getTrasladosForCell(diaIndex: number, hora: string): TrasladoView[] {
    const cellDate = new Date(this.currentWeekStart());
    cellDate.setDate(cellDate.getDate() + diaIndex);
    const dateStr = this.formatDateISO(cellDate);
    
    return this.horarios()
      .filter(h => {
        const horaMatch = h.hora_inicio?.substring(0, 5) === hora;
        const fechaMatch = h.fecha === dateStr;
        return horaMatch && fechaMatch;
      })
      .map(h => ({
        id: h.id,
        paciente: this.getPacienteName(h.paciente_id),
        paciente_id: h.paciente_id,
        hora: h.hora_inicio || '',
        destino: h.tipo_traslado === 'ida' ? 'Ida' : h.tipo_traslado === 'vuelta' ? 'Vuelta' : 'Ida/Vuelta',
        conductor: this.getConductorName(h.conductor_id),
        conductor_id: h.conductor_id,
        estado: h.estado,
        tipo_traslado: h.tipo_traslado
      }));
  }

  getPacienteName(id: string): string {
    const paciente = this.pacientes().find(p => p.id === id);
    return paciente ? `${paciente.apellido} ${paciente.nombre?.charAt(0) || ''}.` : 'Sin asignar';
  }

  getConductorName(id: string): string {
    if (!id) return 'Sin asignar';
    const conductor = this.conductores().find(c => c.id === id);
    return conductor ? `${conductor.apellido} ${conductor.nombre}` : 'Sin asignar';
  }

  getConductorStats(): ConductorStats[] {
    const todayStr = this.formatDateISO(new Date());
    const stats: Map<string, ConductorStats> = new Map();
    
    this.conductores().forEach(c => {
      stats.set(c.id, {
        id: c.id,
        nombre: `${c.apellido}, ${c.nombre}`,
        viajesHoy: 0,
        kmHoy: 0
      });
    });
    
    this.horarios()
      .filter(h => h.fecha === todayStr && h.conductor_id)
      .forEach(h => {
        const stat = stats.get(h.conductor_id);
        if (stat) {
          stat.viajesHoy++;
          stat.kmHoy += h.kilometros_recorridos || 0;
        }
      });
    
    return Array.from(stats.values()).filter(s => s.viajesHoy > 0 || this.conductores().some(c => c.id === s.id && c.activo));
  }

  // Week navigation
  previousWeek() {
    const newDate = new Date(this.currentWeekStart());
    newDate.setDate(newDate.getDate() - 7);
    this.currentWeekStart.set(newDate);
    this.loadHorarios();
  }

  nextWeek() {
    const newDate = new Date(this.currentWeekStart());
    newDate.setDate(newDate.getDate() + 7);
    this.currentWeekStart.set(newDate);
    this.loadHorarios();
  }

  goToCurrentWeek() {
    this.currentWeekStart.set(this.getMonday(new Date()));
    this.loadHorarios();
  }

  onConductorFilterChange() {
    this.loadHorarios();
  }

  // Modal methods
  openNewTrasladoModal() {
    this.editingHorario.set(null);
    this.formData = {
      paciente_id: '',
      conductor_id: '',
      fecha: this.formatDateISO(new Date()),
      hora_inicio: '08:00',
      tipo_traslado: 'ida',
      observaciones: ''
    };
    this.showModal.set(true);
  }

  openEditModal(traslado: TrasladoView) {
    const horario = this.horarios().find(h => h.id === traslado.id);
    if (horario) {
      this.editingHorario.set(horario);
      this.formData = {
        paciente_id: horario.paciente_id,
        conductor_id: horario.conductor_id || '',
        fecha: horario.fecha,
        hora_inicio: horario.hora_inicio?.substring(0, 5) || '08:00',
        tipo_traslado: horario.tipo_traslado as any,
        observaciones: horario.observaciones || ''
      };
      this.showModal.set(true);
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.editingHorario.set(null);
  }

  saveHorario() {
    if (!this.formData.paciente_id || !this.formData.fecha || !this.formData.hora_inicio) {
      this.snackBar.open('Complete los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const data: Partial<HorarioTraslado> = {
      paciente_id: this.formData.paciente_id,
      conductor_id: this.formData.conductor_id || undefined,
      fecha: this.formData.fecha,
      hora_inicio: this.formData.hora_inicio + ':00',
      tipo_traslado: this.formData.tipo_traslado,
      observaciones: this.formData.observaciones,
      estado: 'programado'
    };

    const editing = this.editingHorario();
    if (editing) {
      this.horariosService.update(editing.id, data).subscribe({
        next: () => {
          this.snackBar.open('Horario actualizado', 'Cerrar', { duration: 3000 });
          this.closeModal();
          this.loadHorarios();
        },
        error: (err) => {
          this.snackBar.open('Error al actualizar: ' + (err.error?.message || 'Error desconocido'), 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.horariosService.create(data).subscribe({
        next: () => {
          this.snackBar.open('Horario creado', 'Cerrar', { duration: 3000 });
          this.closeModal();
          this.loadHorarios();
        },
        error: (err) => {
          this.snackBar.open('Error al crear: ' + (err.error?.message || 'Error desconocido'), 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  deleteHorario(traslado: TrasladoView) {
    if (confirm('¿Está seguro de eliminar este horario?')) {
      this.horariosService.remove(traslado.id).subscribe({
        next: () => {
          this.snackBar.open('Horario eliminado', 'Cerrar', { duration: 3000 });
          this.loadHorarios();
        },
        error: (err) => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  printSchedule() {
    window.print();
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'completado': return 'badge-success';
      case 'en_curso': return 'badge-warning';
      case 'cancelado': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  // Helper methods
  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  }

  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  retry() {
    this.loadData();
  }
}

