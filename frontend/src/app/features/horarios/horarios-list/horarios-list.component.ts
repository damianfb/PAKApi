import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Traslado {
  id: number;
  paciente: string;
  hora: string;
  destino: string;
}

interface DiaHorario {
  fecha: Date;
  nombre: string;
  traslados: { [hora: string]: Traslado[] };
}

interface Chofer {
  id: number;
  nombre: string;
  vehiculo: string;
  viajesHoy: number;
  kmHoy: number;
}

@Component({
    selector: 'app-horarios-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './horarios-list.component.html',
    styleUrl: './horarios-list.component.scss'
})
// 🔶 MOCK: Pantalla completamente mockeada - No conectada a API
export class HorariosListComponent implements OnInit {
  loading = signal(false);
  
  selectedChofer = 'todos';
  selectedSemana = 'actual';
  
  // 🔶 MOCK: Lista de choferes hardcodeada
  choferes: Chofer[] = [
    { id: 1, nombre: 'Roberto García', vehiculo: 'Peugeot Partner AA123BB', viajesHoy: 12, kmHoy: 145 },
    { id: 2, nombre: 'Carlos Mendez', vehiculo: 'Renault Kangoo AB456CD', viajesHoy: 10, kmHoy: 120 },
    { id: 3, nombre: 'Miguel Torres', vehiculo: 'Fiat Doblo AC789EF', viajesHoy: 8, kmHoy: 95 }
  ];
  
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  horasDelDia = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  
  // 🔶 MOCK: Datos de horarios hardcodeados
  horarios: { [dia: string]: { [hora: string]: Traslado[] } } = {
    'Lunes': {
      '06:00': [{ id: 1, paciente: 'ALANIS T.', hora: '06:00', destino: 'Clínica Norte' }],
      '07:00': [{ id: 2, paciente: 'CONSALVO A.', hora: '07:00', destino: 'Hospital Central' }],
      '08:00': [{ id: 3, paciente: 'RODRIGUEZ M.', hora: '08:00', destino: 'Centro Médico' }],
      '12:00': [{ id: 4, paciente: 'ALANIS T.', hora: '12:00', destino: 'Regreso' }],
      '13:00': [{ id: 5, paciente: 'CONSALVO A.', hora: '13:00', destino: 'Regreso' }]
    },
    'Martes': {
      '07:00': [{ id: 6, paciente: 'MARTINEZ J.', hora: '07:00', destino: 'Sanatorio Sur' }],
      '08:00': [{ id: 7, paciente: 'FERNANDEZ L.', hora: '08:00', destino: 'Hospital Central' }],
      '14:00': [{ id: 8, paciente: 'MARTINEZ J.', hora: '14:00', destino: 'Regreso' }]
    },
    'Miércoles': {
      '06:00': [{ id: 9, paciente: 'GOMEZ A.', hora: '06:00', destino: 'Clínica Oeste' }],
      '08:00': [{ id: 10, paciente: 'LOPEZ D.', hora: '08:00', destino: 'Centro de Rehabilitación' }],
      '12:00': [{ id: 11, paciente: 'GOMEZ A.', hora: '12:00', destino: 'Regreso' }],
      '15:00': [{ id: 12, paciente: 'LOPEZ D.', hora: '15:00', destino: 'Regreso' }]
    },
    'Jueves': {
      '07:00': [{ id: 13, paciente: 'SANCHEZ C.', hora: '07:00', destino: 'Hospital Central' }],
      '09:00': [{ id: 14, paciente: 'DIAZ M.', hora: '09:00', destino: 'Clínica Norte' }],
      '13:00': [{ id: 15, paciente: 'SANCHEZ C.', hora: '13:00', destino: 'Regreso' }]
    },
    'Viernes': {
      '06:00': [{ id: 16, paciente: 'TORRES S.', hora: '06:00', destino: 'Centro Médico' }],
      '08:00': [{ id: 17, paciente: 'ALANIS T.', hora: '08:00', destino: 'Clínica Norte' }],
      '12:00': [{ id: 18, paciente: 'TORRES S.', hora: '12:00', destino: 'Regreso' }],
      '14:00': [{ id: 19, paciente: 'ALANIS T.', hora: '14:00', destino: 'Regreso' }]
    }
  };
  
  // 🔶 MOCK: Stats hardcodeados
  totalViajes = 30;
  totalKm = 360;
  pacientesAtendidos = 10;
  conductoresActivos = 3;

  ngOnInit() {
    // Load data
  }

  getTrasladosForCell(dia: string, hora: string): Traslado[] {
    return this.horarios[dia]?.[hora] || [];
  }

  openNewTrasladoModal() {
    console.log('Open new traslado modal');
  }

  printSchedule() {
    console.log('Print schedule');
  }

  viewTraslado(traslado: Traslado) {
    console.log('View traslado', traslado);
  }
}

