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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.verifyDeletion = exports.requestDeletion = exports.verifyUpdate = exports.requestUpdate = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../config/db");
const email_1 = require("../utils/email");
// Request to update user profile
const requestUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newUsername, newEmail } = req.body;
        const userId = req.user.id;
        // Check if all fields are provided
        if (!newUsername || !newEmail) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }
        // Check if new email is already in use by another user
        if (newEmail !== req.user.email) {
            const emailExists = yield db_1.prisma.user.findFirst({
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
        const token = (0, uuid_1.v4)();
        // Find existing update request
        const existingRequest = yield db_1.prisma.updateRequest.findFirst({
            where: { userId }
        });
        if (existingRequest) {
            // Update existing request
            yield db_1.prisma.updateRequest.update({
                where: { id: existingRequest.id },
                data: {
                    newUsername,
                    newEmail,
                    token
                }
            });
        }
        else {
            // Create new request
            yield db_1.prisma.updateRequest.create({
                data: {
                    userId,
                    newUsername,
                    newEmail,
                    token
                }
            });
        }
        // Send confirmation email
        yield (0, email_1.sendEmail)({
            email: req.user.email,
            token,
            type: 'update'
        });
        return res.status(200).json({ message: 'Update confirmation email sent' });
    }
    catch (error) {
        console.error('Update request error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.requestUpdate = requestUpdate;
// Verify and complete the user update
const verifyUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ error: 'Update token is required' });
        }
        // Find the update request with the given token
        const updateRequest = yield db_1.prisma.updateRequest.findUnique({
            where: { token }
        });
        if (!updateRequest) {
            return res.status(400).json({ error: 'Invalid or expired update token' });
        }
        // Find the user
        const user = yield db_1.prisma.user.findUnique({
            where: { id: updateRequest.userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Update the user
        const updatedUser = yield db_1.prisma.user.update({
            where: { id: user.id },
            data: {
                username: updateRequest.newUsername,
                email: updateRequest.newEmail
            }
        });
        // Delete the update request
        yield db_1.prisma.updateRequest.delete({
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
    }
    catch (error) {
        console.error('Update verification error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.verifyUpdate = verifyUpdate;
// Request account deletion
const requestDeletion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Create a unique token for the deletion request
        const token = (0, uuid_1.v4)();
        // Find existing deletion request
        const existingRequest = yield db_1.prisma.deletionRequest.findFirst({
            where: { userId }
        });
        if (existingRequest) {
            // Update existing request
            yield db_1.prisma.deletionRequest.update({
                where: { id: existingRequest.id },
                data: { token }
            });
        }
        else {
            // Create new request
            yield db_1.prisma.deletionRequest.create({
                data: {
                    userId,
                    token
                }
            });
        }
        // Send confirmation email
        yield (0, email_1.sendEmail)({
            email: req.user.email,
            token,
            type: 'deletion'
        });
        return res.status(200).json({ message: 'Deletion confirmation email sent' });
    }
    catch (error) {
        console.error('Deletion request error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.requestDeletion = requestDeletion;
// Verify and complete the account deletion
const verifyDeletion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ error: 'Deletion token is required' });
        }
        // Find the deletion request with the given token
        const deletionRequest = yield db_1.prisma.deletionRequest.findUnique({
            where: { token }
        });
        if (!deletionRequest) {
            return res.status(400).json({ error: 'Invalid or expired deletion token' });
        }
        // Find the user
        const user = yield db_1.prisma.user.findUnique({
            where: { id: deletionRequest.userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Delete user's update requests if any
        yield db_1.prisma.updateRequest.deleteMany({
            where: { userId: user.id }
        });
        // Delete the deletion request
        yield db_1.prisma.deletionRequest.delete({
            where: { id: deletionRequest.id }
        });
        // Delete the user
        yield db_1.prisma.user.delete({
            where: { id: user.id }
        });
        return res.status(200).json({ message: 'User account deleted successfully' });
    }
    catch (error) {
        console.error('Deletion verification error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.verifyDeletion = verifyDeletion;
// Get the current user's profile
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        return res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            verified: user.verified,
            createdAt: user.createdAt
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getUser = getUser;
