const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'DB_eventos',
    user: 'senshi',
    password: 'animex100pre'
});

async function checkJuryGlobals() {
    try {
        await client.connect();

        // Find global metrics with targetRole = 'jury'
        const result = await client.query(`
      SELECT id, name, type, "targetRole", "eventId"
      FROM esq_metrica 
      WHERE "eventId" IS NULL AND "targetRole" = 'jury'
    `);

        console.log('\n=== GLOBAL METRICS WITH ROLE = JURY ===');
        console.table(result.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkJuryGlobals();
