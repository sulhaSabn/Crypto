const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/top', async (req, res) => {
  try {
    const response = await axios.get("https://api.binance.com/api/v3/ticker/price");
    const data = response.data;
    const topCoins = ["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","