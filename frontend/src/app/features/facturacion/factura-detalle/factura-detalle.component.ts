import { Component, OnInit, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FacturasService } from '../../../core/services/facturas.service';
import { Factura, FacturaDetalle, ObraSocial, PeriodoFacturacion } from '../../../shared/models/entities.model';

export interface FacturaDetalleDialogData {
  factura: Factura;
}

@Component({
  selector: 'app-factura-detalle',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './factura-detalle.component.html',
  styleUrl: './factura-detalle.component.scss'
})
export class FacturaDetalleComponent implements OnInit {
  detalles = signal<FacturaDetalle[]>([]);
  loading = signal(true);
  displayedColumns: string[] = ['descripcion', 'paciente', 'cantidad', 'precio_unitario', 'subtotal'];

  constructor(
    private facturasService: FacturasService,
    public dialogRef: MatDialogRef<FacturaDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FacturaDetalleDialogData
  ) {}

  ngOnInit() {
    this.loadDetalles();
  }

  loadDetalles() {
    this.facturasService.getDetalles(this.data.factura.id).subscribe({
      next: (response) => {
        this.detalles.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading detalles:', err);
        // 🔶 MOCK: Fallback - Detalles de factura de desarrollo
        this.detalles.set([
          { 
            id: '1', 
            factura_id: this.data.factura.id, 
            descripcion: 'Traslado escolar - Enero 2026', 
            cantidad: 20, 
            precio_unitario: 5000, 
            subtotal: 100000,
            created_at: '', 
            updated_at: '' 
          },
          { 
            id: '2', 
            factura_id: this.data.factura.id, 
            descripcion: 'Traslado terapia - Enero 2026', 
            cantidad: 8, 
            precio_unitario: 6500, 
            subtotal: 52000,
            created_at: '', 
            updated_at: '' 
          },
          { 
            id: '3', 
            factura_id: this.data.factura.id, 
            descripcion: 'Traslado CET - Enero 2026', 
            cantidad: 12, 
            precio_unitario: 7200, 
            subtotal: 86400,
            created_at: '', 
            updated_at: '' 
          }
        ]);
        this.loading.set(false);
      }
    });
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'emitida': return 'primary';
      case 'borrador': return 'accent';
      case 'pagada': return 'primary';
      case 'anulada': return 'warn';
      default: return '';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'emitida': return 'Emitida';
      case 'borrador': return 'Borrador';
      case 'pagada': return 'Pagada';
      case 'anulada': return 'Anulada';
      case 'enviada': return 'Enviada';
      default: return estado;
    }
  }

  formatPeriodo(periodo?: PeriodoFacturacion): string {
    if (!periodo) return 'N/A';
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[periodo.mes - 1]} ${periodo.anio}`;
  }

  onClose() {
    this.dialogRef.close();
  }

  onEdit() {
    this.dialogRef.close({ action: 'edit', factura: this.data.factura });
  }

  onPrint() {
    window.print();
  }

  getTotalDetalles(): number {
    return this.detalles().reduce((sum, d) => sum + d.subtotal, 0);
  }
}
