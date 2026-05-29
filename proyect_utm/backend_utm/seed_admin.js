const axios = require('axios');

async function seed() {
    try {
        const res = await axios.post('http://localhost:3000/auth/register', {
            email: 'admin@utm.edu.ec',
            password: 'adminpassword',
            fullName: 'Admin User',
            role: 'admin'
        });
        console.log('Admin created:', res.data);
    } catch (error) {
        console.error('Error creating admin:', error.response?.data || error.message);
    }
}

seed();
