import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cobranza {
  id: number;
  facturaNum: string;
  obraSocial: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  monto: number;
  montoPagado: number;
  saldo: number;
  comision: number;
  estado: 'pendiente' | 'pagado' | 'parcial' | 'vencido';
}

@Component({
    selector: 'app-cobranza-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './cobranza-list.component.html',
    styleUrl: './cobranza-list.component.scss'
})
export class CobranzaListComponent implements OnInit {
  cobranzas = signal<Cobranza[]>([]);
  loading = signal(false);
  
  // Filters
  selectedPeriodo = 'Enero 2025';
  selectedObraSocial = 'todos';
  selectedEstado = 'todos';
  searchTerm = '';
  
  // Stats
  totalACobrar = 1321840;
  cobradoMes = 523480;
  pendienteCobro = 798360;
  comisionesGeneradas = 15705;
  
  periodos = ['Enero 2025', 'Diciembre 2024', 'Noviembre 2024', 'Todos los períodos'];
  obrasSociales = ['OSECAC', 'OSMATA', 'OSPSA', 'PASTELEROS', 'SWISS MEDICAL'];

  ngOnInit() {
    this.loadCobranzas();
  }

  loadCobranzas() {
    this.cobranzas.set([
      { id: 1, facturaNum: '0004-00001761', obraSocial: 'OSECAC', fechaEmision: new Date('2025-01-20'), fechaVencimiento: new Date('2025-02-20'), monto: 322843, montoPagado: 0, saldo: 322843, comision: 0, estado: 'pendiente' },
      { id: 2, facturaNum: '0004-00001760', obraSocial: 'OSMATA', fechaEmision: new Date('2025-01-18'), fechaVencimiento: new Date('2025-02-18'), monto: 215000, montoPagado: 215000, saldo: 0, comision: 6450, estado: 'pagado' },
      { id: 3, facturaNum: '0004-00001759', obraSocial: 'OSPSA', fechaEmision: new Date('2025-01-15'), fechaVencimiento: new Date('2025-02-15'), monto: 178450, montoPagado: 100000, saldo: 78450, comision: 3000, estado: 'parcial' },
      { id: 4, facturaNum: '0004-00001758', obraSocial: 'OSECAC', fechaEmision: new Date('2024-12-12'), fechaVencimiento: new Date('2025-01-12'), monto: 267890, montoPagado: 0, saldo: 267890, comision: 0, estado: 'vencido' },
      { id: 5, facturaNum: '0004-00001757', obraSocial: 'SWISS MEDICAL', fechaEmision: new Date('2025-01-10'), fechaVencimiento: new Date('2025-02-10'), monto: 133590, montoPagado: 133590, saldo: 0, comision: 4007, estado: 'pagado' },
      { id: 6, facturaNum: '0004-00001756', obraSocial: 'PASTELEROS', fechaEmision: new Date('2024-11-08'), fechaVencimiento: new Date('2024-12-08'), monto: 89120, montoPagado: 0, saldo: 89120, comision: 0, estado: 'vencido' },
      { id: 7, facturaNum: '0004-00001755', obraSocial: 'OSMATA', fechaEmision: new Date('2025-01-05'), fechaVencimiento: new Date('2025-02-05'), monto: 312450, montoPagado: 312450, saldo: 0, comision: 9373, estado: 'pagado' },
      { id: 8, facturaNum: '0004-00001754', obraSocial: 'OSECAC', fechaEmision: new Date('2025-01-03'), fechaVencimiento: new Date('2025-02-03'), monto: 178977, montoPagado: 0, saldo: 178977, comision: 0, estado: 'pendiente' }
    ]);
  }

  get filteredCobranzas(): Cobranza[] {
    return this.cobranzas().filter(c => {
      const matchObraSocial = this.selectedObraSocial === 'todos' || 
        c.obraSocial.toLowerCase() === this.selectedObraSocial.toLowerCase();
      
      const matchEstado = this.selectedEstado === 'todos' || c.estado === this.selectedEstado;
      
      const matchSearch = this.searchTerm === '' || 
        c.facturaNum.includes(this.searchTerm);
      
      return matchObraSocial && matchEstado && matchSearch;
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'pagado': return 'badge badge-success';
      case 'pendiente': return 'badge badge-warning';
      case 'parcial': return 'badge badge-info';
      case 'vencido': return 'badge badge-danger';
      default: return 'badge badge-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'pagado': return 'Pagado';
      case 'pendiente': return 'Pendiente';
      case 'parcial': return 'Pago Parcial';
      case 'vencido': return 'Vencido';
      default: return estado;
    }
  }

  openNewPagoModal() {
    console.log('Open new pago modal');
  }

  viewCobranza(cobranza: Cobranza) {
    console.log('View cobranza', cobranza);
  }

  registrarPago(cobranza: Cobranza) {
    console.log('Registrar pago', cobranza);
  }

  exportData() {
    console.log('Export data');
  }
}

