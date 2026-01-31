import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-horarios-list',
    imports: [CommonModule, MatCardModule, MatIconModule],
    templateUrl: './horarios-list.component.html',
    styleUrl: './horarios-list.component.scss'
})
export class HorariosListComponent {

}
