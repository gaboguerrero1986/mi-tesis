CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Identidad y Académico
CREATE TABLE esq_facultades (id SERIAL PRIMARY KEY, nombre VARCHAR(150));
CREATE TABLE esq_carreras (id SERIAL PRIMARY KEY, facultad_id INTEGER REFERENCES esq_facultades(id), nombre VARCHAR(150));
CREATE TABLE esq_personas (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), nombres VARCHAR(100), apellidos VARCHAR(100), identificacion VARCHAR(20) UNIQUE, carrera_id INTEGER REFERENCES esq_carreras(id), creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE esq_usuarios (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), persona_id uuid REFERENCES esq_personas(id) ON DELETE CASCADE, usuario VARCHAR(50) UNIQUE, correo VARCHAR(150) UNIQUE, password_hash VARCHAR(255), rol_sistema VARCHAR(20), creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- EAV (Parámetros Dinámicos)
CREATE TABLE esq_tabla_maestra (id SERIAL PRIMARY KEY, nombre_entidad VARCHAR(100) UNIQUE);
CREATE TABLE esq_parametros (id SERIAL PRIMARY KEY, entidad_id INTEGER REFERENCES esq_tabla_maestra(id), codigo_parametro SERIAL, descripcion VARCHAR(150), tipo_dato VARCHAR(20), is_active BOOLEAN DEFAULT true);
CREATE TABLE esq_ejecucion_parametros (id SERIAL PRIMARY KEY, parametro_id INTEGER REFERENCES esq_parametros(id), registro_id uuid NOT NULL, valor_texto TEXT, valor_numerico NUMERIC);

-- Índices de Rendimiento
CREATE INDEX idx_eav_registro ON esq_ejecucion_parametros(registro_id);

-- Eventos y Evaluación
CREATE TABLE esq_eventos (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), titulo VARCHAR(200), descripcion TEXT, estado VARCHAR(20), fecha_inicio TIMESTAMP, fecha_fin TIMESTAMP, modalidad_evaluacion VARCHAR(50) DEFAULT 'individual', responsable_id uuid REFERENCES esq_usuarios(id), creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, eliminado_at TIMESTAMP);
CREATE TABLE esq_inscripciones (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), evento_id uuid REFERENCES esq_eventos(id), tipo_inscripcion VARCHAR(20) DEFAULT 'individual', nombre_equipo VARCHAR(150), descripcion TEXT, creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE esq_integrantes_inscripcion (id SERIAL PRIMARY KEY, inscripcion_id uuid REFERENCES esq_inscripciones(id) ON DELETE CASCADE, persona_id uuid REFERENCES esq_personas(id) ON DELETE CASCADE);
CREATE TABLE esq_metricas (id SERIAL PRIMARY KEY, evento_id uuid REFERENCES esq_eventos(id), nombre VARCHAR(100), peso_porcentual NUMERIC(5,2), rol_evaluador VARCHAR(20) DEFAULT 'jury');
CREATE TABLE esq_submetricas (id SERIAL PRIMARY KEY, metrica_id INTEGER REFERENCES esq_metricas(id), nombre VARCHAR(150));
CREATE TABLE esq_jurados_evento (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), evento_id uuid REFERENCES esq_eventos(id), usuario_id uuid REFERENCES esq_usuarios(id));
CREATE TABLE esq_evaluaciones (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), evento_id uuid REFERENCES esq_eventos(id), jurado_id uuid REFERENCES esq_jurados_evento(id), inscripcion_id uuid REFERENCES esq_inscripciones(id), creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE esq_detalles_evaluacion (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), evaluacion_id uuid REFERENCES esq_evaluaciones(id), metrica_id INTEGER REFERENCES esq_metricas(id), puntaje_asignado NUMERIC(5,2));
CREATE TABLE esq_logs_sistema (id BIGSERIAL PRIMARY KEY, usuario_id uuid REFERENCES esq_usuarios(id), accion VARCHAR(100), descripcion TEXT, fecha TIMESTAMP DEFAULT NOW());

-- 1. Vista de Parámetros Dinámicos (Aplana el modelo EAV)
CREATE OR REPLACE VIEW esq_vista_parametros_detallados AS
SELECT 
    tm.nombre_entidad AS tipo,
    COALESCE(ev.titulo, ins.nombre_equipo, p.nombres) AS nombre_registro,
    pa.descripcion AS parametro,
    COALESCE(ej.valor_texto, ej.valor_numerico::text) AS valor
FROM esq_ejecucion_parametros ej
JOIN esq_parametros pa ON ej.parametro_id = pa.id
JOIN esq_tabla_maestra tm ON pa.entidad_id = tm.id
LEFT JOIN esq_eventos ev ON ej.registro_id = ev.id
LEFT JOIN esq_inscripciones ins ON ej.registro_id = ins.id
LEFT JOIN esq_personas p ON ej.registro_id = p.id;

-- 2. Vista de Ranking Final (Lógica de Baremo)
CREATE VIEW esq_vista_ranking_final AS
WITH prom_sub AS (
    SELECT e.inscripcion_id, de.submetrica_id, AVG(de.puntaje_asignado) as avg_s 
    FROM esq_evaluaciones e JOIN esq_detalles_evaluacion de ON e.id = de.evaluacion_id GROUP BY 1, 2
),
prom_met AS (
    SELECT ps.inscripcion_id, m.peso_porcentual, AVG(ps.avg_s) as avg_m 
    FROM prom_sub ps JOIN esq_submetricas s ON ps.submetrica_id = s.id JOIN esq_metricas m ON s.metrica_id = m.id GROUP BY 1, m.id
)
SELECT ev.titulo as evento, 
       COALESCE(ins.nombre_equipo, p.nombres || ' ' || p.apellidos) as proyecto_o_participante, 
       ins.tipo_inscripcion,
       ROUND(SUM(pm.avg_m * pm.peso_porcentual), 2) as nota_final
FROM prom_met pm 
JOIN esq_inscripciones ins ON pm.inscripcion_id = ins.id 
LEFT JOIN esq_integrantes_inscripcion ii ON ins.id = ii.inscripcion_id AND ins.tipo_inscripcion = 'individual'
LEFT JOIN esq_personas p ON ii.persona_id = p.id
JOIN esq_eventos ev ON ins.evento_id = ev.id 
GROUP BY 1, 2, 3 ORDER BY 4 DESC;
