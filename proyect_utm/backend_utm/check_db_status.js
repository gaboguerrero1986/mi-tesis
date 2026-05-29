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

async function checkDB() {
    try {
        await AppDataSource.initialize();
        console.log('Database connection successful!');

        const users = await AppDataSource.query('SELECT * FROM esq_usuario');
        console.log('Users in DB:', users);

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

checkDB();
