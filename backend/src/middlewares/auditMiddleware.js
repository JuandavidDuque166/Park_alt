const db = require('../config/conexion_db');

const audit = (moduleName) => async (req, res, next) => {
  const originalSend = res.send;

  res.send = function body(body) {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const action = req.method;
    const ip = req.ip || 'unknown';
    const userId = req.user?.id_usuario || null;

    db.query(
      'INSERT INTO auditoria (id_usuario, fecha, hora, ip, accion, modulo, valor_anterior, valor_nuevo, tipo_operacion) VALUES (?, CURDATE(), CURTIME(), ?, ?, ?, ?, ?, ?)',
      [userId, ip, action, moduleName, null, payload, 'HTTP']
    ).catch(() => undefined);

    return originalSend.call(this, body);
  };

  next();
};

module.exports = audit;
