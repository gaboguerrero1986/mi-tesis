import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Manager {
  id: any;
  email?: string;
  username?: string;
  password?: string;
  name?: string;
}

const STORAGE_KEY = 'managers_v1';

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private apiBase = environment.apiUrl || '';

  constructor(private http: HttpClient) {
    if (environment.useMocks) {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }

  private readAllMock(): Manager[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Manager[]) : [];
    } catch {
      return [];
    }
  }

  private writeAllMock(managers: Manager[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(managers));
  }

  getAll(): import('rxjs').Observable<Manager[]> {
    if (environment.useMocks || !this.apiBase) {
      return of(this.readAllMock());
    }
    return this.http.get<any[]>(`${this.apiBase}/users?role=manager`).pipe(
      map(users => users.map(u => ({
        id: u.id,
        email: u.correo,
        username: u.usuario,
        name: u.persona ? u.persona.nombres : ''
      })))
    );
  }

  addManager(j: Omit<Manager, 'id'>): Manager | import('rxjs').Observable<Manager> {
    if (environment.useMocks || !this.apiBase) {
      const managers = this.readAllMock();
      const id = Date.now();
      const manager: Manager = { id, ...j };
      managers.push(manager);
      this.writeAllMock(managers);
      return manager;
    }
    return this.http.post<Manager>(`${this.apiBase}/users`, {
      usuarioData: {
        correo: j.email,
        usuario: j.username,
        rol_sistema: 'manager'
      },
      personaData: {
        nombres: j.name,
        apellidos: ''
      }
    });
  }

  removeManager(id: any): boolean | import('rxjs').Observable<any> {
    if (environment.useMocks || !this.apiBase) {
      const managers = this.readAllMock();
      const next = managers.filter(j => j.id !== id);
      this.writeAllMock(next);
      return next.length < managers.length;
    }
    return this.http.delete(`${this.apiBase}/users/${id}`);
  }

  updateManager(id: any, patch: Partial<Manager>): Manager | import('rxjs').Observable<Manager> {
    if (environment.useMocks || !this.apiBase) {
      const managers = this.readAllMock();
      const idx = managers.findIndex(j => j.id === id);
      if (idx === -1) return null as any;
      const updated = { ...managers[idx], ...patch } as Manager;
      managers[idx] = updated;
      this.writeAllMock(managers);
      return updated;
    }
    return this.http.post<Manager>(`${this.apiBase}/users/${id}`, {
      usuarioData: {
        correo: patch.email,
        usuario: patch.username
      },
      personaData: {
        nombres: patch.name
      }
    });
  }

  resetPassword(id: any): any {
    if (environment.useMocks || !this.apiBase) {
      return Promise.resolve(true);
    }
    return this.http.post(`${this.apiBase}/users/${id}/reset-password`, {});
  }
}
