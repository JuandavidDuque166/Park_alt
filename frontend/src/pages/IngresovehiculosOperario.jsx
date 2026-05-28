import React, { useState } from 'react';
import './ingresovehiculosOperario.css'; 

const IngresoVehiculos = () => {
    const [active, setActive] = useState(true);

    return (
        <div className="ingreso-main-container">
            {/* Título de la página fuera de la tarjeta */}
            <div className="page-header">
                <h2>Ingreso Vehículos</h2>
                <p>Gestión en altura y subterráneo</p>
            </div>

            {/* LA TARJETA BLANCA PRINCIPAL */}
            <div className="form-card-container">
                <div className="card-header-flex">
                    <div className="title-group">
                        <div className="card-title-text">
                            <h3>Registro de Ingreso de Vehículos</h3>
                            <p>Complete los datos del vehículo que ingresa</p>
                        </div>
                    </div>
                    <div className="spaces-status">
                        <p>Espacios disponibles</p>
                        <span className="available-count">98 / 100</span>
                    </div>
                </div>

                {/* GRID DEL FORMULARIO */}
                <form className="form-grid-layout">
                    <div className="form-input-group">
                        <label>Placa *</label>
                        <input type="text" placeholder="ABC123" required />
                    </div>
                    <div className="form-input-group">
                        <label>Tipo de Vehículo *</label>
                        <select required>
                            <option value="">Seleccione</option>
                            <option value="carro">Carro</option>
                            <option value="moto">Moto</option>
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label>Nivel / Zona *</label>
                        <select required>
                            <option value="">Seleccione</option>
                            <option value="nivel1">Nivel 1</option>
                            <option value="nivel2">Nivel 2</option>
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label>Foto (URL)</label>
                        <input type="text" placeholder="https://..." />
                    </div>
                </form>

                <div className="automatic-info-box">
                    <p><strong>Fecha y hora:</strong> Se registrarán automáticamente al momento del ingreso</p>
                    <p><strong>Vigilante:</strong> Juan Vigilante</p>
                </div>

                <div className="form-actions-buttons">
                    <button type="submit" className={`btn-primary ${active ? 'active' : ''}`}>Registrar Ingreso</button>
                    <button type="reset" className="btn-secondary">Limpiar</button>
                </div>
            </div>
        </div>
    );
};

export default IngresoVehiculos;