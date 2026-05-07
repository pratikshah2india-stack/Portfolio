const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const PublicUser = require('../models/PublicUser');
const { sendOTP, sendPasswordResetOTP } = require('../utils/email');

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// POST /api/user/register
router.post('/register', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    let user = await PublicUser.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user) {
      // Update existing unverified user
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      user = await PublicUser.create({ name, email, password: hashedPassword, otp, otpExpiry });
    }

    // Send OTP email
    try {
      await sendOTP(email, name, otp);
      console.log(`📧 OTP sent to ${email}: ${otp}`);
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
      // Still log OTP for dev testing even if email fails
      console.log(`🔐 DEV OTP for ${email}: ${otp}`);
    }

    res.status(201).json({ message: 'OTP sent to your email. Please verify.', email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/user/verify-otp
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit OTP'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp } = req.body;
  try {
    const user = await PublicUser.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified. Please login.' });

    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Email verified successfully!', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/user/resend-otp
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await PublicUser.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified.' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTP(email, user.name, otp);
    } catch {
      console.log(`🔐 DEV OTP for ${email}: ${otp}`);
    }

    res.json({ message: 'New OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/user/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await PublicUser.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first.', needsVerification: true, email });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/user/forgot-password  — send reset OTP
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;
  try {
    const user = await PublicUser.findOne({ email });
    // Always return 200 to prevent email enumeration
    if (!user || !user.isVerified) {
      return res.json({ message: 'If that email is registered, a reset OTP has been sent.' });
    }

    const otp = generateOTP();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    try {
      await sendPasswordResetOTP(email, user.name, otp);
      console.log(`📧 Reset OTP sent to ${email}`);
    } catch {
      console.log(`🔐 DEV Reset OTP for ${email}: ${otp}`);
    }

    res.json({ message: 'If that email is registered, a reset OTP has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/user/reset-password  — verify OTP and set new password
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp, password } = req.body;
  try {
    const user = await PublicUser.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.resetOtp || user.resetOtp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    if (new Date() > user.resetOtpExpiry) return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: '✅ Password reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
