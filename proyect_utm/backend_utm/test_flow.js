const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function runTests() {
    try {
        console.log('--- Starting System Tests ---');

        // 1. Login as Admin
        console.log('\n1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@utm.edu.ec',
            password: 'adminpassword'
        });
        const token = loginRes.data.access_token;
        console.log('✅ Login successful. Token received.');

        // 2. Create Event
        console.log('\n2. Creating Event "Feria de Ciencias"...');
        const eventRes = await axios.post(`${API_URL}/events`, {
            title: 'Feria de Ciencias 2025',
            description: 'Evento de prueba automatizado',
            date: new Date().toISOString(),
            status: 'published'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const eventId = eventRes.data.id;
        console.log(`✅ Event created. ID: ${eventId}`);

        // 3. Add Metric to Event
        console.log('\n3. Adding Metric "Organización"...');
        const metricRes = await axios.post(`${API_URL}/metrics`, {
            name: 'Organización',
            type: 'quantitative',
            minVal: 1,
            maxVal: 5,
            eventId: eventId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const metricId = metricRes.data.id;
        console.log(`✅ Metric created. ID: ${metricId}`);

        // 4. Submit Evaluation (as Student/Public)
        console.log('\n4. Submitting Evaluation...');
        // Note: Evaluations might require auth depending on implementation. 
        // My implementation plan said "Student/External". 
        // If I implemented it to require auth, I need a student user.
        // Let's check if I can submit without auth or if I need to register a student.
        // The controller says: @UseGuards(AuthGuard('jwt')) for create?
        // Let's check the controller code I wrote.
        // ... I'll assume I need auth. I'll register a student first.

        console.log('   4a. Registering Student...');
        const studentEmail = `student_${Date.now()}@utm.edu.ec`;
        await axios.post(`${API_URL}/auth/register`, {
            email: studentEmail,
            password: 'studentpass',
            fullName: 'Test Student',
            role: 'student'
        });

        console.log('   4b. Logging in as Student...');
        const studentLogin = await axios.post(`${API_URL}/auth/login`, {
            email: studentEmail,
            password: 'studentpass'
        });
        const studentToken = studentLogin.data.access_token;

        console.log('   4c. Posting Evaluation...');
        await axios.post(`${API_URL}/evaluations`, {
            eventId: eventId,
            comments: 'Excelente evento, muy organizado.',
            details: [
                { metricId: metricId, value: 5 }
            ]
        }, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('✅ Evaluation submitted successfully.');

        // 5. Verify Report
        console.log('\n5. Generating Report...');
        const reportRes = await axios.get(`${API_URL}/reports/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` } // Admin can view reports
        });
        console.log('✅ Report generated:');
        console.log('   Total Evaluations:', reportRes.data.totalEvaluations);
        console.log('   Sentiment:', reportRes.data.sentiment);

        console.log('\n--- ALL TESTS PASSED SUCCESSFULLY ---');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTests();
