const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'parqueadero' });
    const [rows] = await conn.execute('SELECT id_usuario, nombre, email, id_rol, estado, clave FROM usuario LIMIT 5');
    console.log('ROWS:', JSON.stringify(rows, null, 2));
    const [desc] = await conn.execute('DESCRIBE usuario');
    console.log('DESC:', JSON.stringify(desc.map(r => ({ Field: r.Field, Type: r.Type, Null: r.Null, Key: r.Key, Default: r.Default })), null, 2));
    await conn.end();
  } catch (err) {
    console.error('DB ERROR:', err);
    process.exit(1);
  }
})();
