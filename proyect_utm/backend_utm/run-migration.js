const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'senshi',
  password: 'animex100pre',
  database: 'DB_eventos_utm',
});

async function run() {
  await client.connect();
  console.log('Connected to DB');

  try {
    // Alter esq_parametros
    try {
      await client.query('ALTER TABLE esq_parametros ADD COLUMN is_active BOOLEAN DEFAULT true;');
      console.log('Added is_active to esq_parametros');
    } catch (e) {
      if (e.code === '42701') console.log('is_active already exists');
      else throw e;
    }

    // Alter esq_eventos
    try {
      await client.query("ALTER TABLE esq_eventos ADD COLUMN modalidad_evaluacion VARCHAR(50) DEFAULT 'individual';");
      console.log('Added modalidad_evaluacion to esq_eventos');
    } catch (e) {
      if (e.code === '42701') console.log('modalidad_evaluacion already exists');
      else throw e;
    }
    
    try {
      await client.query('ALTER TABLE esq_eventos ADD COLUMN responsable_id uuid REFERENCES esq_usuarios(id);');
      console.log('Added responsable_id to esq_eventos');
    } catch (e) {
      if (e.code === '42701') console.log('responsable_id already exists');
      else throw e;
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
