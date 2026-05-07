/**
 * Wrapper para funciones asincronas en Express
 * Captura automaticamente errores y los pasa al middleware de manejo de errores
 * Evita tener que escribir try/catch en cada controlador
 */
module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};