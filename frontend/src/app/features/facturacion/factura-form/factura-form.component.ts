import { Component, OnInit, Inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FacturasService } from '../../../core/services/facturas.service';
import { ObrasSocialesService } from '../../../core/services/catalogs.service';
import { ApiService } from '../../../core/services/api.service';
import { Factura, FacturaDetalle, ObraSocial, PeriodoFacturacion } from '../../../shared/models/entities.model';

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

export interface FacturaFormDialogData {
  factura?: Factura;
  mode: 'create' | 'edit' | 'view';
}

@Component({
  selector: 'app-factura-form',
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
    MatTableModule,
    MatTooltipModule
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-AR' },
    DatePipe
  ],
  templateUrl: './factura-form.component.html',
  styleUrl: './factura-form.component.scss'
})
export class FacturaFormComponent implements OnInit {
  form!: FormGroup;
  obrasSociales = signal<ObraSocial[]>([]);
  periodos = signal<PeriodoFacturacion[]>([]);
  detalles = signal<FacturaDetalle[]>([]);
  loading = signal(false);
  loadingData = signal(true);
  isViewMode = false;

  displayedColumns: string[] = ['descripcion', 'cantidad', 'precio_unitario', 'subtotal', 'acciones'];

  estados = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'emitida', label: 'Emitida' },
    { value: 'enviada', label: 'Enviada' },
    { value: 'pagada', label: 'Pagada' },
    { value: 'anulada', label: 'Anulada' }
  ];

  constructor(
    private fb: FormBuilder,
    private facturasService: FacturasService,
    private obrasSocialesService: ObrasSocialesService,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<FacturaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FacturaFormDialogData
  ) {
    this.isViewMode = data.mode === 'view';
  }

  ngOnInit() {
    this.initForm();
    this.loadCatalogs();

    if (this.data.factura) {
      this.patchForm(this.data.factura);
      if (this.data.factura.id) {
        this.loadDetalles(this.data.factura.id);
      }
    }
  }

  initForm() {
    this.form = this.fb.group({
      numero_factura: [{ value: '', disabled: this.isViewMode }, [Validators.required, Validators.maxLength(50)]],
      fecha_emision: [{ value: new Date(), disabled: this.isViewMode }, Validators.required],
      fecha_vencimiento: [{ value: null, disabled: this.isViewMode }],
      periodo_id: [{ value: '', disabled: this.isViewMode }, Validators.required],
      obra_social_id: [{ value: '', disabled: this.isViewMode }],
      subtotal: [{ value: 0, disabled: this.isViewMode }, [Validators.required, Validators.min(0)]],
      impuestos: [{ value: 0, disabled: this.isViewMode }, [Validators.required, Validators.min(0)]],
      monto_total: [{ value: 0, disabled: this.isViewMode }, [Validators.required, Validators.min(0)]],
      estado: [{ value: 'borrador', disabled: this.isViewMode }, Validators.required],
      observaciones: [{ value: '', disabled: this.isViewMode }]
    });

    // Auto-calcular monto total cuando cambian subtotal o impuestos
    this.form.get('subtotal')?.valueChanges.subscribe(() => this.calculateTotal());
    this.form.get('impuestos')?.valueChanges.subscribe(() => this.calculateTotal());
  }

  calculateTotal() {
    const subtotal = this.form.get('subtotal')?.value || 0;
    const impuestos = this.form.get('impuestos')?.value || 0;
    this.form.patchValue({ monto_total: subtotal + impuestos }, { emitEvent: false });
  }

  patchForm(factura: Factura) {
    this.form.patchValue({
      numero_factura: factura.numero_factura,
      fecha_emision: factura.fecha_emision ? new Date(factura.fecha_emision) : null,
      fecha_vencimiento: factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento) : null,
      periodo_id: factura.periodo_id,
      obra_social_id: factura.obra_social_id || '',
      subtotal: factura.subtotal,
      impuestos: factura.impuestos,
      monto_total: factura.monto_total,
      estado: factura.estado,
      observaciones: factura.observaciones || ''
    });
  }

  loadCatalogs() {
    // Cargar obras sociales
    this.obrasSocialesService.getAll({ activo: true }).subscribe({
      next: (response) => {
        this.obrasSociales.set(response.data);
      },
      error: (err) => {
        console.error('Error loading obras sociales:', err);
        // Mock data for development
        this.obrasSociales.set([
          { id: '1', nombre: 'OSECAC', codigo: 'OSECAC', activo: true, created_at: '', updated_at: '' },
          { id: '2', nombre: 'OSMATA', codigo: 'OSMATA', activo: true, created_at: '', updated_at: '' },
          { id: '3', nombre: 'OSPSA', codigo: 'OSPSA', activo: true, created_at: '', updated_at: '' }
        ]);
      }
    });

    // Cargar períodos
    this.apiService.get<PeriodoFacturacion[]>('periodos-facturacion', { limit: 12 }).subscribe({
      next: (response) => {
        this.periodos.set(response.data);
        this.loadingData.set(false);
      },
      error: (err) => {
        console.error('Error loading periodos:', err);
        // Mock data
        this.periodos.set([
          { id: '1', mes: 1, anio: 2026, fecha_inicio: '2026-01-01', fecha_fin: '2026-01-31', cerrado: false, created_at: '', updated_at: '' },
          { id: '2', mes: 12, anio: 2025, fecha_inicio: '2025-12-01', fecha_fin: '2025-12-31', cerrado: true, created_at: '', updated_at: '' }
        ]);
        this.loadingData.set(false);
      }
    });
  }

  loadDetalles(facturaId: string) {
    this.facturasService.getDetalles(facturaId).subscribe({
      next: (response) => {
        this.detalles.set(response.data);
      },
      error: (err) => {
        console.error('Error loading detalles:', err);
      }
    });
  }

  formatPeriodo(periodo: PeriodoFacturacion): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[periodo.mes - 1]} ${periodo.anio}`;
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading.set(true);
      
      const formValue = this.form.getRawValue();
      
      // Formatear fechas
      const facturaData: Partial<Factura> = {
        numero_factura: formValue.numero_factura,
        fecha_emision: this.datePipe.transform(formValue.fecha_emision, 'yyyy-MM-dd') || '',
        fecha_vencimiento: formValue.fecha_vencimiento ? 
          this.datePipe.transform(formValue.fecha_vencimiento, 'yyyy-MM-dd') || undefined : undefined,
        periodo_id: formValue.periodo_id,
        obra_social_id: formValue.obra_social_id || undefined,
        subtotal: formValue.subtotal,
        impuestos: formValue.impuestos,
        monto_total: formValue.monto_total,
        estado: formValue.estado,
        observaciones: formValue.observaciones || undefined
      };

      if (this.data.mode === 'create') {
        this.facturasService.create(facturaData).subscribe({
          next: (response) => {
            this.snackBar.open('Factura creada exitosamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(response.data);
          },
          error: (err) => {
            console.error('Error creating factura:', err);
            this.snackBar.open('Error al crear la factura', 'Cerrar', { duration: 3000 });
            this.loading.set(false);
          }
        });
      } else if (this.data.mode === 'edit' && this.data.factura) {
        this.facturasService.update(this.data.factura.id, facturaData).subscribe({
          next: (response) => {
            this.snackBar.open('Factura actualizada exitosamente', 'Cerrar', { duration: 3000 });
            this.dialogRef.close(response.data);
          },
          error: (err) => {
            console.error('Error updating factura:', err);
            this.snackBar.open('Error al actualizar la factura', 'Cerrar', { duration: 3000 });
            this.loading.set(false);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.form);
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  // Métodos para gestión de detalles
  addDetalle() {
    // Aquí se podría abrir un modal para agregar un detalle
    console.log('Add detalle');
  }

  editDetalle(detalle: FacturaDetalle) {
    console.log('Edit detalle', detalle);
  }

  removeDetalle(detalle: FacturaDetalle) {
    if (confirm('¿Está seguro de eliminar este detalle?')) {
      this.facturasService.removeDetalle(detalle.id).subscribe({
        next: () => {
          this.detalles.update(items => items.filter(d => d.id !== detalle.id));
          this.snackBar.open('Detalle eliminado', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error removing detalle:', err);
          this.snackBar.open('Error al eliminar el detalle', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  get dialogTitle(): string {
    switch (this.data.mode) {
      case 'create': return 'Nueva Factura';
      case 'edit': return 'Editar Factura';
      case 'view': return 'Detalle de Factura';
      default: return 'Factura';
    }
  }
}
