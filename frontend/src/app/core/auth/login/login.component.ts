import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async onSubmit() {
    if (!this.email() || !this.password()) {
      this.snackBar.open('Por favor complete todos los campos', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.loading.set(true);
    const result = await this.authService.signIn(this.email(), this.password());
    this.loading.set(false);

    if (result.success) {
      this.snackBar.open('Inicio de sesión exitoso', 'Cerrar', {
        duration: 3000
      });
      this.router.navigate(['/dashboard']);
    } else {
      this.snackBar.open(`Error: ${result.error}`, 'Cerrar', {
        duration: 5000
      });
    }
  }
}
