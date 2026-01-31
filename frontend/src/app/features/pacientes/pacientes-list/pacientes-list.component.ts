import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { PacientesService } from '../../../core/services/pacientes.service';
import { Paciente } from '../../../shared/models/entities.model';

@Component({
    selector: 'app-pacientes-list',
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatChipsModule
    ],
    templateUrl: './pacientes-list.component.html',
    styleUrl: './pacientes-list.component.scss'
})
export class PacientesListComponent implements OnInit {
  pacientes = signal<Paciente[]>([]);
  loading = signal(true);
  displayedColumns = ['nombre', 'dni', 'telefono', 'direccion', 'activo', 'acciones'];

  constructor(private pacientesService: PacientesService) {}

  ngOnInit() {
    this.loadPacientes();
  }

  loadPacientes() {
    this.loading.set(true);
    this.pacientesService.getAll({ activo: true }).subscribe({
      next: (response) => {
        this.pacientes.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pacientes:', err);
        this.loading.set(false);
        // Mock data for development
        this.pacientes.set([]);
      }
    });
  }
}
