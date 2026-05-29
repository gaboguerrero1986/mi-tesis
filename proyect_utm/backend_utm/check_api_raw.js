const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Checking API directly: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ API Connection Successful!');
            const models = JSON.parse(data).models;
            console.log('Available Models:', models.map(m => m.name));
        } else {
            console.log(`❌ API Error: ${res.statusCode}`);
            console.log('Response:', data);
        }
    });

}).on('error', (err) => {
    console.log('❌ Connection Error:', err.message);
});
