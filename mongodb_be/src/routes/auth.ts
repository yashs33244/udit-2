import { Router } from 'express';
import * as authController from '../controllers/auth';

const router = Router();

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Verify user email
router.get('/verify/:token', authController.verify);

export default router; 