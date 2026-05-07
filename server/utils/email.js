const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (to, name, otp) => {
  await transporter.sendMail({
    from: `"Kailash Prasad Shah Portfolio" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Your Email Verification OTP',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:auto;background:#0a0a0f;border:1px solid #1e1e2e;border-radius:16px;padding:2.5rem;color:#f1f5f9;">
        <h2 style="margin:0 0 0.5rem;background:linear-gradient(135deg,#a78bfa,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Verify Your Email</h2>
        <p style="color:#94a3b8;margin-bottom:1.5rem;">Hi <strong style="color:#f1f5f9">${name}</strong>, thanks for signing up!</p>
        <p style="color:#94a3b8;margin-bottom:1rem;">Your One-Time Password (OTP):</p>
        <div style="background:#12121a;border:2px solid #7c3aed;border-radius:12px;padding:1.25rem;text-align:center;font-size:2.5rem;font-weight:900;letter-spacing:0.75rem;color:#a78bfa;margin-bottom:1.5rem;">${otp}</div>
        <p style="color:#64748b;font-size:0.85rem;">⏱ This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #1e1e2e;margin:1.5rem 0;" />
        <p style="color:#64748b;font-size:0.78rem;">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetOTP = async (to, name, otp) => {
  await transporter.sendMail({
    from: `"Kailash Prasad Shah Portfolio" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔑 Password Reset OTP',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:auto;background:#0a0a0f;border:1px solid #1e1e2e;border-radius:16px;padding:2.5rem;color:#f1f5f9;">
        <h2 style="margin:0 0 0.5rem;background:linear-gradient(135deg,#a78bfa,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Reset Your Password</h2>
        <p style="color:#94a3b8;margin-bottom:1.5rem;">Hi <strong style="color:#f1f5f9">${name}</strong>, we received a request to reset your password.</p>
        <p style="color:#94a3b8;margin-bottom:1rem;">Your Password Reset OTP:</p>
        <div style="background:#12121a;border:2px solid #7c3aed;border-radius:12px;padding:1.25rem;text-align:center;font-size:2.5rem;font-weight:900;letter-spacing:0.75rem;color:#a78bfa;margin-bottom:1.5rem;">${otp}</div>
        <p style="color:#64748b;font-size:0.85rem;">⏱ This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #1e1e2e;margin:1.5rem 0;" />
        <p style="color:#64748b;font-size:0.78rem;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTP, sendPasswordResetOTP };
