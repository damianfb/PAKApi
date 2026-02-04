import { Component, OnInit, signal, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { PacientesService } from '../../../core/services/pacientes.service';
import { Paciente } from '../../../shared/models/entities.model';
import { PacienteFormComponent, PacienteFormDialogData } from '../paciente-form/paciente-form.component';

@Component({
    selector: 'app-pacientes-list',
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatDialogModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatPaginatorModule
    ],
    templateUrl: './pacientes-list.component.html',
    styleUrl: './pacientes-list.component.scss'
})
export class PacientesListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Paciente>([]);
  loading = signal(true);
  searchTerm = signal('');
  totalPacientes = signal(0);
  displayedColumns = ['nombre', 'dni', 'telefono', 'direccion', 'activo', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private pacientesService: PacientesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPacientes();
    
    // Configurar el filtro personalizado
    this.dataSource.filterPredicate = (data: Paciente, filter: string) => {
      const searchStr = filter.toLowerCase().trim();
      return data.nombre.toLowerCase().includes(searchStr) ||
             data.apellido.toLowerCase().includes(searchStr) ||
             data.dni.includes(searchStr) ||
             (data.telefono && data.telefono.includes(searchStr)) ||
             data.direccion_particular.toLowerCase().includes(searchStr) ||
             data.localidad.toLowerCase().includes(searchStr);
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadPacientes() {
    this.loading.set(true);
    this.pacientesService.getAll({}).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalPacientes.set(response.data.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pacientes:', err);
        this.loading.set(false);
        this.dataSource.data = [];
        this.totalPacientes.set(0);
      }
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value;
    this.searchTerm.set(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearSearch() {
    this.searchTerm.set('');
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openNewPacienteDialog() {
    const dialogRef = this.dialog.open(PacienteFormComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      data: {
        mode: 'create'
      } as PacienteFormDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPacientes();
      }
    });
  }

  viewPaciente(paciente: Paciente) {
    const dialogRef = this.dialog.open(PacienteFormComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      autoFocus: false,
      data: {
        paciente,
        mode: 'view'
      } as PacienteFormDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPacientes();
      }
    });
  }

  editPaciente(paciente: Paciente) {
    const dialogRef = this.dialog.open(PacienteFormComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      data: {
        paciente,
        mode: 'edit'
      } as PacienteFormDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPacientes();
      }
    });
  }
}
