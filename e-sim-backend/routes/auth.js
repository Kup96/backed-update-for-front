import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/UserSchema.js'
import { getUser, login, register } from '../controller/auth.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const SECRET = process.env.DB_SECRET;
router.use(express.json());

router.get('/user', verifyToken, getUser)

router.post('/register', register)
router.post('/login', login);

export default router
