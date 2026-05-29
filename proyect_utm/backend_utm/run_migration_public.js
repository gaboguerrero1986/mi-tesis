const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function runMigration() {
    try {
        await client.connect();
        await client.query('ALTER TABLE esq_evento ADD COLUMN IF NOT EXISTS "isPublic" boolean DEFAULT false;');
        console.log('✅ Migration "isPublic" applied successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
