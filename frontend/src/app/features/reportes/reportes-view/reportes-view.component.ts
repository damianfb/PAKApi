import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-reportes-view',
    imports: [CommonModule, MatCardModule, MatIconModule],
    templateUrl: './reportes-view.component.html',
    styleUrl: './reportes-view.component.scss'
})
export class ReportesViewComponent {

}
