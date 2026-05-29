import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Juror model used in mock mode. In production the backend should define the model
 * (ids, email, username, password is stored/validated server-side, never in plain text).
 */
export interface Juror {
  id: any;
  email?: string;
  username?: string;
  password?: string; // stored in plain text only for mock; production must NOT store plain passwords
  name?: string;
}

const STORAGE_KEY = 'jurors_v1';

@Injectable({ providedIn: 'root' })
export class JurorService {
  private apiBase = environment.apiUrl || '';

  constructor(private http: HttpClient) {
    // Initialize storage only when in mock mode
    if (environment.useMocks) {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }

  // --- Mock helpers (localStorage) ---
  private readAllMock(): Juror[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Juror[]) : [];
    } catch {
      return [];
    }
  }

  private writeAllMock(jurors: Juror[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jurors));
  }

  // --- Public API ---
  /**
   * Get all jurors. In prod this calls GET /api/jurors
   */
  getAll(): import('rxjs').Observable<Juror[]> {
    if (environment.useMocks || !this.apiBase) {
      return of(this.readAllMock());
    }
    return this.http.get<any[]>(`${this.apiBase}/users?role=jury`).pipe(
      map(users => users.map(u => ({
        id: u.id,
        email: u.correo,
        username: u.usuario,
        name: u.persona ? u.persona.nombres : ''
      })))
    );
  }

  /**
   * Add a juror. In prod this should POST to /api/jurors with {email, username, password}
   */
  addJuror(j: Omit<Juror, 'id'>): Juror | import('rxjs').Observable<Juror> {
    if (environment.useMocks || !this.apiBase) {
      const jurors = this.readAllMock();
      const id = Date.now();
      const juror: Juror = { id, ...j };
      jurors.push(juror);
      this.writeAllMock(jurors);
      return juror;
    }
    return this.http.post<Juror>(`${this.apiBase}/users`, {
      usuarioData: {
        correo: j.email,
        usuario: j.username,
        rol_sistema: 'jury'
      },
      personaData: {
        nombres: j.name,
        apellidos: ''
      }
    });
  }

  /**
   * Remove juror by id. In prod this should call DELETE /api/jurors/:id
   */
  removeJuror(id: any): boolean | import('rxjs').Observable<any> {
    if (environment.useMocks || !this.apiBase) {
      const jurors = this.readAllMock();
      const next = jurors.filter(j => j.id !== id);
      this.writeAllMock(next);
      return next.length < jurors.length;
    }
    return this.http.delete(`${this.apiBase}/users/${id}`);
  }

  /**
   * Update juror by id. In prod this should call PUT /api/jurors/:id
   */
  updateJuror(id: any, patch: Partial<Juror>): Juror | import('rxjs').Observable<Juror> {
    if (environment.useMocks || !this.apiBase) {
      const jurors = this.readAllMock();
      const idx = jurors.findIndex(j => j.id === id);
      if (idx === -1) return null as any;
      const updated = { ...jurors[idx], ...patch } as Juror;
      jurors[idx] = updated;
      this.writeAllMock(jurors);
      return updated;
    }
    return this.http.post<Juror>(`${this.apiBase}/users/${id}`, {
      usuarioData: {
        correo: patch.email,
        usuario: patch.username
      },
      personaData: {
        nombres: patch.name
      }
    });
  }

  findByEmail(email?: string): Juror | undefined {
    if (!email) return undefined;
    if (environment.useMocks || !this.apiBase) {
      return this.readAllMock().find(j => j.email?.toLowerCase() === email.toLowerCase());
    }
    // In production you would call an API, but for privacy don't expose find-by-email endpoint publicly.
    return undefined;
  }

  findByUsername(username?: string): Juror | undefined {
    if (!username) return undefined;
    if (environment.useMocks || !this.apiBase) {
      return this.readAllMock().find(j => j.username?.toLowerCase() === username.toLowerCase());
    }
    return undefined;
  }

  /**
   * Validate juror credentials.
   * In mock mode this checks username/email + password against localStorage.
   * In production the backend must expose POST /api/jurors/validate (or use auth/login) which returns user+token.
   */
  validateJuror(credentials: any): Juror | null {
    if (environment.useMocks || !this.apiBase) {
      const { username, email, password } = credentials;
      if (username && password) {
        const j = this.findByUsername(username);
        if (j && j.password === password) return j;
      }
      if (email && password) {
        const j = this.findByEmail(email);
        if (j && j.password === password) return j;
      }
      return null;
    }

    // Production: not validating client-side. The backend should validate and return the juror.
    return null;
  }
  resetPassword(id: any): any {
    if (environment.useMocks || !this.apiBase) {
      return Promise.resolve(true); // Mock success
    }
    return this.http.post(`${this.apiBase}/users/${id}/reset-password`, {});
  }
}
