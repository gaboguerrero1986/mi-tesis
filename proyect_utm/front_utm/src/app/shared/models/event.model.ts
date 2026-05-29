import { Persona, Usuario } from './user.model';
import { Metrica } from './metric.model';

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  modalidad_evaluacion?: string;
  responsable_id?: string;
  inscripciones?: Inscripcion[];
  metricas?: Metrica[];
  jurados?: JuradoEvento[];
  creado_at?: Date;
}

export interface Inscripcion {
  id: string;
  evento_id: string;
  tipo_inscripcion: 'individual' | 'grupal';
  nombre_equipo?: string;
  descripcion?: string;
  integrantes?: IntegranteInscripcion[];
}

export interface IntegranteInscripcion {
  id: number;
  inscripcion_id: string;
  persona_id: string;
  persona?: Persona;
}

export interface JuradoEvento {
  id: string;
  evento_id: string;
  usuario_id: string;
  usuario?: Usuario;
}