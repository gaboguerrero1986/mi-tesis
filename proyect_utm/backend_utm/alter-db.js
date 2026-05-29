const { Client } = require('pg');

async function alterDb() {
  const client = new Client({
    user: 'senshi',
    host: 'localhost',
    database: 'DB_eventos_utm',
    password: 'animex100pre',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to DB');
    
    await client.query(`ALTER TABLE esq_eventos ADD COLUMN IF NOT EXISTS descripcion TEXT;`);
    console.log('Added descripcion to esq_eventos');
    
    await client.query(`ALTER TABLE esq_inscripciones ADD COLUMN IF NOT EXISTS descripcion TEXT;`);
    console.log('Added descripcion to esq_inscripciones');
    
  } catch (err) {
    console.error('Error altering DB:', err);
  } finally {
    await client.end();
    console.log('Disconnected from DB');
  }
}

alterDb();
