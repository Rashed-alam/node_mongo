const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // expires after 5 minutes (300 seconds)
    },
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
