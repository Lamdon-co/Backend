import nodemailer from "nodemailer";

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate a 6-digit code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit random code
};

// Send email
export const sendVerificationEmail = async (email: string, verificationCode: string) => {
  await transporter.sendMail({
    from: `"No Reply" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification",
    text: `Your verification code is ${verificationCode}`,
  });
};
