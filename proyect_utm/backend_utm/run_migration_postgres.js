const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: 'postgres', // Trying postgres user
    password: process.env.DB_PASSWORD, // Using the same password provided
    database: process.env.DB_NAME,
});

async function runMigration() {
    try {
        await client.connect();
        await client.query('ALTER TABLE esq_evento ADD COLUMN IF NOT EXISTS "isPublic" boolean DEFAULT false;');
        console.log('✅ Migration "isPublic" applied successfully with postgres user.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

runMigration();
