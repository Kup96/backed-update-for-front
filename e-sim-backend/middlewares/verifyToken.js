import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {

    const token = req.header('Authorization');
   
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;

    next();

    } catch (error) {
         res.status(401).json({ error: 'You are Unauthorized'});
    }
};