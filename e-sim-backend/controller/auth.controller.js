import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const register = async (req,res) => {
    try {
        const { email, password,FirstName, LastName, Country} = req.body;

        const lowerCaseEmail = email.toLowerCase();
         const existingUser = await User.findOne({ email: lowerCaseEmail });

        if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, Country: "US", LastName, FirstName});
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.log(error)
        res.status(500).json({ error: 'Registration failed' });
        }
}

export const login = async (req,res,next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(401).json({ error: 'Authentication failed' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
        return res.status(401).json({ error: 'Password is wrong' });
        }
        const token = jwt.sign({ userId: user._id, email : user.email }, 'your-secret-key', {
        expiresIn: '200h',
        });
        res.status(200).json({ token });
        } catch (error) {
            console.log(error)
        res.status(500).json({ error: 'Login failed' });
        }
}

export const getUser = async (req,res,next) => {
    const {userEmail} = req
    try {
        console.log(userEmail)
        const user = await User.findOne({ email:userEmail });

        res.status(200).json({user})
        } catch (error) {
            console.log(error)
        res.status(500).json({ error: 'Login failed' });
        }
}