const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'DB_eventos',
    user: 'senshi',
    password: 'animex100pre'
});

async function updateMetrics() {
    try {
        await client.connect();

        // Update global metrics to targetRole = 'student'
        const updateResult = await client.query(`
      UPDATE esq_metrica 
      SET "targetRole" = 'student' 
      WHERE "eventId" IS NULL
    `);
        console.log(`Updated ${updateResult.rowCount} global metrics to targetRole='student'`);

        // Verify the update
        const result = await client.query(`
      SELECT id, name, type, "targetRole", "eventId"
      FROM esq_metrica 
      ORDER BY "eventId" NULLS FIRST, name
    `);
        console.log('\n=== ALL METRICS AFTER UPDATE ===');
        console.table(result.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

updateMetrics();
