const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/buy', async (req, res) => {
  const { email, symbol, amount } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });
  if (user.balance < amount) return res.status(400).json({ error: "موجودی کافی نیست" });
  user.balance -= amount;
  await user.save();
  res.json({ message: `خرید ${symbol} انجام شد`, balance: user.balance });
});

router.post('/sell', async (req, res) => {
  const { email, symbol, amount } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });
  user.balance += amount;
  await user.save();
  res.json({ message: `فروش ${symbol} انجام شد`, balance: user.balance });
});

module.exports = router;