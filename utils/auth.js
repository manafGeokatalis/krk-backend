const jwt = require('jsonwebtoken');
const { jwt_secret } = require('../configs/auth');

module.exports.verifyToken = (token) => {
    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, jwt_secret);
        return decoded; // Return the decoded payload
    } catch (error) {
        console.error('Invalid token:', error.message);
        return null; // Return null if the token is invalid
    }
}