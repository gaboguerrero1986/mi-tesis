const http = require('http');

http.get('http://localhost:3000/users', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const users = JSON.parse(data);
      console.log('Jurors:', users.filter(u => u.rol_sistema === 'jury').map(u => ({id: u.id, correo: u.correo})));
      http.get('http://localhost:3000/events', (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          const events = JSON.parse(data2);
          if (events.length > 0) {
            console.log('Event jurados:', events[0].jurados.map(j => ({id: j.id, usuario_id: j.usuario_id})));
          }
        });
      });
    } catch (e) {}
  });
});
