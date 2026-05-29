import { JuradoEvento, Inscripcion } from './event.model';
import { Submetrica } from './metric.model';

export interface Evaluacion {
  id: string;
  jurado_id: string;
  jurado?: JuradoEvento;
  inscripcion_id: string;
  inscripcion?: Inscripcion;
  detalles?: DetalleEvaluacion[];
  creado_at?: Date;
}

export interface DetalleEvaluacion {
  id?: string;
  evaluacion_id?: string;
  submetrica_id: number;
  submetrica?: Submetrica;
  puntaje_asignado: number;
}

export interface EvaluationSummary {
  eventId: string;
  totalEvaluations: number;
  averageScore: number;
  metricAverages: { [metricId: string]: number };
  sentimentAnalysis: SentimentAnalysis;
  commonThemes: string[];
}

export interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  overallSentiment: 'positive' | 'negative' | 'neutral';
}