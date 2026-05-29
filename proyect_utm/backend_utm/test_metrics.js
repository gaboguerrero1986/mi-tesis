const axios = require('axios');

const API_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@utm.edu.ec';
const ADMIN_PASSWORD = 'adminpassword';

async function runTest() {
    console.log('--- Starting Metrics System Test ---');

    try {
        // 1. Login
        console.log('\n1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.access_token;
        console.log('✅ Login successful.');

        // 2. Create Event with Metrics
        console.log('\n2. Creating Event with Metrics...');
        const eventData = {
            title: "Feria de Ciencias 2025",
            description: "Evaluación de proyectos científicos",
            date: new Date().toISOString(),
            status: "published",
            metrics: [
                {
                    name: "Creatividad",
                    type: "quantitative",
                    minVal: 1,
                    maxVal: 10
                },
                {
                    name: "Presentación Oral",
                    type: "quantitative",
                    minVal: 1,
                    maxVal: 5
                },
                {
                    name: "Comentarios del Jurado",
                    type: "qualitative"
                }
            ]
        };

        const createRes = await axios.post(`${API_URL}/events`, eventData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const event = createRes.data;
        console.log(`✅ Event created. ID: ${event.id}`);
        console.log(`   Metrics count: ${event.metrics ? event.metrics.length : 'N/A'}`);

        if (event.metrics && event.metrics.length === 3) {
            console.log('✅ Metrics correctly associated.');
        } else {
            console.error('❌ Metrics mismatch or missing in response.');
        }

    } catch (error) {
        console.error('❌ TEST FAILED');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTest();
