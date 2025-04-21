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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, token, type }) {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        let subject = '';
        let url = '';
        let html = '';
        if (type === 'verification') {
            subject = 'Verify Your Email Address';
            url = `${clientUrl}/nosql/verify?token=${token}`;
            html = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${url}" target="_blank">Verify Email</a>
      `;
        }
        else if (type === 'update') {
            subject = 'Confirm Your Profile Update';
            url = `${clientUrl}/nosql/update-profile?token=${token}`;
            html = `
        <h1>Profile Update Confirmation</h1>
        <p>Please click the link below to confirm your profile update:</p>
        <a href="${url}" target="_blank">Confirm Update</a>
      `;
        }
        else if (type === 'deletion') {
            subject = 'Confirm Account Deletion';
            url = `${clientUrl}/nosql/delete-account?token=${token}`;
            html = `
        <h1>Account Deletion Confirmation</h1>
        <p>Please click the link below to confirm your account deletion:</p>
        <a href="${url}" target="_blank">Confirm Deletion</a>
      `;
        }
        yield transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject,
            html
        });
        console.log(`${type} email sent to ${email}`);
    }
    catch (error) {
        console.error(`Error sending ${type} email:`, error);
        throw new Error(`Failed to send ${type} email`);
    }
});
exports.sendEmail = sendEmail;
