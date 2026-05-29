const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [],
    synchronize: false,
});

async function cleanMetrics() {
    try {
        await AppDataSource.initialize();
        // Delete all metrics that are specific to an event (not global)
        const result = await AppDataSource.query('DELETE FROM esq_metrica WHERE "eventId" IS NOT NULL');
        console.log('Deleted specific metrics:', result);
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

cleanMetrics();
