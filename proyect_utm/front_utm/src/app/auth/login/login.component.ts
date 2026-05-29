import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  selectedRole: string | null = null;
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['student']
    });
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.loginForm.get('role')?.setValue(role);
    
    const passwordControl = this.loginForm.get('password');
    if (role === 'student') {
      passwordControl?.clearValidators();
      passwordControl?.setValue('');
    } else {
      passwordControl?.setValidators(Validators.required);
    }
    passwordControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.messageService.add({ severity: 'warn', summary: 'Formulario', detail: 'Formulario inválido' });
      return;
    }
    const credentials = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        const user = res?.user ?? res;
        if (!user) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Respuesta inválida del servidor' });
          return;
        }
        if (user.mustChangePassword) {
          this.router.navigate(['/auth/change-password']);
          this.messageService.add({ severity: 'info', summary: 'Seguridad', detail: 'Debes cambiar tu contraseña temporal' });
          return;
        }
        if (user.role === 'admin' || user.role === 'manager') this.router.navigate(['/admin']);
        else if (user.role === 'jury') this.router.navigate(['/jury']);
        else this.router.navigate(['/student']);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Login exitoso' });
      },
      error: (err: any) => {
        const detail = err?.error?.message || err?.message || 'Credenciales incorrectas';
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
      }
    });
  }
}