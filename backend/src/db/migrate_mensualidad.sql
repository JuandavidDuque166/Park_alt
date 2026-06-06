USE parqueadero;

-- Verificar si la columna nivel_servicio existe antes de agregarla
ALTER TABLE mensualidad
ADD COLUMN IF NOT EXISTS nivel_servicio VARCHAR(50) AFTER fecha_fin;

-- Insertar algunas mensualidades de prueba si no existen
INSERT INTO cliente (nombre_completo, documento, telefono)
SELECT 'Juan Pérez', 'DOC123456', '3001234567'
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE documento = 'DOC123456');

INSERT INTO tipo_vehiculo (id_tipo, nombre)
VALUES (1, 'AUTOMOVIL')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO vehiculo (placa, id_tipo)
SELECT 'ABC1234', 1
WHERE NOT EXISTS (SELECT 1 FROM vehiculo WHERE placa = 'ABC1234');

-- Insertar una mensualidad de prueba
INSERT INTO mensualidad (id_cliente, id_vehiculo, fecha_inicio, fecha_fin, nivel_servicio, valor, estado)
SELECT 
    (SELECT id_cliente FROM cliente WHERE documento = 'DOC123456' LIMIT 1),
    (SELECT id_vehiculo FROM vehiculo WHERE placa = 'ABC1234' LIMIT 1),
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    'ALTURA',
    500000,
    'ACTIVA'
WHERE NOT EXISTS (
    SELECT 1 FROM mensualidad m
    INNER JOIN vehiculo v ON m.id_vehiculo = v.id_vehiculo
    WHERE v.placa = 'ABC1234'
);
