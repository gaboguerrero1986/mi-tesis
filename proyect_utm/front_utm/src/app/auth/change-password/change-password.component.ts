import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
    passwordForm: FormGroup;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {
        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    ngOnInit(): void {
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onSubmit(): void {
        if (this.passwordForm.valid) {
            this.loading = true;
            const { oldPassword, newPassword } = this.passwordForm.value;
            const currentUser = this.authService.getCurrentUser();

            if (currentUser && currentUser.id) {
                this.authService.changePassword(currentUser.id, oldPassword, newPassword).subscribe({
                    next: () => {
                        this.loading = false;
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada' });
                        // Update local user state
                        const updatedUser = { ...currentUser, mustChangePassword: false };
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

                        // Redirect based on role
                        if (currentUser.role === 'admin') this.router.navigate(['/admin']);
                        else if (currentUser.role === 'jury') this.router.navigate(['/jury']);
                        else this.router.navigate(['/student']);
                    },
                    error: (err: any) => {
                        this.loading = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.' });
                    }
                });
            }
        }
    }
}
