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

async function listMetrics() {
    try {
        await AppDataSource.initialize();
        const metrics = await AppDataSource.query('SELECT id, name, type, "eventId" FROM esq_metrica');
        console.log('Metrics:', metrics);
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

listMetrics();
