// controllers/userController.js

const User = require('../models/user');
const Otp = require('../models/otp');
const EmailVerificationToken = require('../models/emailVerificationToken');
const {generateOTP, verifyOTP, deleteOTP, sendOtp} = require('../utils/otp');
const {generateEmailVerificationToken, verifyEmailVerificationToken} = require('../utils/email');
const {sendEmailVerificationMail} = require('../utils/email');
const {validatePassword} = require('../utils/password');
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
const jwt = require('jsonwebtoken');


exports.sendEmailVerificationMail = async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});

        if (!user) {
            return res.status(400).json({error: 'Invalid email'});
        }

        const token = generateEmailVerificationToken(user._id);

        const verificationUrl = `${process.env.APP_BASE_URL}/verify-email/${token}`;

        await sendEmailVerificationMail(email, verificationUrl);

        res.status(200).json({message: 'Email verification mail sent successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.verifyEmail = async (req, res) => {
    const {token} = req.body;

    try {
        const {userId, exp} = verifyEmailVerificationToken(token);

        if (!userId || !exp) {
            return res.status(400).json({error: 'Invalid verification link'});
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({error: 'Invalid verification link'});
        }

        if (user.isEmailVerified) {
            return res.status(400).json({error: 'Email already verified'});
        }

        user.isEmailVerified = true;
        await user.save();

        res.status(200).json({message: 'Email verified successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.register = async (req, res) => {
    const {fullName, phoneNumber, email, password} = req.body;

    try {
        if (!validatePassword(password)) {
            return res.status(400).json({message: 'Password is not valid'});
        }

        // Check if phone number and email are not taken and verified
        const existingUserWithPhoneNumber = await User.findOne({phoneNumber});
        const existingUserWithEmail = await User.findOne({email});


        // console.log();

        if (existingUserWithPhoneNumber && existingUserWithPhoneNumber.isPhoneNumberVerified) {
            return res.status(400).json({error: 'Phone number already taken'});
        }

        if (existingUserWithEmail && existingUserWithEmail.isEmailVerified) {
            return res.status(400).json({error: 'Email already taken'});
        }

        const existingUserWithEmailAndPhone = await User.findOne({email, phoneNumber});

        if (existingUserWithEmailAndPhone) {
            if (existingUserWithEmailAndPhone.isPhoneNumberVerified && existingUserWithEmailAndPhone.isEmailVerified) {
                return res.status(400).json({error: 'Phone number and email already taken'});
            } else if (existingUserWithEmailAndPhone.isPhoneNumberVerified) {
                return res.status(400).json({error: 'Phone number already taken'});
            } else if (existingUserWithEmailAndPhone.isEmailVerified) {
                return res.status(400).json({error: 'Email already taken'});
            } else {
                // Delete existing user with unverified phone number and email
                await User.findOneAndDelete({email, phoneNumber});
            }
        }

        // Create new user
        const newUser = new User({fullName, phoneNumber, email, password});

        // Generate OTP and email verification token
        const code = generateOTP(5);
        const emailVerificationToken = generateEmailVerificationToken();

        // Save OTP and email verification token
        await Otp.create({phoneNumber, code});
        // const otpCode = generateOTP();

        await sendOtp(phoneNumber, code);

        await EmailVerificationToken.create({user: newUser, token: emailVerificationToken});

        // Send email verification email
        await sendEmailVerificationMail(email, emailVerificationToken);


        // Save new user
        await newUser.save();

        res.status(201).json({message: 'User created successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.login = async (req, res) => {
    const {phoneNumber, password} = req.body;

    try {
        // if (!validatePassword(password)) {
        //     return res.status(400).json({message: 'Password is not valid'});
        // }

        // Find user by phone number
        const user = await User.findOne({phoneNumber});
        if (!user) {
            return res.status(400).json({error: 'Invalid phone number or password'});
        }


        // Check if password is correct
        user.comparePassword(password, function (err, isMatch) {
            if (err) {
                console.error(err);
                return res.status(500).json({error: 'Internal server error'});
            }

            if (!isMatch) {
                return res.status(400).json({error: 'Invalid phone number or password'});
            }

            // Check if phone number is verified
            if (!user.isPhoneNumberVerified) {
                return res.status(400).json({error: 'Phone number not verified'});
            }


            const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

// send the token back in the response header
            res.setHeader('Authorization', `Bearer ${token}`);
            res.status(200).json({message: 'Logged in successfully'});
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.sendOTP = async (req, res) => {
    const {phoneNumber} = req.body;
    try {
        const otpCode = generateOTP(5);
        console.log(otpCode)
        const otp = new Otp({
            phoneNumber: phoneNumber,
            code: otpCode,
        });
        console.log(otp)
        await otp.save(); // Save the OTP to the database
        sendOtp(phoneNumber, otpCode);
        res.status(200).json({message: 'OTP sent successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.verifyOTP = async (req, res) => {
    const {phoneNumber, code} = req.body;


    try {
        const user = await User.findOne({phoneNumber});
        const otp = await Otp.findOne({phoneNumber: phoneNumber, code: code}).exec();
        if (!otp) {
            // throw new Error('Invalid OTP');
            return res.status(400).json({error: 'Invalid OTP'});
        }

        console.log('here  ', user,
            otp)

        console.log(otp.code)
        const now = new Date();
        console.log(now)
        const createdAt = new Date(otp.createdAt);
        const elapsedTime = now.getTime() - createdAt.getTime();

        if (elapsedTime > OTP_EXPIRATION_TIME) {
            // throw new Error('OTP expired');
            return res.status(400).json({error: 'OTP expired'});
        }
        console.log("here")
        // const otp = await Otp.findOne({phoneNumber});

        if (!otp) {
            return res.status(400).json({error: 'Invalid phone number or OTP'});
        }

        const isVerified = verifyOTP(code, otp.code);
        // const isVerified = verifyOTP(otp, otp.otp);

        if (!isVerified) {
            return res.status(400).json({error: 'Invalid phone number or OTP'});
        }

        user.isPhoneNumberVerified = true;

        await user.save();
        await deleteOTP(user._id);
        res.status(200).json({message: 'Phone number verified successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Internal server error'});
    }
};

exports.forgotPassword = async (req, res) => {
    const {phoneNumber} = req.body;

    // Check if user with this phone number exists
    const user = await User.findOne({phoneNumber});


    if (!user) {
        return res.status(400).json({message: 'User not found'});
    }

    // Generate OTP code and save it to the database
    // const otp = generateOTP();
    const otpCode = generateOTP(5);
    const otp = new Otp({
        phoneNumber: phoneNumber,
        code: otpCode,
    });
    await otp.save(); // Save the OTP to the database
    sendOtp(phoneNumber, otpCode);
    // await saveOTP(user._id, otp);
    // Send OTP code to user's phone number via SMS

    // After sending the SMS, return a success response to the user
    return res.json({message: 'OTP code sent to your phone number'});
}

exports.resetPassword = async (req, res) => {
    const {phoneNumber, code, password} = req.body;

    // Check if user with this phone number exists
    if (!validatePassword(password)) {
        return res.status(400).json({message: 'Password is not valid'});
    }

    const user = await User.findOne({phoneNumber});
    if (!user) {
        return res.status(400).json({message: 'User not found'});
    }


    const otp = await Otp.findOne({phoneNumber: phoneNumber, code: code}).exec();

    console.log(otp)
    if (!otp) {
        // throw new Error('Invalid OTP');
        return res.status(400).json({message: 'Invalid OTP'});
    }

    const now = new Date();
    const createdAt = new Date(otp.createdAt);
    const elapsedTime = now.getTime() - createdAt.getTime();

    if (elapsedTime > OTP_EXPIRATION_TIME) {
        // throw new Error('OTP expired');
        return res.status(400).json({message: 'OTP expired'});
    }


    // Verify the OTP code
    const isOTPValid = verifyOTP(otp.code, code);
    if (!isOTPValid) {
        return res.status(400).json({message: 'Invalid OTP code'});
    }

    // Reset the user's password
    user.password = password;
    await user.save();

    // Delete the OTP code from the database


    await deleteOTP(code);

    // Return a success response to the user
    return res.json({message: 'Password reset successful'});
}

exports.changePassword = async (req, res) => {
    const {phoneNumber, currentPassword, newPassword} = req.body;

    const user = await User.findOne({phoneNumber});
    if (!user) {
        return res.status(400).json({message: 'User not found'});
    }

    if (!validatePassword(newPassword)) {
        return res.status(400).json({message: 'Password is not valid'});

    }
    // Get the user object from the database
    // const user = await getUserById(userId);

    // Verify that the current password matches the user's existing password
    if (user.password !== currentPassword) {
        throw new Error('Current password is incorrect');
    }

    // Update the user object with the new password
    user.password = newPassword;

    // Update the user object in the database
    await user.save();

    // Return a success message
    return 'Password updated successfully';
}

exports.getProfile = async (req, res) => {
    try {
        // Get the JWT token from the Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        // Verify the JWT token and extract the user ID
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Retrieve the user's profile from the database
        const user = await User.findById(userId);

        // If user is not found, return an error response
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        // Construct the user's profile object
        const userProfile = {
            name: user.fullName,
            phoneNumber: user.phoneNumber,
            emailAddress: user.email,
            isPhoneNumberVerified: user.isPhoneNumberVerified,
            isEmailAddressVerified: user.isEmailVerified,
        };

        console.log(userProfile)

        // Return the user's profile in the response
        return res.json(userProfile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Server error'});
    }
}

