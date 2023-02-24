

const mongoose = require('mongoose');

const emailVerificationTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: '5m'
    }
});

const EmailVerificationToken = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);

module.exports = EmailVerificationToken;
