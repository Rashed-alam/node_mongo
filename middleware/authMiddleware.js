// const authMiddleware = (req, res, next) => {
//     console.log(req.user);
//     if (!req.user) {
//         return res.status(401).json({message: 'Unauthorized'});
//     }
//     next();
// };


const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
    console.log("req, res, next");
    // Retrieve the authorization token from the request headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // If the authorization header is missing or doesn't start with 'Bearer', return a 401 Unauthorized response
        return res.status(401).json({message: 'Authorization token missing or invalid'});
    }

    // Extract the token from the header and verify its authenticity
    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        // If the token is invalid, return a 401 Unauthorized response
        return res.status(401).json({message: 'Authorization token missing or invalid'});
    }

    // Check if the user has the necessary permissions to access the requested resource
    // if (permissions && !permissions.some(p => req.user.permissions.includes(p))) {
    //     // If the user does not have the necessary permissions, return a 403 Forbidden response
    //     return res.status(403).json({ message: 'You do not have permission to access this resource' });
    // }

    // If the token is valid and the user has the necessary permissions, continue to the next middleware or route handler
    next();
}


module.exports = {
    authorize,
};
