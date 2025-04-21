import { Router } from 'express';
import * as userController from '../controllers/user';
import { auth } from '../middlewares/auth';

const router = Router();

// Get current user profile (protected route)
router.get('/me', auth, userController.getUser);

// Request to update user profile (protected route)
router.post('/update-request', auth, userController.requestUpdate);

// Verify and complete the update
router.get('/update-verify/:token', userController.verifyUpdate);

// Request account deletion (protected route)
router.post('/delete-request', auth, userController.requestDeletion);

// Verify and complete the deletion
router.get('/delete-verify/:token', userController.verifyDeletion);

export default router; 