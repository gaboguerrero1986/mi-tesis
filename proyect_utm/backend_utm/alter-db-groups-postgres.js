const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'DB_eventos_utm',
  password: 'admin', // standard postgres pass for local usually, or 'postgres', or 'root'
  port: 5432,
});

async function runAlters() {
  await client.connect();
  try {
    // 1. Campos Dinámicos
    await client.query(`ALTER TABLE esq_parametros ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`);
    console.log('Added is_active to esq_parametros');

    // 2. Evaluacion grupal
    await client.query(`ALTER TABLE esq_eventos ADD COLUMN IF NOT EXISTS modalidad_evaluacion VARCHAR(50) DEFAULT 'individual';`);
    console.log('Added modalidad_evaluacion to esq_eventos');

    // 3. Responsable
    await client.query(`ALTER TABLE esq_eventos ADD COLUMN IF NOT EXISTS responsable_id UUID REFERENCES esq_usuarios(id);`);
    console.log('Added responsable_id to esq_eventos');

  } catch (err) {
    console.error('Error executing alters:', err);
  } finally {
    await client.end();
  }
}

runAlters();
