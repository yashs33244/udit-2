import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db';
import { sendEmail } from '../utils/email';

// Request to update user profile
export const requestUpdate = async (req: Request, res: Response) => {
  try {
    const { newUsername, newEmail } = req.body;
    const userId = req.user.id;

    // Check if all fields are provided
    if (!newUsername || !newEmail) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if new email is already in use by another user
    if (newEmail !== req.user.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: newEmail,
          id: { not: userId }
        }
      });
      
      if (emailExists) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    // Create a unique token for the update request
    const token = uuidv4();

    // Find existing update request
    const existingRequest = await prisma.updateRequest.findFirst({
      where: { userId }
    });

    if (existingRequest) {
      // Update existing request
      await prisma.updateRequest.update({
        where: { id: existingRequest.id },
        data: {
          newUsername,
          newEmail,
          token
        }
      });
    } else {
      // Create new request
      await prisma.updateRequest.create({
        data: {
          userId,
          newUsername,
          newEmail,
          token
        }
      });
    }

    // Send confirmation email
    await sendEmail({
      email: req.user.email,
      token,
      type: 'update'
    });

    return res.status(200).json({ message: 'Update confirmation email sent' });
  } catch (error) {
    console.error('Update request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify and complete the user update
export const verifyUpdate = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Update token is required' });
    }

    // Find the update request with the given token
    const updateRequest = await prisma.updateRequest.findUnique({
      where: { token }
    });

    if (!updateRequest) {
      return res.status(400).json({ error: 'Invalid or expired update token' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: updateRequest.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: updateRequest.newUsername,
        email: updateRequest.newEmail
      }
    });

    // Delete the update request
    await prisma.updateRequest.delete({
      where: { id: updateRequest.id }
    });

    return res.status(200).json({ 
      message: 'User profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error('Update verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Request account deletion
export const requestDeletion = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Create a unique token for the deletion request
    const token = uuidv4();

    // Find existing deletion request
    const existingRequest = await prisma.deletionRequest.findFirst({
      where: { userId }
    });

    if (existingRequest) {
      // Update existing request
      await prisma.deletionRequest.update({
        where: { id: existingRequest.id },
        data: { token }
      });
    } else {
      // Create new request
      await prisma.deletionRequest.create({
        data: {
          userId,
          token
        }
      });
    }

    // Send confirmation email
    await sendEmail({
      email: req.user.email,
      token,
      type: 'deletion'
    });

    return res.status(200).json({ message: 'Deletion confirmation email sent' });
  } catch (error) {
    console.error('Deletion request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify and complete the account deletion
export const verifyDeletion = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Deletion token is required' });
    }

    // Find the deletion request with the given token
    const deletionRequest = await prisma.deletionRequest.findUnique({
      where: { token }
    });

    if (!deletionRequest) {
      return res.status(400).json({ error: 'Invalid or expired deletion token' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: deletionRequest.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's update requests if any
    await prisma.updateRequest.deleteMany({
      where: { userId: user.id }
    });

    // Delete the deletion request
    await prisma.deletionRequest.delete({
      where: { id: deletionRequest.id }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });

    return res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Deletion verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get the current user's profile
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      verified: user.verified,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 