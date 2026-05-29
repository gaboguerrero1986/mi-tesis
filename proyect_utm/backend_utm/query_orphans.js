const { Client } = require('pg');
const c = new Client({user: 'senshi', password: 'animex100pre', database: 'DB_eventos_utm', host: 'localhost'});
c.connect().then(() => {
    c.query('SELECT * FROM esq_valores_eav ORDER BY creado_at DESC LIMIT 5').then(r2 => {
        console.log("Valores EAV:", r2.rows);
        c.end();
    });
});
