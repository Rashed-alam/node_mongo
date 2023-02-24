const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {authorize} = require('../middleware/authMiddleware')

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/send-otp', userController.sendOTP);
router.post('/verify-otp', userController.verifyOTP);
router.post('/send-verification-email', userController.sendEmailVerificationMail);
router.post('/verify-email', userController.verifyEmail);
router.post('/forget-pass', userController.forgotPassword);
router.post('/reset-pass', userController.resetPassword);
router.post('/change-password', authorize, userController.verifyEmail);
router.get('/get-profile', userController.getProfile);

module.exports = router;
