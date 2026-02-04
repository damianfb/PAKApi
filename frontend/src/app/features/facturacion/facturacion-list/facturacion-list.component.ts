import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Factura {
  id: number;
  numero: string;
  fecha: Date;
  obraSocial: string;
  cuit: string;
  cantidad: number;
  monto: number;
  cae: string;
  estado: 'emitida' | 'pendiente' | 'anulada';
}

@Component({
    selector: 'app-facturacion-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './facturacion-list.component.html',
    styleUrl: './facturacion-list.component.scss'
})
export class FacturacionListComponent implements OnInit {
  facturas = signal<Factura[]>([]);
  loading = signal(false);
  
  // Filters
  selectedPeriodo = 'Enero 2025';
  selectedObraSocial = 'todos';
  selectedEstado = 'todos';
  searchTerm = '';
  
  // Stats
  totalFacturado = 1845320;
  facturasEmitidas = 24;
  pendientesAfip = 3;
  promedioFactura = 76888;
  
  periodos = ['Enero 2025', 'Diciembre 2024', 'Noviembre 2024', 'Octubre 2024'];
  obrasSociales = ['OSECAC', 'OSMATA', 'OSPSA', 'PASTELEROS', 'SWISS MEDICAL'];

  ngOnInit() {
    this.loadFacturas();
  }

  loadFacturas() {
    // Mock data
    this.facturas.set([
      { id: 1, numero: '0004-00001761', fecha: new Date('2025-01-20'), obraSocial: 'OSECAC', cuit: '30-54512345-6', cantidad: 8, monto: 322843, cae: '75123456789012', estado: 'emitida' },
      { id: 2, numero: '0004-00001760', fecha: new Date('2025-01-18'), obraSocial: 'OSMATA', cuit: '30-54567890-1', cantidad: 5, monto: 215000, cae: '75123456789013', estado: 'emitida' },
      { id: 3, numero: '0004-00001759', fecha: new Date('2025-01-15'), obraSocial: 'OSPSA', cuit: '30-54678901-2', cantidad: 4, monto: 178450, cae: '', estado: 'pendiente' },
      { id: 4, numero: '0004-00001758', fecha: new Date('2025-01-12'), obraSocial: 'OSECAC', cuit: '30-54512345-6', cantidad: 6, monto: 267890, cae: '75123456789014', estado: 'emitida' },
      { id: 5, numero: '0004-00001757', fecha: new Date('2025-01-10'), obraSocial: 'SWISS MEDICAL', cuit: '30-54789012-3', cantidad: 3, monto: 133590, cae: '75123456789015', estado: 'emitida' },
      { id: 6, numero: '0004-00001756', fecha: new Date('2025-01-08'), obraSocial: 'PASTELEROS', cuit: '30-54890123-4', cantidad: 2, monto: 89120, cae: '', estado: 'pendiente' },
      { id: 7, numero: '0004-00001755', fecha: new Date('2025-01-05'), obraSocial: 'OSMATA', cuit: '30-54567890-1', cantidad: 7, monto: 312450, cae: '75123456789016', estado: 'emitida' },
      { id: 8, numero: '0004-00001754', fecha: new Date('2025-01-03'), obraSocial: 'OSECAC', cuit: '30-54512345-6', cantidad: 4, monto: 178977, cae: '', estado: 'pendiente' }
    ]);
  }

  get filteredFacturas(): Factura[] {
    return this.facturas().filter(f => {
      const matchObraSocial = this.selectedObraSocial === 'todos' || 
        f.obraSocial.toLowerCase() === this.selectedObraSocial.toLowerCase();
      
      const matchEstado = this.selectedEstado === 'todos' || f.estado === this.selectedEstado;
      
      const matchSearch = this.searchTerm === '' || 
        f.numero.includes(this.searchTerm) || 
        f.cuit.includes(this.searchTerm);
      
      return matchObraSocial && matchEstado && matchSearch;
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'emitida': return 'badge badge-success';
      case 'pendiente': return 'badge badge-warning';
      case 'anulada': return 'badge badge-danger';
      default: return 'badge badge-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'emitida': return 'Emitida';
      case 'pendiente': return 'Pendiente AFIP';
      case 'anulada': return 'Anulada';
      default: return estado;
    }
  }

  openNewFacturaModal() {
    console.log('Open new factura modal');
  }

  viewFactura(factura: Factura) {
    console.log('View factura', factura);
  }

  downloadPdf(factura: Factura) {
    console.log('Download PDF', factura);
  }

  exportData() {
    console.log('Export data');
  }
}

