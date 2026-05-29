export interface Persona {
  id: string;
  nombres: string;
  apellidos: string;
  identificacion?: string;
  carrera_id?: number;
}

export interface Usuario {
  id: string;
  persona_id: string;
  persona?: Persona;
  usuario: string;
  correo: string;
  rol_sistema: 'admin' | 'jury' | 'student';
}