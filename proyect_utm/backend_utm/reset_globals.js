const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'DB_eventos',
    user: 'senshi',
    password: 'animex100pre'
});

async function resetGlobalMetrics() {
    try {
        await client.connect();

        // 1. Delete ALL global metrics
        const deleteResult = await client.query(`
      DELETE FROM esq_metrica 
      WHERE "eventId" IS NULL
    `);
        console.log(`Deleted ${deleteResult.rowCount} global metrics`);

        // 2. Re-create standard student metrics
        const metrics = [
            { name: 'Organización del evento', type: 'quantitative', targetRole: 'student' },
            { name: 'Calidad de los expositores', type: 'quantitative', targetRole: 'student' },
            { name: 'Cumplimiento de horarios', type: 'quantitative', targetRole: 'student' },
            { name: 'Instalaciones y ambiente', type: 'quantitative', targetRole: 'student' },
            { name: 'Satisfacción general', type: 'quantitative', targetRole: 'student' },
            { name: 'Comentarios adicionales', type: 'qualitative', targetRole: 'student' }
        ];

        for (const m of metrics) {
            await client.query(`
        INSERT INTO esq_metrica (name, type, "targetRole", "minVal", "maxVal")
        VALUES ($1, $2, $3, $4, $5)
      `, [m.name, m.type, m.targetRole, m.type === 'quantitative' ? 1 : null, m.type === 'quantitative' ? 10 : null]);
        }

        console.log(`Created ${metrics.length} standard global metrics for students`);

        // 3. Verify
        const result = await client.query(`
      SELECT id, name, type, "targetRole", "eventId"
      FROM esq_metrica 
      WHERE "eventId" IS NULL
    `);
        console.log('\n=== NEW GLOBAL METRICS ===');
        console.table(result.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

resetGlobalMetrics();
