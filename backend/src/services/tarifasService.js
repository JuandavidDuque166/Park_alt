export const tarifasService = {
    async obtenerTarifas() {
        const respuesta = await api.get('/tarifas');
        return respuesta.data;
    }
};