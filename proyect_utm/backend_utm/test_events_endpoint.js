const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/events',
  method: 'GET',
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    if (res.statusCode >= 400) {
      console.error('Error:', res.statusCode, data);
    } else {
      console.log('Success, response length:', data.length);
      // Try to parse to see if it's JSON array
      try {
        const json = JSON.parse(data);
        console.log('Is Array?', Array.isArray(json), 'Length:', json.length);
      } catch (e) {
        console.log('Not JSON');
      }
    }
  });
});
req.on('error', e => console.error(e));
req.end();
