const http = require('http');

const loginData = JSON.stringify({
  username: 'admin',
  password: 'adminpassword' // Assuming this is correct or I'll look it up
});

const loginReq = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const token = JSON.parse(data).access_token;
      if (!token) { console.log('Login failed', data); return; }
      
      const req = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/users?role=jury',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }, res2 => {
        let data2 = '';
        res2.on('data', d => data2 += d);
        res2.on('end', () => console.log('Users:', data2));
      });
      req.end();
    } catch(e) { console.log('Parse error', data); }
  });
});
loginReq.write(loginData);
loginReq.end();
