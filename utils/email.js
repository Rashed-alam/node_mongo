const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET;

// Generate a JWT token containing the user ID and a UUID
function generateEmailVerificationToken(userId) {
    const uuid = uuidv4();
    const payload = {sub: userId, uuid};
    const options = {expiresIn: '24h'};
    return jwt.sign(payload, JWT_SECRET, options);
}

// Verify if a provided JWT token matches the expected user ID and UUID
function verifyEmailVerificationToken(token, expectedUserId, expectedUuid) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const {sub: userId, uuid} = decoded;
        return !(userId !== expectedUserId || uuid !== expectedUuid);

    } catch (err) {
        return false;
    }
}

async function sendEmailVerificationMail(to, token) {
    console.log(to, token)
}

module.exports = {
    verifyEmailVerificationToken, sendEmailVerificationMail,generateEmailVerificationToken
}
