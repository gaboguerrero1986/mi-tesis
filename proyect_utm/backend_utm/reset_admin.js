const bcrypt = require('bcrypt');
const { Client } = require('pg');
require('dotenv').config();

async function resetAdmin() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'senshi',
    password: process.env.DB_PASSWORD || 'animex100pre',
    database: process.env.DB_NAME || 'DB_eventos_utm',
  });

  try {
    await client.connect();
    
    // Hash "temporal123" properly
    const hash = await bcrypt.hash('temporal123', 10);
    
    // Update the admin user
    const res = await client.query(
      'UPDATE esq_usuarios SET password_hash = $1 WHERE correo = $2 RETURNING *',
      [hash, 'admin@utm.edu.ec']
    );

    if (res.rowCount > 0) {
      console.log('¡Contraseña de admin actualizada correctamente a: temporal123!');
    } else {
      console.log('No se encontró el usuario admin@utm.edu.ec. Intenta registrarlo de nuevo.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

resetAdmin();
