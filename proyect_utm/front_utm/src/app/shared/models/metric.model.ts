export interface Metrica {
  id?: number;
  evento_id?: string;
  nombre: string;
  peso_porcentual: number;
  rol_evaluador?: string;
  submetricas?: Submetrica[];
}

export interface Submetrica {
  id?: number;
  metrica_id?: number;
  nombre: string;
}