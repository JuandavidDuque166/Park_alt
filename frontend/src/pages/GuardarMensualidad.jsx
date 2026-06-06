const guardarMensualidad = async (e) => {
    e.preventDefault();
    
    const payload = {   
        placa: formData.placa,
        tipo: formData.tipo, 
        propietario: formData.propietario,
        telefono: formData.telefono,
        fecha_inicio: formData.vigencia,
        fecha_fin: formData.fecha_fin,
        valor: formData.valor
    };

    try {
        if (modoEdicion) {
            await api.put(`/mensualidades/${formData.id}`, payload);
        } else {
            await api.post('/mensualidades', payload);
        }
        setModalAbierto(false);
        cargarMensualidades();
        toast.success("Mensualidad guardada correctamente");
    } catch (err) {
        toast.error("Error: Verifica que los campos sean correctos");
    }
};