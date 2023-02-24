// Generate a random numeric OTP of a specified length
const OTP = require('../models/otp');

function generateOTP(length) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

// Verify if a provided OTP matches a given value
function verifyOTP(providedOTP, originalOTP) {
    return providedOTP === originalOTP;
}

// function deleteOTP(){
async function deleteOTP(otp) {
    try {
        const deletedOTP = await OTP.findOneAndDelete({code: otp});
        if (!deletedOTP) {
            throw new Error('OTP not found');
        }
        console.log(`OTP deleted: ${otp}`);
    } catch (error) {
        console.error(`Error deleting OTP: ${error}`);
    }
}


function sendOtp(to, otp) {
    console.log(to,otp);
}


module.exports = {
    sendOtp, deleteOTP, generateOTP, verifyOTP
}

// }
// function verifyOTPExpiry(providedOTP, originalOTP) {
//     return providedOTP === originalOTP;
// }
