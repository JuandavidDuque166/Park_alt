const guardarCambios = async () => {
    await api.put(`/tarifas/${tarifaSeleccionada.id_tarifa}`, formularioData);
    setModalAbierto(false);
    cargarTarifas(); // Recarga los datos para que se vea el cambio
};