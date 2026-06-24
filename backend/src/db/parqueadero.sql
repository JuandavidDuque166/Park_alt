DROP DATABASE IF EXISTS parqueadero;
CREATE DATABASE parqueadero;
USE parqueadero;

-- 1. TABLAS INDEPENDIENTES (No dependen de otras)
CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE,
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
    estado ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    valor_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_tarifa_tipo FOREIGN KEY (id_tipo) REFERENCES tipo_vehiculo(id_tipo)
);

CREATE TABLE control_i_s (
    id_ingreso INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora_entrada DATETIME NOT NULL,
    fecha_hora_salida DATETIME,
    url_imagen VARCHAR(255), -- Evidencia fotográfica (CU04)
    id_vehiculo INT NULL,
    id_espacio INT NULL,
    id_usuario INT NULL,
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
    metodo_pago ENUM('EFECTIVO', 'TRASNFERENCIA') NOT NULL,
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
    valor DECIMAL(10,2) NOT NULL,
    estado ENUM('ACTIVA','VENCIDA') DEFAULT 'ACTIVA',
    nivel_servicio varchar (100),
    CONSTRAINT fk_mensualidad_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES cliente(id_cliente),
    CONSTRAINT fk_mensualidad_vehiculo
    FOREIGN KEY (id_vehiculo)
    REFERENCES vehiculo(id_vehiculo)
);

-- 3. INSERCIÓN DE DATOS INICIALES (Semillas)

INSERT INTO cliente (nombre_completo, documento, telefono) VALUES 
('Juan Pérez', '1001234567', '3001112233'),
('María García', '1007654321', '3104445566'),
('Carlos López', '1009876543', '3207778899');

INSERT INTO tipo_vehiculo(nombre)
VALUES
('AUTOMOVIL'),
('CAMPERO'), 
('CAMIONETA'), 
('MICROBUS'), 
('MOTOCARRO'), 
('MOTOCICLETA'), 
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
(2, 1), (2, 2), (2, 3);          -- Permisos de Operario

INSERT INTO usuario(nombre, email, clave, id_rol,  fecha_creacion)
VALUES
('admin', 'juandaduque880@gmail.com','123456', 1, '2026-06-03'),
('operario1', 'empleado@gmail.com', '123456', 2, '2026-06-03');

INSERT INTO tarifa (id_tipo, valor_hora, valor_fraccion, valor_dia, valor_mensual) VALUES 
(1, 5000, 1100, 37600, 160000), -- Automóvil
(2, 5000, 1100, 37600, 160000), -- Campero
(3, 5000, 1100, 37600, 160000), -- Camioneta
(4, 5000, 1100, 37600, 160000), -- Microbus
(5, 5000, 1100, 37600, 160000), -- Motocarro
(6, 2400, 750, 16400, 65800),   -- Motocicleta
(7, 750, 200, 3750, 25600);     -- Bicicleta

-- POBLACIÓN DE LOS 100 ESPACIOS DEL PARQUEADERO
-- Nivel 1: 30 espacios (101 al 130)
INSERT INTO espacio (numero, nivel, estado) VALUES 
(101, 'Nivel 1', 'DISPONIBLE'), (102, 'Nivel 1', 'DISPONIBLE'), (103, 'Nivel 1', 'DISPONIBLE'), (104, 'Nivel 1', 'DISPONIBLE'), (105, 'Nivel 1', 'DISPONIBLE'),
(106, 'Nivel 1', 'DISPONIBLE'), (107, 'Nivel 1', 'DISPONIBLE'), (108, 'Nivel 1', 'DISPONIBLE'), (109, 'Nivel 1', 'DISPONIBLE'), (110, 'Nivel 1', 'DISPONIBLE'),
(111, 'Nivel 1', 'DISPONIBLE'), (112, 'Nivel 1', 'DISPONIBLE'), (113, 'Nivel 1', 'DISPONIBLE'), (114, 'Nivel 1', 'DISPONIBLE'), (115, 'Nivel 1', 'DISPONIBLE'),
(116, 'Nivel 1', 'DISPONIBLE'), (117, 'Nivel 1', 'DISPONIBLE'), (118, 'Nivel 1', 'DISPONIBLE'), (119, 'Nivel 1', 'DISPONIBLE'), (120, 'Nivel 1', 'DISPONIBLE'),
(121, 'Nivel 1', 'DISPONIBLE'), (122, 'Nivel 1', 'DISPONIBLE'), (123, 'Nivel 1', 'DISPONIBLE'), (124, 'Nivel 1', 'DISPONIBLE'), (125, 'Nivel 1', 'DISPONIBLE'),
(126, 'Nivel 1', 'DISPONIBLE'), (127, 'Nivel 1', 'DISPONIBLE'), (128, 'Nivel 1', 'DISPONIBLE'), (129, 'Nivel 1', 'DISPONIBLE'), (130, 'Nivel 1', 'DISPONIBLE');

-- Nivel 2: 25 espacios (201 al 225)
INSERT INTO espacio (numero, nivel, estado) VALUES 
(201, 'Nivel 2', 'DISPONIBLE'), (202, 'Nivel 2', 'DISPONIBLE'), (203, 'Nivel 2', 'DISPONIBLE'), (204, 'Nivel 2', 'DISPONIBLE'), (205, 'Nivel 2', 'DISPONIBLE'),
(206, 'Nivel 2', 'DISPONIBLE'), (207, 'Nivel 2', 'DISPONIBLE'), (208, 'Nivel 2', 'DISPONIBLE'), (209, 'Nivel 2', 'DISPONIBLE'), (210, 'Nivel 2', 'DISPONIBLE'),
(211, 'Nivel 2', 'DISPONIBLE'), (212, 'Nivel 2', 'DISPONIBLE'), (213, 'Nivel 2', 'DISPONIBLE'), (214, 'Nivel 2', 'DISPONIBLE'), (215, 'Nivel 2', 'DISPONIBLE'),
(216, 'Nivel 2', 'DISPONIBLE'), (217, 'Nivel 2', 'DISPONIBLE'), (218, 'Nivel 2', 'DISPONIBLE'), (219, 'Nivel 2', 'DISPONIBLE'), (220, 'Nivel 2', 'DISPONIBLE'),
(221, 'Nivel 2', 'DISPONIBLE'), (222, 'Nivel 2', 'DISPONIBLE'), (223, 'Nivel 2', 'DISPONIBLE'), (224, 'Nivel 2', 'DISPONIBLE'), (225, 'Nivel 2', 'DISPONIBLE');

-- Nivel 3: 25 espacios (301 al 325)
INSERT INTO espacio (numero, nivel, estado) VALUES 
(301, 'Nivel 3', 'DISPONIBLE'), (302, 'Nivel 3', 'DISPONIBLE'), (303, 'Nivel 3', 'DISPONIBLE'), (304, 'Nivel 3', 'DISPONIBLE'), (305, 'Nivel 3', 'DISPONIBLE'),
(306, 'Nivel 3', 'DISPONIBLE'), (307, 'Nivel 3', 'DISPONIBLE'), (308, 'Nivel 3', 'DISPONIBLE'), (309, 'Nivel 3', 'DISPONIBLE'), (310, 'Nivel 3', 'DISPONIBLE'),
(311, 'Nivel 3', 'DISPONIBLE'), (312, 'Nivel 3', 'DISPONIBLE'), (313, 'Nivel 3', 'DISPONIBLE'), (314, 'Nivel 3', 'DISPONIBLE'), (315, 'Nivel 3', 'DISPONIBLE'),
(316, 'Nivel 3', 'DISPONIBLE'), (317, 'Nivel 3', 'DISPONIBLE'), (318, 'Nivel 3', 'DISPONIBLE'), (319, 'Nivel 3', 'DISPONIBLE'), (320, 'Nivel 3', 'DISPONIBLE'),
(321, 'Nivel 3', 'DISPONIBLE'), (322, 'Nivel 3', 'DISPONIBLE'), (323, 'Nivel 3', 'DISPONIBLE'), (324, 'Nivel 3', 'DISPONIBLE'), (325, 'Nivel 3', 'DISPONIBLE');

-- Subterráneo: 20 espacios (1 al 20)
INSERT INTO espacio (numero, nivel, estado) VALUES 
(1, 'Subterráneo', 'DISPONIBLE'), (2, 'Subterráneo', 'DISPONIBLE'), (3, 'Subterráneo', 'DISPONIBLE'), (4, 'Subterráneo', 'DISPONIBLE'), (5, 'Subterráneo', 'DISPONIBLE'),
(6, 'Subterráneo', 'DISPONIBLE'), (7, 'Subterráneo', 'DISPONIBLE'), (8, 'Subterráneo', 'DISPONIBLE'), (9, 'Subterráneo', 'DISPONIBLE'), (10, 'Subterráneo', 'DISPONIBLE'),
(11, 'Subterráneo', 'DISPONIBLE'), (12, 'Subterráneo', 'DISPONIBLE'), (13, 'Subterráneo', 'DISPONIBLE'), (14, 'Subterráneo', 'DISPONIBLE'), (15, 'Subterráneo', 'DISPONIBLE'),
(16, 'Subterráneo', 'DISPONIBLE'), (17, 'Subterráneo', 'DISPONIBLE'), (18, 'Subterráneo', 'DISPONIBLE'), (19, 'Subterráneo', 'DISPONIBLE'), (20, 'Subterráneo', 'DISPONIBLE');

-- 4. CONSULTAS Y REPORTES DE PRUEBA
INSERT INTO vehiculo (placa, id_tipo) VALUES ('ABC-001', 1), ('XYZ-002', 6), ('LMN-003', 3);

INSERT INTO mensualidad (id_cliente, id_vehiculo, fecha_inicio, fecha_fin, valor, estado, nivel_servicio) 
VALUES 
(1, 1, '2026-06-01', '2026-07-01', 149500.00, 'ACTIVA', 'Subterráneo'),
(2, 2, '2026-05-15', '2026-06-15', 61500.00, 'ACTIVA', 'Subterráneo'),
(3, 3, '2026-04-01', '2026-05-01', 149500.00, 'VENCIDA', 'Subterráneo');