DROP DATABASE IF EXISTS parqueadero;
CREATE DATABASE parqueadero;
USE parqueadero;

-- 1. TABLAS INDEPENDIENTES (No dependen de otras)
CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    telefono VARCHAR(20)
);

CREATE TABLE tipo_vehiculo (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE espacio (
    id_espacio INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL,
    nivel VARCHAR(20) NOT NULL,
    estado ENUM('DISPONIBLE', 'OCUPADO', 'INACTIVO') DEFAULT 'DISPONIBLE'
);

-- 2. TABLAS DEPENDIENTES (Tienen llaves foráneas)
CREATE TABLE vehiculo (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    id_tipo INT NOT NULL,
    CONSTRAINT fk_vehiculo_tipo
    FOREIGN KEY (id_tipo)
    REFERENCES tipo_vehiculo(id_tipo)
);

CREATE TABLE rol_permiso (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    CONSTRAINT fk_rol_permiso_rol
    FOREIGN KEY (id_rol)
    REFERENCES roles(id_rol),
    CONSTRAINT fk_rol_permiso_permiso
    FOREIGN KEY (id_permiso)
    REFERENCES permisos(id_permiso)
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol)
    REFERENCES roles(id_rol)
);

CREATE TABLE tarifa (
    id_tarifa INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT NOT NULL,
    valor_hora DECIMAL(10,2) NOT NULL,
    valor_fraccion DECIMAL(10,2) NOT NULL,
    valor_dia DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_tarifa_tipo
    FOREIGN KEY (id_tipo)
    REFERENCES tipo_vehiculo(id_tipo)
);

CREATE TABLE control_i_s (
    id_ingreso INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora_entrada DATETIME NOT NULL,
    fecha_hora_salida DATETIME,
    url_imagen VARCHAR(255), -- Evidencia fotográfica (CU04)
    id_vehiculo INT NOT NULL,
    id_espacio INT NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_control_vehiculo
    FOREIGN KEY (id_vehiculo)
    REFERENCES vehiculo(id_vehiculo),
    CONSTRAINT fk_control_espacio
    FOREIGN KEY (id_espacio)
    REFERENCES espacio(id_espacio),
    CONSTRAINT fk_control_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario)
);

CREATE TABLE pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    metodo_pago ENUM('EFECTIVO','TRANSFERENCIA') NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME NOT NULL,
    id_ingreso INT NOT NULL,
    CONSTRAINT fk_pago_ingreso
    FOREIGN KEY (id_ingreso)
    REFERENCES control_i_s(id_ingreso)
);

CREATE TABLE recibo (
    id_recibo INT AUTO_INCREMENT PRIMARY KEY,
    fecha_emision DATETIME NOT NULL,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    id_pago INT NOT NULL,
    CONSTRAINT fk_recibo_pago
    FOREIGN KEY (id_pago)
    REFERENCES pago(id_pago)
);

CREATE TABLE mensualidad (
    id_mensualidad INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_vehiculo INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('ACTIVA','VENCIDA') DEFAULT 'ACTIVA',
    CONSTRAINT fk_mensualidad_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES cliente(id_cliente),
    CONSTRAINT fk_mensualidad_vehiculo
    FOREIGN KEY (id_vehiculo)
    REFERENCES vehiculo(id_vehiculo)
);

-- 3. INSERCIÓN DE DATOS INICIALES (Semillas)

INSERT INTO tipo_vehiculo(nombre)
VALUES
('CARRO'),
('MOTO'),
('BICICLETA');

INSERT INTO roles (nombre) 
VALUES 
('Administrador'),
('Operario');

INSERT INTO permisos (nombre, descripcion)
VALUES
('Crear','Permite crear nuevos registros'),
('Leer','Permite visualizar el registro'),
('Actualizar','Permite modificar registros existentes'),
('Eliminar','Permite eliminar registros');

INSERT INTO rol_permiso (id_rol, id_permiso) 
VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), -- Permisos de Administrador
(2, 1), (2, 2), (2, 3);         -- Permisos de Operario

INSERT INTO usuario(nombre, email, clave, id_rol)
VALUES
('admin', 'juandaduque880@gmail.com','123456', 1),
('operario1', 'empleado@gmail.com', '123456', 2);

INSERT INTO espacio(numero, nivel)
VALUES
(1, 'NIVEL 1'),
(2, 'NIVEL 2'),
(3, 'NIVEL 3'),
(4, 'SUBTERRANEO')
;

-- 4. CONSULTAS Y REPORTES DE PRUEBA

-- VEHÍCULOS ACTUALMENTE DENTRO DEL PARQUEADERO
SELECT v.placa, c.fecha_hora_entrada
FROM control_i_s c
INNER JOIN vehiculo v
ON c.id_vehiculo = v.id_vehiculo
WHERE c.fecha_hora_salida IS NULL;

-- ESPACIOS OCUPADOS
SELECT e.numero, e.nivel, e.estado
FROM espacio e
INNER JOIN control_i_s c
ON e.id_espacio = c.id_espacio
WHERE c.fecha_hora_salida IS NULL;

-- TOTAL RECAUDADO
SELECT SUM(valor_total) AS total_recaudado
FROM pago;

-- Insertar un vehículo de prueba (Moto)
INSERT INTO vehiculo (placa, id_tipo) VALUES ('XYZ123', 2);

-- Registrar un ingreso simulando al operario
INSERT INTO control_i_s (fecha_hora_entrada, url_imagen, id_vehiculo, id_espacio, id_usuario) 
VALUES (NOW(), 'http://ruta-a-imagen.com/xyz123.jpg', 1, 1, 2);

-- Marcar el espacio como OCUPADO
UPDATE espacio SET estado = 'OCUPADO' WHERE id_espacio = 1;