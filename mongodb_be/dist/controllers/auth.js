"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const db_1 = require("../config/db");
const email_1 = require("../utils/email");
// Register a new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        // Check if all fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }
        // Check if user already exists
        const existingUser = yield db_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Create verification token
        const verificationToken = (0, uuid_1.v4)();
        // Create new user
        const newUser = yield db_1.prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                verificationToken,
                verified: false
            },
        });
        // Send verification email
        yield (0, email_1.sendEmail)({
            email,
            token: verificationToken,
            type: 'verification'
        });
        return res.status(201).json({ message: 'Verification email sent' });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.register = register;
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }
        // Find user
        const user = yield db_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Check if user is verified
        if (!user.verified) {
            return res.status(401).json({ error: 'Please verify your email before logging in' });
        }
        // Verify password
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // Return user data without password
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            verified: user.verified,
            createdAt: user.createdAt
        };
        return res.status(200).json({
            message: 'Login successful',
            user: userData,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.login = login;
// Verify user email
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }
        // Find user with the verification token
        const user = yield db_1.prisma.user.findFirst({
            where: { verificationToken: token },
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }
        // Update user to verified and remove verification token
        yield db_1.prisma.user.update({
            where: { id: user.id },
            data: {
                verified: true,
                verificationToken: null,
            },
        });
        return res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.verify = verify;
