const db = require('../config/db');

const TarifaModel = {
    async obtenerTodas() {
        // Asumiendo una tabla 'tarifas' con columnas: tipo, valor_hora, valor_pernocta, valor_mensualidad
        const [rows] = await db.query('SELECT * FROM tarifas');
        return rows;
    }
};

module.exports = TarifaModel;