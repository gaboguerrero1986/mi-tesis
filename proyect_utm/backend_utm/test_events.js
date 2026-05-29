const http = require('http');

http.get('http://localhost:3000/events', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const events = JSON.parse(data);
      if (events.length > 0) {
        console.log('Event estado:', events[0].estado);
        console.log('Event titulo:', events[0].titulo);
      }
    } catch (e) {
      console.log('Error parsing JSON:', data);
    }
  });
}).on('error', err => console.log('Error:', err.message));
