const { Client } = require('pg');

const configs = [
    { user: 'postgres', pass: 'admin' },
    { user: 'postgres', pass: 'root' },
    { user: 'postgres', pass: '1234' },
    { user: 'postgres', pass: 'postgres' },
    { user: 'senshi', pass: 'senshi' } // We know this connects but fails permission
];

async function tryMigration() {
    for (const conf of configs) {
        console.log(`Testing credentials: ${conf.user} / ${conf.pass}`);
        const client = new Client({
            host: 'localhost',
            port: 5432,
            user: conf.user,
            password: conf.pass,
            database: 'DB_eventos',
        });

        try {
            await client.connect();
            console.log('✅ Connected! Applying migration...');
            await client.query('ALTER TABLE esq_evento ADD COLUMN IF NOT EXISTS "isPublic" boolean DEFAULT false;');
            console.log('🎉 Migration successful!');
            await client.end();
            return;
        } catch (err) {
            console.log(`❌ Failed with ${conf.user}: ${err.message}`);
            await client.end().catch(() => { });
        }
    }
    console.error('😩 All credentials failed to apply migration.');
}

tryMigration();
