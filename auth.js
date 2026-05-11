const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "ایمیل قبلاً ثبت شده" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = Math.random().toString(36).substring(2, 8);

    const user = new User({ email, password: hashedPassword, referralCode });
    await user.save();

    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    await sendEmail(email, `کد تأیید شما: ${verifyCode}`);

    const token = jwt.sign({ email, verifyCode }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ message: "ثبت‌نام انجام شد. کد تأیید ارسال شد.", token });
  } catch (err) {
    res.status(500).json({ error: "خطا در ثبت‌نام" });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { token, code } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.verifyCode == code) {
      const user = await User.findOne({ email: decoded.email });
      user.verified = true;
      await user.save();
      res.json({ message: "ایمیل تأیید شد" });
    } else {
      res.status(400).json({ error: "کد تأیید اشتباه است" });
    }
  } catch {
    res.status(500).json({ error: "خطا در تأیید" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "رمز اشتباه" });
    if (!user.verified) return res.status(403).json({ error: "ایمیل تأیید نشده" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: "ورود موفق", token, balance: user.balance });
  } catch {
    res.status(500).json({ error: "خطا در ورود" });
  }
});

async function sendEmail(to, text) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject: "تأیید حساب", text });
}

module.exports = router;