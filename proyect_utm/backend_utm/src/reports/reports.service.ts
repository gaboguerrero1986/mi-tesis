import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluacion } from '../evaluations/evaluacion.entity';
import { Inscripcion } from '../events/inscripcion.entity';
import { Evento } from '../events/evento.entity';

import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Evaluacion)
        private evaluacionesRepository: Repository<Evaluacion>,
        @InjectRepository(Inscripcion)
        private inscripcionesRepository: Repository<Inscripcion>,
        @InjectRepository(Evento)
        private eventsRepository: Repository<Evento>,
        private dataSource: DataSource
    ) { }

    async getEventRanking(eventId: string): Promise<any> {
        // Obtenemos los ganadores o el ranking actual usando la vista SQL pre-calculada
        const ranking = await this.dataSource.query(
            `SELECT ev.titulo as evento, 
                    COALESCE(ins.nombre_equipo, p.nombres || ' ' || p.apellidos) as proyecto_o_participante, 
                    ins.tipo_inscripcion,
                    ROUND(SUM(pm.avg_m * pm.peso_porcentual) / 100, 2) as nota_final,
                    MAX(evals.total_evaluaciones) as total_evaluaciones
             FROM (
                 SELECT e.inscripcion_id, m.peso_porcentual, AVG(de.puntaje_asignado) as avg_m 
                 FROM esq_evaluaciones e 
                 JOIN esq_detalles_evaluacion de ON e.id = de.evaluacion_id 
                 JOIN esq_metricas m ON de.metrica_id = m.id 
                 GROUP BY 1, m.id
             ) pm 
             JOIN esq_inscripciones ins ON pm.inscripcion_id = ins.id 
             LEFT JOIN (
                 SELECT inscripcion_id, COUNT(DISTINCT id) as total_evaluaciones
                 FROM esq_evaluaciones
                 GROUP BY 1
             ) evals ON ins.id = evals.inscripcion_id
             LEFT JOIN esq_integrantes_inscripcion ii ON ins.id = ii.inscripcion_id AND ins.tipo_inscripcion = 'individual'
             LEFT JOIN esq_personas p ON ii.persona_id = p.id
             JOIN esq_eventos ev ON ins.evento_id = ev.id 
             WHERE ev.id = $1 AND ins.id IS NOT NULL
             GROUP BY 1, 2, 3 ORDER BY 4 DESC`,
             [eventId]
        );

        // Calculate BI stats (Average, Max, Min)
        const totalParticipants = ranking.length;
        let highestScore = 0;
        let lowestScore = 100;
        let sumScores = 0;

        ranking.forEach((r: any, index: number) => {
            const score = Number(r.nota_final);
            r.rank = index + 1; // Assign rank
            if (score > highestScore) highestScore = score;
            if (score < lowestScore) lowestScore = score;
            sumScores += score;
        });

        const averageScore = totalParticipants > 0 ? (sumScores / totalParticipants).toFixed(2) : 0;

        const allParticipants = ranking.map((r: any) => ({
            name: r.proyecto_o_participante,
            averageScore: Number(r.nota_final),
            evaluationCount: Number(r.total_evaluaciones) || 0,
            rank: r.rank
        }));

        const winners = allParticipants.filter((p: any) => p.rank <= 3);

        return {
            winners,
            allParticipants,
            ranking,
            biStats: {
                totalParticipants,
                highestScore,
                lowestScore: totalParticipants > 0 ? lowestScore : 0,
                averageScore
            }
        };
    }

    async getReport(eventId: string): Promise<any> {
        // Análisis de la evaluación del evento hecha por los ESTUDIANTES
        const metricasEstudiantes = await this.dataSource.query(
            `SELECT 
                m.nombre as metrica,
                COUNT(DISTINCT e.id) as total_estudiantes,
                ROUND(AVG(de.puntaje_asignado), 2) as puntaje_promedio,
                MAX(de.puntaje_asignado) as puntaje_maximo,
                MIN(de.puntaje_asignado) as puntaje_minimo
             FROM esq_evaluaciones e
             JOIN esq_detalles_evaluacion de ON e.id = de.evaluacion_id
             JOIN esq_metricas m ON de.metrica_id = m.id
             WHERE e.evento_id = $1 AND m.rol_evaluador = 'student'
             GROUP BY m.nombre`,
             [eventId]
        );

        let totalEstudiantes = 0;
        let puntajeGlobal = 0;

        if (metricasEstudiantes.length > 0) {
            totalEstudiantes = Number(metricasEstudiantes[0].total_estudiantes);
            const sum = metricasEstudiantes.reduce((acc: number, curr: any) => acc + Number(curr.puntaje_promedio), 0);
            puntajeGlobal = Number((sum / metricasEstudiantes.length).toFixed(2));
        }

        const comentarios = await this.dataSource.query(
            `SELECT DISTINCT e.id, e.comentarios, e.creado_at
             FROM esq_evaluaciones e
             JOIN esq_detalles_evaluacion de ON e.id = de.evaluacion_id
             JOIN esq_metricas m ON de.metrica_id = m.id
             WHERE e.evento_id = $1 AND m.rol_evaluador = 'student' AND e.comentarios IS NOT NULL AND TRIM(e.comentarios) != ''
             ORDER BY e.creado_at DESC`,
             [eventId]
        );

        return {
            isBiReport: true,
            data: {
                metricas: metricasEstudiantes,
                comentarios: comentarios,
                biStats: {
                    totalEvaluadores: totalEstudiantes,
                    puntajeGlobal: puntajeGlobal
                }
            }
        };
    }

    async getJurorProgress(eventId: string): Promise<any[]> {
        return [];
    }
}
