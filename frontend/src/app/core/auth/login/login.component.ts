import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatSnackBarModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  loading = signal(false);
  showPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

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
