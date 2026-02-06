import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.snackBar.open('Por favor complete todos los campos', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    if (this.password.length < 6) {
      this.snackBar.open('La contraseña debe tener al menos 6 caracteres', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.loading.set(true);
    
    try {
      await this.authService.signUp(this.email, this.password);
      this.snackBar.open('Cuenta creada exitosamente. Revisa tu correo para confirmar.', 'Cerrar', {
        duration: 5000
      });
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Error al crear la cuenta',
        'Cerrar',
        { duration: 3000 }
      );
    } finally {
      this.loading.set(false);
    }
  }
}
