import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
    selector: 'app-main-layout',
    imports: [
        CommonModule,
        RouterOutlet,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        HeaderComponent,
        SidebarComponent
    ],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  sidenavOpened = signal(true);

  toggleSidenav() {
    this.sidenavOpened.set(!this.sidenavOpened());
  }
}
