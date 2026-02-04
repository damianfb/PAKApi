import { Component, OnInit, Inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PacientesService } from '../../../core/services/pacientes.service';
import { ObrasSocialesService } from '../../../core/services/catalogs.service';
import { Paciente, ObraSocial } from '../../../shared/models/entities.model';

// Adaptador de fecha personalizado para formato dd/mm/yyyy
export class AppDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return date.toLocaleDateString('es-AR');
  }

  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
    return super.parse(value);
  }
}

export const APP_DATE_FORMATS = {
  parse: {
    dateInput: 'input',
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

export interface PacienteFormDialogData {
  paciente?: Paciente;
  mode: 'create' | 'edit' | 'view';
}

@Component({
  selector: 'app-paciente-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-AR' },
    DatePipe
  ],
  templateUrl: './paciente-form.component.html',
  styleUrl: './paciente-form.component.scss'
})
export class PacienteFormComponent implements OnInit {
  form!: FormGroup;
  obrasSociales = signal<ObraSocial[]>([]);
  loading = signal(false);
  loadingObrasSociales = signal(true);
  isViewMode = false;

  provinciasArgentinas = [
    'Buenos Aires',
    'Ciudad Autónoma de Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  constructor(
    private fb: FormBuilder,
    private pacientesService: PacientesService,
    private obrasSocialesService: ObrasSocialesService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<PacienteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PacienteFormDialogData
  ) {
    this.isViewMode = data.mode === 'view';
  }

  ngOnInit() {
    this.initForm();
    this.loadObrasSociales();

    if (this.data.paciente) {
      this.patchForm(this.data.paciente);
    }
  }

  initForm() {
    this.form = this.fb.group({
      nombre: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.maxLength(100)]],
      apellido: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.maxLength(100)]],
      dni: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      fecha_nacimiento: [{ value: null, disabled: this.isViewMode }, Validators.required],
      telefono: [{ value: '', disabled: this.isViewMode }, Validators.pattern(/^[\d\s\-\+\(\)]+$/)],
      telefono_alternativo: [{ value: '', disabled: this.isViewMode }],
      tutor_responsable: [{ value: '', disabled: this.isViewMode }],
      telefono_tutor: [{ value: '', disabled: this.isViewMode }],
      direccion_particular: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.maxLength(200)]],
      localidad: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.maxLength(100)]],
      provincia: [{ value: 'Buenos Aires', disabled: this.isViewMode }, [Validators.required, Validators.maxLength(100)]],
      obra_social_id: [{ value: '', disabled: this.isViewMode }, Validators.required],
      numero_afiliado: [{ value: '', disabled: this.isViewMode }],
      tipo_dependencia: [{ value: 'S/DEPEN', disabled: this.isViewMode }, Validators.required],
      observaciones: [{ value: '', disabled: this.isViewMode }],
      activo: [{ value: true, disabled: this.isViewMode }]
    });
  }

  patchForm(paciente: Paciente) {
    this.form.patchValue({
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
      fecha_nacimiento: paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento) : null,
      telefono: paciente.telefono,
      telefono_alternativo: paciente.telefono_alternativo,
      tutor_responsable: paciente.tutor_responsable,
      telefono_tutor: paciente.telefono_tutor,
      direccion_particular: paciente.direccion_particular,
      localidad: paciente.localidad,
      provincia: paciente.provincia,
      obra_social_id: paciente.obra_social_id,
      numero_afiliado: paciente.numero_afiliado,
      tipo_dependencia: paciente.tipo_dependencia,
      observaciones: paciente.observaciones,
      activo: paciente.activo
    });
  }

  loadObrasSociales() {
    this.obrasSocialesService.getAll({ activo: true }).subscribe({
      next: (response) => {
        this.obrasSociales.set(response.data);
        this.loadingObrasSociales.set(false);
      },
      error: (err) => {
        console.error('Error loading obras sociales:', err);
        this.loadingObrasSociales.set(false);
        // Mock data for development
        this.obrasSociales.set([
          { id: '1', nombre: 'OSDE', codigo: 'OSDE', activo: true } as ObraSocial,
          { id: '2', nombre: 'Swiss Medical', codigo: 'SWISS', activo: true } as ObraSocial,
          { id: '3', nombre: 'IOMA', codigo: 'IOMA', activo: true } as ObraSocial
        ]);
      }
    });
  }

  getTitle(): string {
    switch (this.data.mode) {
      case 'create':
        return 'Nuevo Paciente';
      case 'edit':
        return 'Editar Paciente';
      case 'view':
        return 'Detalle del Paciente';
      default:
        return 'Paciente';
    }
  }

  onSubmit() {
    if (this.form.invalid || this.isViewMode) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formData = this.form.getRawValue();
    
    // Format date for API
    if (formData.fecha_nacimiento) {
      const date = new Date(formData.fecha_nacimiento);
      formData.fecha_nacimiento = date.toISOString().split('T')[0];
    }

    const operation = this.data.mode === 'edit' && this.data.paciente
      ? this.pacientesService.update(this.data.paciente.id, formData)
      : this.pacientesService.create(formData);

    operation.subscribe({
      next: (response) => {
        this.loading.set(false);
        this.snackBar.open(
          this.data.mode === 'edit' ? 'Paciente actualizado exitosamente' : 'Paciente creado exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(response.data);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error saving paciente:', err);
        this.snackBar.open('Error al guardar el paciente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  enableEdit() {
    this.isViewMode = false;
    this.data.mode = 'edit';
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.enable();
    });
  }
}
