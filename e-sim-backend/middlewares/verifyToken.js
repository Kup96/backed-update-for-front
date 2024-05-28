import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {

    const authHeader = req.header('Authorization');



    const token = authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });


    console.log(token)
    try {
        console.log('hererere')
        console.log(token)
        console.log(process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)
        console.log('decoded')
        req.userId = decoded.userId;
        req.userEmail = decoded.userEmail;

    next();

    } catch (error) {
        console.error('JWT verification error:', error);
         res.status(401).json({ error: 'You are Unauthorized'});
    }
};
