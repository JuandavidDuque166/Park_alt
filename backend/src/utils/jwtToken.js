const jwt = require ('jsonwebtoken');

const signToken = (id, roleId) => {
    return jwt.sign({ id, role: roleId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

module.exports = {signToken};