# Sistema de Gestión y Evaluación de Eventos UTM

## Descripción del Software

Este sistema es una plataforma integral diseñada para la **gestión y evaluación de eventos académicos e institucionales** (concursos, ferias de proyectos, sustentaciones, etc.). Permite la administración completa del ciclo de vida de un evento: desde su creación, registro de participantes y asignación de jurados, hasta la captura de calificaciones y generación de reportes automáticos.

El software cuenta con distintos roles de usuario:
- **Gestor (Administrador)**: Crea eventos, inscribe participantes (individuales o equipos), asigna jurados, define las métricas de evaluación con sus pesos porcentuales y genera reportes de Inteligencia de Negocios (BI) exportables a PDF.
- **Jurado**: Accede a un panel donde puede ver los eventos a los que fue asignado, revisar la lista de participantes y calificarlos mediante un baremo dinámico estructurado en el sistema.
- **Asistente / Estudiante**: Participa de manera pasiva en el evento y puede evaluar el evento en general (infraestructura, organización, etc.) dejando comentarios y puntuaciones que alimentan los reportes de calidad.

## Arquitectura del Proyecto

El proyecto está estructurado como un monorepositorio con dos partes principales:
- **Frontend (`front_utm`)**: Desarrollado en **Angular** y estilizado con **PrimeNG** y **PrimeFlex**.
- **Backend (`backend_utm`)**: Desarrollado en **NestJS** utilizando **TypeORM** para la conexión y persistencia de datos.
- **Base de Datos**: Utiliza **PostgreSQL**, alojado actualmente en **Supabase**.

---

## Guía de Instalación y Ejecución Local

Sigue estos pasos para instalar y ejecutar el proyecto en tu entorno local.

### 1. Requisitos Previos
- Tener instalado **Node.js** (versión 16 o superior recomendada).
- Tener instalado **Angular CLI** (`npm install -g @angular/cli`).
- Tener instalado **NestJS CLI** (`npm install -g @nestjs/cli`).
- Tener una cuenta en **Supabase** (o un servidor PostgreSQL local).

### 2. Configuración de la Base de Datos (Supabase)
El proyecto incluye un script SQL que genera todas las tablas y vistas necesarias.
1. Entra a tu proyecto en [Supabase](https://supabase.com/).
2. Dirígete a la sección **SQL Editor**.
3. Copia el contenido del archivo `backend_utm/esquema_nuevo_utm.sql` (incluyendo la vista de Baremo y la columna de comentarios) y ejecútalo.

### 3. Configuración y Ejecución del Backend (NestJS)
1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend_utm
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno. Crea un archivo `.env` en la raíz de `backend_utm` con las siguientes variables (ajusta los valores según tu base de datos de Supabase):
   ```env
   DB_HOST=aws-1-us-west-2.pooler.supabase.com
   DB_PORT=5432
   DB_USERNAME=postgres.[tu_usuario]
   DB_PASSWORD=[tu_password]
   DB_DATABASE=postgres
   JWT_SECRET=super-secret-key-utm-2026
   ```
4. Ejecuta el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```
   *El backend estará corriendo en `http://localhost:3000`*

### 4. Configuración y Ejecución del Frontend (Angular)
1. Abre otra pestaña de la terminal y navega a la carpeta del frontend:
   ```bash
   cd front_utm
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. (Opcional) Verifica que la URL del API en `src/environments/environment.ts` esté apuntando a `http://localhost:3000`.
4. Ejecuta el servidor de Angular:
   ```bash
   ng serve
   ```
   *El frontend estará disponible en `http://localhost:4200`*

---

## Notas Adicionales
- Para ingresar como administrador, debes crear el usuario desde la base de datos o asegurarte de usar el correo/contraseña definido por defecto durante las pruebas.
- Si instalas nuevas librerías para la generación de reportes, asegúrate de correr `npm install` nuevamente.
