const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'DB_eventos',
    user: 'senshi',
    password: 'animex100pre'
});

async function checkAllGlobals() {
    try {
        await client.connect();

        const result = await client.query(`
      SELECT id, name, type, "targetRole", "eventId"
      FROM esq_metrica 
      WHERE "eventId" IS NULL
    `);

        console.log('\n=== ALL GLOBAL METRICS ===');
        console.table(result.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkAllGlobals();
