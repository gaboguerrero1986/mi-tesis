import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private messageService: MessageService) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const user = await firstValueFrom(this.auth.currentUser$.pipe(first()));
    const requiredRole = route.data?.['role'];
    const requiredRoles = route.data?.['roles'] as string[];

    if (!user) {
      this.messageService.add({ severity: 'warn', summary: 'Autenticación', detail: 'Debes iniciar sesión' });
      await this.router.navigate(['/auth/login']);
      return false;
    }

    const userRole = (user as any).role;
    let hasRole = true;

    if (requiredRoles && requiredRoles.length > 0) {
      hasRole = requiredRoles.includes(userRole);
    } else if (requiredRole) {
      hasRole = userRole === requiredRole;
    }

    if (!hasRole) {
      this.messageService.add({ severity: 'error', summary: 'Permiso', detail: 'No autorizado' });
      await this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}