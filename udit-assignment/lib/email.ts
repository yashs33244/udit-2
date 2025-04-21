import nodemailer from 'nodemailer';

type EmailType = "verification" | "update" | "deletion"

interface SendVerificationEmailProps {
  email: string
  token: string
  type: EmailType
  database: "sql" | "nosql"
}

export async function sendVerificationEmail({ email, token, type, database }: SendVerificationEmailProps) {
  // In a real application, you would use a proper email service
  // For demo purposes, we'll just log the email content

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  let subject = ""
  let text = ""
  let html = ""

  switch (type) {
    case "verification":
      subject = "Verify Your Account"
      text = `Please verify your account by clicking this link: ${baseUrl}/${database}/verify?token=${token}`
      html = `
        <h1>Verify Your Account</h1>
        <p>Please verify your account by clicking the link below:</p>
        <a href="${baseUrl}/${database}/verify?token=${token}">Verify Account</a>
      `
      break
    case "update":
      subject = "Confirm Account Update"
      text = `Please confirm your account update by clicking this link: ${baseUrl}/${database}/confirm-update?token=${token}`
      html = `
        <h1>Confirm Account Update</h1>
        <p>Please confirm your account update by clicking the link below:</p>
        <a href="${baseUrl}/${database}/confirm-update?token=${token}">Confirm Update</a>
      `
      break
    case "deletion":
      subject = "Confirm Account Deletion"
      text = `Please confirm your account deletion by clicking this link: ${baseUrl}/${database}/confirm-deletion?token=${token}`
      html = `
        <h1>Confirm Account Deletion</h1>
        <p>Please confirm your account deletion by clicking the link below:</p>
        <a href="${baseUrl}/${database}/confirm-deletion?token=${token}">Confirm Deletion</a>
      `
      break
  }

  // Log email details to console for debugging
  console.log(`
    To: ${email}
    Subject: ${subject}
    Text: ${text}
    HTML: ${html}
    Database: ${database}
  `)

  // Send actual email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      secure: process.env.EMAIL_SERVER_PORT === "465", // true for 465, false for other ports
    });
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      text,
      html,
    });
    
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
