const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'DB_eventos',
    user: 'senshi',
    password: 'animex100pre'
});

async function checkMetrics() {
    try {
        await client.connect();
        const result = await client.query(`
      SELECT id, name, type, "targetRole", "eventId"
      FROM esq_metrica 
      ORDER BY "eventId" NULLS FIRST, name
    `);
        console.log('\n=== ALL METRICS ===');
        console.table(result.rows);

        const globalMetrics = result.rows.filter(m => !m.eventId);
        console.log('\n=== GLOBAL METRICS (eventId = NULL) ===');
        console.table(globalMetrics);

        const eventMetrics = result.rows.filter(m => m.eventId);
        console.log('\n=== EVENT-SPECIFIC METRICS ===');
        console.table(eventMetrics);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkMetrics();
