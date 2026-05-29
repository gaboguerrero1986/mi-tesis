import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { JurorService, Juror } from './juror.service';

export interface User {
  id: string | number;
  email?: string;
  username?: string;
  name?: string;
  role: 'admin' | 'jury' | 'student';
  isActive?: boolean;
  mustChangePassword?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private jurorService: JurorService) {
    const stored = localStorage.getItem('currentUser');
    if (stored) this.currentUserSubject.next(JSON.parse(stored));
  }

  login(credentials: any): Observable<any> {
    const role = credentials.role ?? (credentials.juryCode ? 'jury' : 'student');

    // Development / mock mode
    if (environment.useMocks || !this.baseUrl) {
      if (role === 'jury') {
        // Validate juror against stored jurors (added by admin)
        return of(null).pipe(
          delay(200),
          switchMap(() => {
            const valid = this.jurorService.validateJuror(credentials);
            if (!valid) {
              return throwError(() => ({ status: 401, message: 'Juror no registrado o credenciales inválidas' }));
            }
            const juror = valid as Juror;
            const user: User = { id: juror.id, email: juror.email, username: juror.username, role: 'jury' };
            const res = { user, token: 'mock-juror-token' };
            // persist
            localStorage.setItem('token', res.token);
            this.currentUserSubject.next(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return of(res);
          })
        );
      }

      // Students/externals: allow any email (no strict domain check)
      const mockUser: User = { id: Date.now(), email: credentials.email, username: credentials.username, role };
      const mockResponse = { user: mockUser, token: 'mock-token' };
      return of(mockResponse).pipe(
        delay(200),
        tap(res => {
          const user = res?.user ?? res;
          if (res?.token) localStorage.setItem('token', res.token);
          if (user) {
            this.currentUserSubject.next(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
        })
      );
    }

    // Real backend
    const endpoint = role === 'student' ? `${this.baseUrl}/auth/student-login` : `${this.baseUrl}/auth/login`;

    return this.http.post<any>(endpoint, credentials).pipe(
      tap(res => {
        const user = res?.user ?? res;
        if (res?.access_token) localStorage.setItem('token', res.access_token);
        if (user) {
          // Merge mustChangePassword from response if present
          if (res.mustChangePassword) {
            user.mustChangePassword = true;
          }
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }
  changePassword(id: string | number, oldPass: string, newPass: string): Observable<any> {
    if (environment.useMocks || !this.baseUrl) {
      return of(true).pipe(delay(500));
    }
    return this.http.post(`${this.baseUrl}/users/${id}/change-password`, {
      oldPassword: oldPass,
      newPassword: newPass
    });
  }
}