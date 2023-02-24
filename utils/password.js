function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return passwordRegex.test(password);
}

// function validatePassword(password) {
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
//     if (!passwordRegex.test(password)) {
//         return {
//             isValid: false,
//             error: "Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
//         };
//     }
//     return { isValid: true };
// }

module.exports = {
    validatePassword
}
