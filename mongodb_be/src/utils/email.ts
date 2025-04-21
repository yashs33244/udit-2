import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

type EmailType = 'verification' | 'update' | 'deletion';

interface EmailOptions {
  email: string;
  token: string;
  type: EmailType;
}

export const sendEmail = async ({ email, token, type }: EmailOptions): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
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
    } else if (type === 'update') {
      subject = 'Confirm Your Profile Update';
      url = `${clientUrl}/nosql/update-profile?token=${token}`;
      html = `
        <h1>Profile Update Confirmation</h1>
        <p>Please click the link below to confirm your profile update:</p>
        <a href="${url}" target="_blank">Confirm Update</a>
      `;
    } else if (type === 'deletion') {
      subject = 'Confirm Account Deletion';
      url = `${clientUrl}/nosql/delete-account?token=${token}`;
      html = `
        <h1>Account Deletion Confirmation</h1>
        <p>Please click the link below to confirm your account deletion:</p>
        <a href="${url}" target="_blank">Confirm Deletion</a>
      `;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html
    });

    console.log(`${type} email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending ${type} email:`, error);
    throw new Error(`Failed to send ${type} email`);
  }
}; 