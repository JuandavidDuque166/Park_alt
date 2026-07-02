const normalizarTexto = (value) => String(value ?? '').trim();

const normalizarNivelServicio = (nivelServicio) => {
    const texto = normalizarTexto(nivelServicio);
    if (!texto) return '';

    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
};

const normalizarNivelServicioParaGuardar = (nivelServicio) => {
    const nivelNormalizado = normalizarNivelServicio(nivelServicio);

    switch (nivelNormalizado) {
        case 'NIVEL 1':
            return 'Nivel 1';
        case 'NIVEL 2':
            return 'Nivel 2';
        case 'NIVEL 3':
            return 'Nivel 3';
        case 'SUBTERRANEO':
            return 'Subterráneo';
        default:
            return null;
    }
};

const esNivelServicioValido = (nivelServicio) => Boolean(normalizarNivelServicioParaGuardar(nivelServicio));

module.exports = {
    normalizarNivelServicio,
    normalizarNivelServicioParaGuardar,
    esNivelServicioValido
};
