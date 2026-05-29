const http = require('http');

http.get('http://127.0.0.1:3000/users', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if (res.statusCode !== 200) {
      console.log('Error data:', data);
    } else {
      console.log('Users loaded successfully');
    }
  });
}).on('error', err => console.log('Error:', err.message));
