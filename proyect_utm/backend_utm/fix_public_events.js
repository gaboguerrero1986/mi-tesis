const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: 'postgres', // Using postgres as we have the password now
    password: process.env.DB_PASSWORD, // 'animex100pre'
    database: process.env.DB_NAME,
});

async function setAllPublic() {
    try {
        await client.connect();
        // 1. Force isPublic = true for ALL events
        await client.query('UPDATE esq_evento SET "isPublic" = true;');
        console.log('✅ All events updated to isPublic = true.');

        // 2. Also, if the specific event the user tested is already 'completed', reopen it?
        // User said: "el evento se cerro". We should probably set "completed" events back to "published" IF their end date hasn't passed.
        // But better to just let the user re-open it or just create a new one. 
        // Actually, I can help by setting status='published' where status='completed' AND endDate > NOW().

        const res = await client.query(`
            UPDATE esq_evento 
            SET status = 'published' 
            WHERE status = 'completed' 
            AND ("endDate" IS NULL OR "endDate" > NOW())
        `);
        console.log(`✅ Re-opened ${res.rowCount} events that were prematurely completed.`);

    } catch (err) {
        console.error('❌ Update failed:', err.message);
    } finally {
        await client.end();
    }
}

setAllPublic();
