const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/deposit', async (req, res) => {
  const { email, amount } = req.body;
  if (amount < 100) return res.status(400).json({ error: "حداقل واریز 100 USDT" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });
  user.balance += amount;
  await user.save();
  res.json({ message: "واریز انجام شد", balance: user.balance });
});

router.post('/withdraw', async (req, res) => {
  const { email, amount } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });
  if (amount < 500) return res.status(400).json({ error: "حداقل برداشت 500 USDT" });
  if (user.balance - amount < 100) return res.status(400).json({ error: "باید 100 USDT باقی بماند" });
  const tax = amount * 0.1;
  const finalAmount = amount - tax;
  user.balance -= amount;
  await user.save();
  res.json({ message: "برداشت موفق", withdrawn: finalAmount, tax, balance: user.balance });
});

router.get('/balance/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });
  res.json({ balance: user.balance });
});

module.exports = router;