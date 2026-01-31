import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-cobranza-list',
    imports: [CommonModule, MatCardModule, MatIconModule],
    templateUrl: './cobranza-list.component.html',
    styleUrl: './cobranza-list.component.scss'
})
export class CobranzaListComponent {

}
