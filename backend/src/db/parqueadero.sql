CREATE DATABASE parqueadero;
USE parqueadero;
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
CREATE TABLE vehiculo (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    id_tipo INT NOT NULL,

    CONSTRAINT fk_vehiculo_tipo
    FOREIGN KEY (id_tipo)
    REFERENCES tipo_vehiculo(id_tipo)
);
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('ADMINISTRADOR','VIGILANTE') NOT NULL,
    estado BOOLEAN DEFAULT TRUE
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
CREATE TABLE espacio (
    id_espacio INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL,
    nivel VARCHAR(20) NOT NULL
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
    metodo_pago ENUM('EFECTIVO','NEQUI','DAVIPLATA','TARJETA') NOT NULL,
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
INSERT INTO tipo_vehiculo(nombre)
VALUES
('CARRO'),
('MOTO'),
('BICICLETA');

INSERT INTO roles (nombre) 
VALUES 
('Administrador'),
('Vigilante');

INSERT INTO permisos (nombre, descripcion)
Values
('Crear','Permite crear nuevos registros'),
('Leer','Permite visualizar el registro'),
('Actualizar','Permite modificar registros existentes'),
('Eliminar','Permite eliminar registros');

INSERT INTO rol_permiso (id_rol, id_permiso) 
VALUES 
(1, 1),
(1, 2),
(1, 3),
(1, 4);

INSERT INTO rol_permiso (id_rol, id_permiso)
VALUES
(2, 1),
(2, 2),
(2, 3);

INSERT INTO usuario(nombre, email, contrasena, rol)
VALUES
('admin', 'juandaduque880@gmail.com','123456', 'ADMINISTRADOR'),
('vigilante1', 'empleado@gmail.com', '123456', 'VIGILANTE');

INSERT INTO espacio(numero, nivel)
VALUES
(1, 'SOTANO'),
(2, 'ALTURA');

-- VEHÍCULOS ACTUALMENTE DENTRO DEL PARQUEADERO
SELECT v.placa, c.fecha_hora_entrada
FROM control_i_s c
INNER JOIN vehiculo v
ON c.id_vehiculo = v.id_vehiculo
WHERE c.fecha_hora_salida IS NULL;

-- ESPACIOS OCUPADOS
SELECT e.numero, e.nivel
FROM espacio e
INNER JOIN control_i_s c
ON e.id_espacio = c.id_espacio
WHERE c.fecha_hora_salida IS NULL;

-- TOTAL RECAUDADO
SELECT SUM(valor_total) AS total_recaudado
FROM pago;
