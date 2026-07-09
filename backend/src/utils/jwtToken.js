const jwt = require ('jsonwebtoken');

const signToken = (id, roleId, expiresIn = process.env.JWT_EXPIRES_IN || '15m') => {
    return jwt.sign({ id, role: roleId }, process.env.JWT_SECRET, {
        expiresIn
    });
};

module.exports = {signToken};