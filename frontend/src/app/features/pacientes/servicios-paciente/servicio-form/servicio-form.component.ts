import { Component, OnInit, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CarteraService } from '../../../../core/services/cartera.service';
import { ServicioPaciente, Paciente, Destino } from '../../../../shared/models/entities.model';

export interface ServicioFormDialogData {
  servicio?: ServicioPaciente;
  mode: 'create' | 'edit' | 'view';
  paciente_id: string;
  paciente?: Paciente;
  destinos: Destino[];
  valorKmDefault: number;
}

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './servicio-form.component.html',
  styleUrl: './servicio-form.component.scss'
})
export class ServicioFormComponent implements OnInit {
  form!: FormGroup;
  loading = signal(false);
  isViewMode = false;

  tiposServicio = [
    { value: 'escuela', label: 'Escuela' },
    { value: 'terapia', label: 'Terapias' },
    { value: 'cet', label: 'C.E.T.' },
    { value: 'hidroterapia', label: 'Hidroterapia' },
    { value: 'otro', label: 'Otro' }
  ];

  diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  constructor(
    private fb: FormBuilder,
    private carteraService: CarteraService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ServicioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServicioFormDialogData
  ) {
    this.isViewMode = data.mode === 'view';
  }

  ngOnInit() {
    this.initForm();
    if (this.data.servicio) {
      this.patchForm(this.data.servicio);
    }
  }

  initForm() {
    this.form = this.fb.group({
      tipo_servicio: [{ value: '', disabled: this.isViewMode }, Validators.required],
      destino_id: [{ value: '', disabled: this.isViewMode }],
      dias_semana: [{ value: [], disabled: this.isViewMode }, Validators.required],
      hora_ida: [{ value: '', disabled: this.isViewMode }],
      hora_vuelta: [{ value: '', disabled: this.isViewMode }],
      kilometros_diarios: [{ value: 0, disabled: this.isViewMode }, [Validators.required, Validators.min(0.1)]],
      valor_por_km: [{ value: this.data.valorKmDefault, disabled: this.isViewMode }, [Validators.required, Validators.min(0)]],
      cantidad_mensual: [{ value: 22, disabled: this.isViewMode }, [Validators.required, Validators.min(1)]],
      numero_autorizacion: [{ value: '', disabled: this.isViewMode }],
      fecha_inicio: [{ value: new Date().toISOString().split('T')[0], disabled: this.isViewMode }, Validators.required],
      fecha_fin: [{ value: null, disabled: this.isViewMode }],
      observaciones: [{ value: '', disabled: this.isViewMode }],
      activo: [{ value: true, disabled: this.isViewMode }]
    });

    // Auto-calcular monto cuando cambian los valores
    this.form.get('kilometros_diarios')?.valueChanges.subscribe(() => this.updateMontoEstimado());
    this.form.get('valor_por_km')?.valueChanges.subscribe(() => this.updateMontoEstimado());
    this.form.get('cantidad_mensual')?.valueChanges.subscribe(() => this.updateMontoEstimado());
  }

  patchForm(servicio: ServicioPaciente) {
    this.form.patchValue({
      tipo_servicio: servicio.tipo_servicio,
      destino_id: servicio.destino_id,
      dias_semana: servicio.dias_semana || [],
      hora_ida: servicio.hora_ida,
      hora_vuelta: servicio.hora_vuelta,
      kilometros_diarios: servicio.kilometros_diarios,
      valor_por_km: servicio.valor_por_km || this.data.valorKmDefault,
      // cantidad_mensual no está directamente en ServicioPaciente, se calcula
      numero_autorizacion: (servicio as any).numero_autorizacion || '',
      fecha_inicio: servicio.fecha_inicio,
      fecha_fin: servicio.fecha_fin,
      activo: servicio.activo
    });
  }

  getMontoEstimado(): number {
    const km = this.form.get('kilometros_diarios')?.value || 0;
    const valorKm = this.form.get('valor_por_km')?.value || 0;
    const cantidad = this.form.get('cantidad_mensual')?.value || 0;
    return km * valorKm * cantidad;
  }

  updateMontoEstimado() {
    // El monto se actualiza automáticamente en la UI
  }

  getTitle(): string {
    switch (this.data.mode) {
      case 'create': return 'Nuevo Servicio';
      case 'edit': return 'Editar Servicio';
      case 'view': return 'Detalle de Servicio';
      default: return 'Servicio';
    }
  }

  enableEdit() {
    this.isViewMode = false;
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.enable();
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    const formData = this.form.getRawValue();
    
    const servicioData: Partial<ServicioPaciente> = {
      paciente_id: this.data.paciente_id,
      destino_id: formData.destino_id || null,
      tipo_servicio: formData.tipo_servicio,
      dias_semana: formData.dias_semana,
      hora_ida: formData.hora_ida,
      hora_vuelta: formData.hora_vuelta,
      kilometros_diarios: formData.kilometros_diarios,
      valor_por_km: formData.valor_por_km,
      monto_mensual_estimado: this.getMontoEstimado(),
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      activo: formData.activo
    };

    // Agregar campos adicionales
    (servicioData as any).numero_autorizacion = formData.numero_autorizacion;
    (servicioData as any).cantidad_mensual = formData.cantidad_mensual;
    (servicioData as any).observaciones = formData.observaciones;

    if (this.data.mode === 'create') {
      this.carteraService.createServicio(servicioData).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Error creating servicio:', err);
          this.snackBar.open('Error al crear el servicio', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.carteraService.updateServicio(this.data.servicio!.id, servicioData).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Error updating servicio:', err);
          this.snackBar.open('Error al actualizar el servicio', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  selectAllDays() {
    this.form.get('dias_semana')?.setValue(['lunes', 'martes', 'miercoles', 'jueves', 'viernes']);
  }

  clearDays() {
    this.form.get('dias_semana')?.setValue([]);
  }
}
