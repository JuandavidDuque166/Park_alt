DROP DATABASE IF EXISTS parqueadero;
CREATE DATABASE parqueadero;
USE parqueadero;

-- =========================================================================
-- 1. CREACIÓN DE TABLAS INDEPENDIENTES
-- =========================================================================

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

-- =========================================================================
-- 2. CREACIÓN DE TABLAS DEPENDIENTES (Con Llaves Foráneas)
-- =========================================================================

CREATE TABLE vehiculo (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    id_tipo INT NOT NULL,
    CONSTRAINT fk_vehiculo_tipo FOREIGN KEY (id_tipo) REFERENCES tipo_vehiculo(id_tipo)
);

CREATE TABLE rol_permiso (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    CONSTRAINT fk_rol_permiso_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    CONSTRAINT fk_rol_permiso_permiso FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso)
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    estado ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
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
    url_imagen VARCHAR(255),
    id_vehiculo INT NULL,
    id_espacio INT NULL,
    id_usuario INT NULL,
    CONSTRAINT fk_control_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo),
    CONSTRAINT fk_control_espacio FOREIGN KEY (id_espacio) REFERENCES espacio(id_espacio),
    CONSTRAINT fk_control_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    metodo_pago ENUM('EFECTIVO', 'TRASNFERENCIA') NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME NOT NULL,
    id_ingreso INT NOT NULL,
    CONSTRAINT fk_pago_ingreso FOREIGN KEY (id_ingreso) REFERENCES control_i_s(id_ingreso)
);

CREATE TABLE recibo (
    id_recibo INT AUTO_INCREMENT PRIMARY KEY,
    fecha_emision DATETIME NOT NULL,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    id_pago INT NOT NULL,
    CONSTRAINT fk_recibo_pago FOREIGN KEY (id_pago) REFERENCES pago(id_pago)
);

CREATE TABLE mensualidad (
    id_mensualidad INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_vehiculo INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    estado ENUM('ACTIVA','VENCIDA') DEFAULT 'ACTIVA',
    nivel_servicio VARCHAR(100),
    CONSTRAINT fk_mensualidad_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    CONSTRAINT fk_mensualidad_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo)
);

-- =========================================================================
-- 3. INSERCIÓN DE DATOS MAESTROS / SEMILLAS
-- =========================================================================

INSERT INTO cliente (nombre_completo, documento, telefono) VALUES 
('Juan Pérez', '1001234567', '3001112233'), ('María García', '1007654321', '3104445566'),
('Carlos López', '1009876543', '3207778899'), ('Alejandro Martínez', '1102345670', '3005551001'),
('Sofía Benítez', '1102345671', '3015551002'), ('Diego Fernando Castro', '1102345672', '3025551003'),
('Camila Andrea Rojas', '1102345673', '3035551004'), ('Mateo Gómez', '1102345674', '3045551005'),
('Valeria Restrepo', '1102345675', '3055551006'), ('Daniel Esteban Muñoz', '1102345676', '3065551007'),
('Isabella Ospina', '1102345677', '3075551008'), ('Nicolás David Ortiz', '1102345678', '3085551009'),
('Gabriela Silva', '1102345679', '3095551010'), ('Santiago Andrés Villa', '1102345680', '3105551011'),
('Mariana Herrera', '1102345681', '3115551012'), ('Sebastián Cardona', '1102345682', '3125551013'),
('Luciana Jaramillo', '1102345683', '3135551014'), ('Samuel David Beltrán', '1102345684', '3145551015'),
('Daniela Morales', '1102345685', '3155551016'), ('Andrés Felipe Delgado', '1102345686', '3165551017'),
('Salomé Gutiérrez', '1102345687', '3175551018'), ('Jerónimo Suárez', '1102345688', '3185551019'),
('Manuela Valencia', '1102345689', '3195551020'), ('Julian David Cárdenas', '1102345690', '3205551021'),
('Antonella Quintero', '1102345691', '3215551022'), ('Tomás Ignacio Marín', '1102345692', '3225551023'),
('Paulina Salazar', '1102345693', '3235551024'), ('Emanuel Bermúdez', '1102345694', '3245551025'),
('Laura Sofía Mendoza', '1102345695', '3255551026'), ('Miguel Ángel Acosta', '1102345696', '3265551027'),
('Sara Valentina Ríos', '1102345697', '3275551028'), ('Juan Esteban Franco', '1102345698', '3285551029'),
('Elena María Medina', '1102345699', '3295551030'), ('David Alejandro Vargas', '1102345700', '3005551031'),
('Victoria Eugenia Peña', '1102345701', '3015551032'), ('Ángel Gabriel Arias', '1102345702', '3025551033'),
('Samantha Guerrero', '1102345703', '3035551034'), ('Simon Benjamín Cortés', '1102345704', '3045551035'),
('Martina Alvarez', '1102345705', '3055551036'), ('Christopher Cabrera', '1102345706', '3065551037'),
('Juliana Marcela Céspedes', '1102345707', '3075551038'), ('Mathias Espinoza', '1102345708', '3085551039'),
('Ainhoa Monsalve', '1102345709', '3095551040'), ('Kevin Alexis Holguín', '1102345710', '3105551041'),
('Miranda Tobón', '1102345711', '3115551042'), ('Richard Steve Arango', '1102345712', '3125551043'),
('Emily Charlotte Durán', '1102345713', '3135551044'), ('Juan Sebastián Pineda', '1102345714', '3145551045'),
('Abigail Lucía Giraldo', '1102345715', '3155551046'), ('Pedro Nel Benavides', '1102345716', '3165551047'),
('Allison Dayana Cruz', '1102345717', '3175551048'), ('Luis Fernando Serna', '1102345718', '3185551049'),
('Guadalupe Agudelo', '1102345719', '3195551050');

INSERT INTO tipo_vehiculo (nombre) VALUES
('AUTOMOVIL'), ('CAMPERO'), ('CAMIONETA'), ('MICROBUS'), ('MOTOCARRO'), ('MOTOCICLETA'), ('BICICLETA');

INSERT INTO roles (nombre) VALUES 
('Administrador'), ('Operario');

INSERT INTO permisos (nombre, descripcion) VALUES
('Crear','Permite crear nuevos registros'), ('Leer','Permite visualizar el registro'),
('Actualizar','Permite modificar registros existentes'), ('Eliminar','Permite eliminar registros');

INSERT INTO rol_permiso (id_rol, id_permiso) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3);

INSERT INTO usuario (nombre, email, clave, id_rol, fecha_creacion) VALUES
('admin', 'admin@parkalt.com','123456', 1, '2026-06-03'),
('operario1', 'empleado@gmail.com', '123456', 2, '2026-06-03');

INSERT INTO tarifa (id_tipo, valor_hora, valor_fraccion, valor_dia, valor_mensual) VALUES 
(1, 5000, 1100, 37600, 160000),
(2, 5000, 1100, 37600, 160000),
(3, 5000, 1100, 37600, 160000),
(4, 5000, 1100, 37600, 160000),
(5, 5000, 1100, 37600, 160000),
(6, 2400, 750, 16400, 65800),
(7, 750, 200, 3750, 25600);

-- =========================================================================
-- POBLACIÓN DE LOS 100 ESPACIOS DEL PARQUEADERO
-- =========================================================================

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

-- =========================================================================
-- 4. POBLACIÓN DE VEHÍCULOS (Se insertan antes para que existan sus IDs)
-- =========================================================================

-- Aquí forzamos de forma implícita los IDs del 1 al 53 mapeados con los tipos correctos
INSERT INTO vehiculo (placa, id_tipo) VALUES 
('ABC-001', 1), ('XYZ-002', 6), ('LMN-003', 3), -- IDs 1, 2, 3
('KMS-521', 1), ('MXZ-894', 6), ('PEW-302', 1), -- IDs 4, 5, 6
('QER-745', 3), ('ZXT-112', 6), ('OSD-889', 2), -- IDs 7, 8, 9
('IOP-441', 1), ('YTR-632', 7), ('CVB-105', 6), -- IDs 10, 11, 12
('HJK-963', 1), ('BNM-741', 3), ('ASD-852', 6), -- IDs 13, 14, 15
('QWE-963', 4), ('RFV-123', 7), ('TGB-159', 1), -- IDs 16, 17, 18 (Se corrigió la placa 'RFV' inválida)
('EDC-357', 5), ('WSX-951', 6), ('UJM-258', 1), -- IDs 19, 20, 21
('IKM-456', 2), ('OLP-789', 1), ('ZAQ-123', 6), -- IDs 22, 23, 24
('XSW-456', 3), ('CDE-789', 1), ('VFR-012', 6), -- IDs 25, 26, 27
('BGT-345', 7), ('NHY-678', 1), ('MJU-901', 1), -- IDs 28, 29, 30
('KIU-234', 6), ('LOI-567', 4), ('PAS-890', 2), -- IDs 31, 32, 33
('DFG-123', 1), ('HJK-456', 6), ('LZX-789', 1), -- IDs 34, 35, 36
('CVB-012', 3), ('NMK-345', 6), ('TYU-678', 1), -- IDs 37, 38, 39
('GHJ-901', 5), ('VBN-234', 7), ('WER-567', 1), -- IDs 40, 41, 42
('SDF-890', 6), ('XCV-123', 1), ('ERT-456', 3), -- IDs 43, 44, 45
('UIO-789', 6), ('JKL-012', 1), ('YUI-345', 2), -- IDs 46, 47, 48
('HGF-678', 6), ('ZXC-901', 1), ('VBN-567', 1), -- IDs 49, 50, 51
('ASD-012', 6), ('QWE-345', 3);                 -- IDs 52, 53

-- =========================================================================
-- 5. MOVIMIENTOS Y REGISTROS FINALES
-- =========================================================================

INSERT INTO mensualidad (id_cliente, id_vehiculo, fecha_inicio, fecha_fin, valor, estado, nivel_servicio) VALUES 
(1, 1, '2026-06-01', '2026-07-01', 149500.00, 'ACTIVA', 'Subterráneo'),
(2, 2, '2026-05-15', '2026-06-15', 61500.00, 'ACTIVA', 'Subterráneo'),
(3, 3, '2026-04-01', '2026-05-01', 149500.00, 'VENCIDA', 'Subterráneo'),
(4, 4, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(5, 5, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(6, 6, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(7, 7, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 2'),
(8, 8, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(9, 9, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(10, 10, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(11, 11, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(12, 12, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(13, 13, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 2'),
(14, 14, '2026-07-01', '2026-08-01', 25600.00, 'ACTIVA', 'Nivel 2'),
(15, 15, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(16, 16, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 3'),
(17, 17, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(18, 18, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(19, 19, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(20, 20, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(21, 21, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 2'),
(22, 22, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(23, 23, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(24, 24, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(25, 25, '2026-07-01', '2026-08-01', 25600.00, 'ACTIVA', 'Nivel 1'),
(26, 26, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(27, 27, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 2'),
(28, 28, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 2'),
(29, 29, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(30, 30, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(31, 31, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(32, 32, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(33, 33, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(34, 34, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(35, 35, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(36, 36, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(37, 37, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(38, 38, '2026-07-01', '2026-08-01', 25600.00, 'ACTIVA', 'Nivel 1'),
(39, 39, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(40, 40, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(41, 41, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(42, 42, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(43, 43, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 2'),
(44, 44, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(45, 45, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(46, 46, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(47, 47, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(48, 48, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 3'),
(49, 49, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(50, 50, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(51, 51, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 1'),
(52, 52, '2026-07-01', '2026-08-01', 65800.00, 'ACTIVA', 'Nivel 1'),
(53, 53, '2026-07-01', '2026-08-01', 160000.00, 'ACTIVA', 'Nivel 2');

INSERT INTO control_i_s (fecha_hora_entrada, fecha_hora_salida, url_imagen, id_vehiculo, id_espacio, id_usuario) VALUES 
('2026-07-01 07:15:00', '2026-07-01 09:30:00', 'evidencia_4.jpg', 4, (SELECT id_espacio FROM espacio WHERE numero = 101 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 07:20:00', '2026-07-01 12:00:00', 'evidencia_5.jpg', 5, (SELECT id_espacio FROM espacio WHERE numero = 102 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 08:00:00', '2026-07-01 10:15:00', 'evidencia_6.jpg', 6, (SELECT id_espacio FROM espacio WHERE numero = 103 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 08:30:00', '2026-07-01 17:30:00', 'evidencia_7.jpg', 7, (SELECT id_espacio FROM espacio WHERE numero = 201 AND nivel = 'Nivel 2'), 2), 
('2026-07-01 09:00:00', '2026-07-01 11:00:00', 'evidencia_8.jpg', 8, (SELECT id_espacio FROM espacio WHERE numero = 104 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 09:15:00', '2026-07-01 14:15:00', 'evidencia_9.jpg', 9, (SELECT id_espacio FROM espacio WHERE numero = 105 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 09:45:00', '2026-07-01 11:15:00', 'evidencia_10.jpg', 10, (SELECT id_espacio FROM espacio WHERE numero = 106 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 10:00:00', '2026-07-01 10:45:00', 'evidencia_11.jpg', 11, (SELECT id_espacio FROM espacio WHERE numero = 107 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 10:30:00', '2026-07-01 13:00:00', 'evidencia_12.jpg', 12, (SELECT id_espacio FROM espacio WHERE numero = 108 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 11:00:00', '2026-07-01 16:00:00', 'evidencia_13.jpg', 13, (SELECT id_espacio FROM espacio WHERE numero = 202 AND nivel = 'Nivel 2'), 2), 
('2026-07-01 11:15:00', '2026-07-01 19:15:00', 'evidencia_14.jpg', 14, (SELECT id_espacio FROM espacio WHERE numero = 203 AND nivel = 'Nivel 2'), 2), 
('2026-07-01 11:30:00', '2026-07-01 12:30:00', 'evidencia_15.jpg', 15, (SELECT id_espacio FROM espacio WHERE numero = 109 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 12:00:00', '2026-07-01 15:30:00', 'evidencia_16.jpg', 16, (SELECT id_espacio FROM espacio WHERE numero = 301 AND nivel = 'Nivel 3'), 2), 
('2026-07-01 12:15:00', '2026-07-01 13:15:00', 'evidencia_17.jpg', 17, (SELECT id_espacio FROM espacio WHERE numero = 110 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 12:45:00', '2026-07-01 14:45:00', 'evidencia_18.jpg', 18, (SELECT id_espacio FROM espacio WHERE numero = 111 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 13:00:00', '2026-07-01 18:00:00', 'evidencia_19.jpg', 19, (SELECT id_espacio FROM espacio WHERE numero = 112 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 13:30:00', '2026-07-01 15:00:00', 'evidencia_20.jpg', 20, (SELECT id_espacio FROM espacio WHERE numero = 113 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 14:00:00', '2026-07-01 17:15:00', 'evidencia_21.jpg', 21, (SELECT id_espacio FROM espacio WHERE numero = 204 AND nivel = 'Nivel 2'), 2), 
('2026-07-01 14:15:00', '2026-07-01 15:15:00', 'evidencia_22.jpg', 22, (SELECT id_espacio FROM espacio WHERE numero = 114 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 14:30:00', '2026-07-01 16:30:00', 'evidencia_23.jpg', 23, (SELECT id_espacio FROM espacio WHERE numero = 115 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 15:00:00', '2026-07-01 16:15:00', 'evidencia_24.jpg', 24, (SELECT id_espacio FROM espacio WHERE numero = 116 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 15:15:00', '2026-07-01 18:15:00', 'evidencia_25.jpg', 25, (SELECT id_espacio FROM espacio WHERE numero = 117 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 15:45:00', '2026-07-01 16:45:00', 'evidencia_26.jpg', 26, (SELECT id_espacio FROM espacio WHERE numero = 118 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 16:00:00', '2026-07-01 20:00:00', 'evidencia_27.jpg', 27, (SELECT id_espacio FROM espacio WHERE numero = 205 AND nivel = 'Nivel 2'), 2), 
('2026-07-01 16:15:00', '2026-07-01 17:45:00', 'evidencia_28.jpg', 28, (SELECT id_espacio FROM espacio WHERE numero = 206 AND nivel = 'Nivel 2'), 2),  

-- SIGUIENTES 25 REGISTROS: Siguen dentro del parqueadero (fecha_hora_salida = NULL) 
('2026-07-01 16:30:00', NULL, 'evidencia_29.jpg', 29, (SELECT id_espacio FROM espacio WHERE numero = 119 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 17:00:00', NULL, 'evidencia_30.jpg', 30, (SELECT id_espacio FROM espacio WHERE numero = 302 AND nivel = 'Nivel 3'), 2), 
('2026-07-01 17:15:00', NULL, 'evidencia_31.jpg', 31, (SELECT id_espacio FROM espacio WHERE numero = 120 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 17:30:00', NULL, 'evidencia_32.jpg', 32, (SELECT id_espacio FROM espacio WHERE numero = 121 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 18:00:00', NULL, 'evidencia_33.jpg', 33, (SELECT id_espacio FROM espacio WHERE numero = 122 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 18:15:00', NULL, 'evidencia_34.jpg', 34, (SELECT id_espacio FROM espacio WHERE numero = 123 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 18:30:00', NULL, 'evidencia_35.jpg', 35, (SELECT id_espacio FROM espacio WHERE numero = 207 AND nivel = 'Nivel 2'), 2), 
('2026-07-01 19:00:00', NULL, 'evidencia_36.jpg', 36, (SELECT id_espacio FROM espacio WHERE numero = 124 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 19:15:00', NULL, 'evidencia_37.jpg', 37, (SELECT id_espacio FROM espacio WHERE numero = 208 AND nivel = 'Nivel 2'), 2), 
('2026-07-01 19:30:00', NULL, 'evidencia_38.jpg', 38, (SELECT id_espacio FROM espacio WHERE numero = 303 AND nivel = 'Nivel 3'), 2), 
('2026-07-01 19:45:00', NULL, 'evidencia_39.jpg', 39, (SELECT id_espacio FROM espacio WHERE numero = 125 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 20:00:00', NULL, 'evidencia_40.jpg', 40, (SELECT id_espacio FROM espacio WHERE numero = 126 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 20:15:00', NULL, 'evidencia_41.jpg', 41, (SELECT id_espacio FROM espacio WHERE numero = 127 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 20:30:00', NULL, 'evidencia_42.jpg', 42, (SELECT id_espacio FROM espacio WHERE numero = 128 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 21:00:00', NULL, 'evidencia_43.jpg', 43, (SELECT id_espacio FROM espacio WHERE numero = 209 AND nivel = 'Nivel 2'), 2), 
('2026-07-01 21:15:00', NULL, 'evidencia_44.jpg', 44, (SELECT id_espacio FROM espacio WHERE numero = 129 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 21:30:00', NULL, 'evidencia_45.jpg', 45, (SELECT id_espacio FROM espacio WHERE numero = 130 AND nivel = 'Nivel 1'), 2), 
('2026-07-01 22:00:00', NULL, 'evidencia_46.jpg', 46, (SELECT id_espacio FROM espacio WHERE numero = 1 AND nivel = 'Subterráneo'), 2), 
('2026-07-01 22:15:00', NULL, 'evidencia_47.jpg', 47, (SELECT id_espacio FROM espacio WHERE numero = 2 AND nivel = 'Subterráneo'), 2), 
('2026-07-01 22:30:00', NULL, 'evidencia_48.jpg', 48, (SELECT id_espacio FROM espacio WHERE numero = 304 AND nivel = 'Nivel 3'), 2), 
('2026-07-01 22:45:00', NULL, 'evidencia_49.jpg', 49, (SELECT id_espacio FROM espacio WHERE numero = 3 AND nivel = 'Subterráneo'), 2), 
('2026-07-01 23:00:00', NULL, 'evidencia_50.jpg', 50, (SELECT id_espacio FROM espacio WHERE numero = 4 AND nivel = 'Subterráneo'), 2), 
('2026-07-01 23:10:00', NULL, 'evidencia_51.jpg', 51, (SELECT id_espacio FROM espacio WHERE numero = 5 AND nivel = 'Subterráneo'), 2), 
('2026-07-01 23:15:00', NULL, 'evidencia_52.jpg', 52, (SELECT id_espacio FROM espacio WHERE numero = 6 AND nivel = 'Subterráneo'), 2), 
('2026-07-01 23:20:00', NULL, 'evidencia_53.jpg', 53, (SELECT id_espacio FROM espacio WHERE numero = 210 AND nivel = 'Nivel 2'), 2);

INSERT INTO pago (metodo_pago, valor_total, fecha_pago, id_ingreso) VALUES 
('EFECTIVO', 11500.00, '2026-07-01 09:30:00', 1), ('TRASNFERENCIA', 11250.00, '2026-07-01 12:00:00', 2),
('EFECTIVO', 11500.00, '2026-07-01 10:15:00', 3), ('TRASNFERENCIA', 45000.00, '2026-07-01 17:30:00', 4),
('EFECTIVO', 10000.00, '2026-07-01 11:00:00', 5), ('EFECTIVO', 12000.00, '2026-07-01 14:15:00', 6),
('TRASNFERENCIA', 7500.00, '2026-07-01 11:15:00', 7), ('EFECTIVO', 3750.00, '2026-07-01 10:45:00', 8),
('EFECTIVO', 6000.00, '2026-07-01 13:00:00', 9), ('TRASNFERENCIA', 25000.00, '2026-07-01 16:00:00', 10),
('EFECTIVO', 6000.00, '2026-07-01 19:15:00', 11), ('EFECTIVO', 2400.00, '2026-07-01 12:30:00', 12),
('TRASNFERENCIA', 17500.00, '2026-07-01 15:30:00', 13), ('EFECTIVO', 750.00, '2026-07-01 13:15:00', 14),
('EFECTIVO', 10000.00, '2026-07-01 14:45:00', 15), ('TRASNFERENCIA', 25000.00, '2026-07-01 18:00:00', 16),
('EFECTIVO', 3600.00, '2026-07-01 15:00:00', 17), ('EFECTIVO', 16500.00, '2026-07-01 17:15:00', 18),
('TRASNFERENCIA', 5000.00, '2026-07-01 15:15:00', 19), ('EFECTIVO', 4800.00, '2026-07-01 16:30:00', 20),
('EFECTIVO', 6250.00, '2026-07-01 16:15:00', 21), ('TRASNFERENCIA', 15000.00, '2026-07-01 18:15:00', 22),
('EFECTIVO', 750.00, '2026-07-01 16:45:00', 23), ('EFECTIVO', 20000.00, '2026-07-01 20:00:00', 24),
('TRASNFERENCIA', 7500.00, '2026-07-01 17:45:00', 25), ('EFECTIVO', 7200.00, '2026-07-01 19:30:00', 26),
('EFECTIVO', 7500.00, '2026-07-01 18:30:00', 27), ('TRASNFERENCIA', 9600.00, '2026-07-01 21:15:00', 28),
('EFECTIVO', 3600.00, '2026-07-01 19:00:00', 29), ('EFECTIVO', 8750.00, '2026-07-01 19:45:00', 30),
('TRASNFERENCIA', 4800.00, '2026-07-01 20:15:00', 31), ('EFECTIVO', 20000.00, '2026-07-01 22:30:00', 32),
('EFECTIVO', 5000.00, '2026-07-01 20:00:00', 33), ('TRASNFERENCIA', 6000.00, '2026-07-01 21:45:00', 34),
('EFECTIVO', 2400.00, '2026-07-01 20:30:00', 35), ('EFECTIVO', 6250.00, '2026-07-01 21:00:00', 36),
('TRASNFERENCIA', 15000.00, '2026-07-01 23:00:00', 37), ('EFECTIVO', 6250.00, '2026-07-01 21:30:00', 38),
('EFECTIVO', 7500.00, '2026-07-01 22:00:00', 39), ('TRASNFERENCIA', 12500.00, '2026-07-01 23:30:00', 40),
('EFECTIVO', 7500.00, '2026-07-01 22:45:00', 41), ('EFECTIVO', 5400.00, '2026-07-01 23:45:00', 42),
('TRASNFERENCIA', 5000.00, '2026-07-01 23:00:00', 43), ('EFECTIVO', 3600.00, '2026-07-01 23:45:00', 44),
('EFECTIVO', 5000.00, '2026-07-01 23:30:00', 45), ('TRASNFERENCIA', 5850.00, '2026-07-01 23:55:00', 46),
('EFECTIVO', 2250.00, '2026-07-01 23:45:00', 47), ('EFECTIVO', 1800.00, '2026-07-01 23:55:00', 48),
('TRASNFERENCIA', 1200.00, '2026-07-01 23:45:00', 49), ('EFECTIVO', 2500.00, '2026-07-01 23:50:00', 50);